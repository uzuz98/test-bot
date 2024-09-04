import { deriveShare, recoverMnemonic, splitMnemonic } from '@coin98-com/ramper-core'
import crypto from 'crypto-js'
import { User } from 'firebase/auth'
import { WriteBatch, writeBatch } from 'firebase/firestore'

import { defaultConfig } from '../constants/defaultConfig'
import { AWSRoutableResource } from '../controllers/LocationRoutingController'
import { firestore } from '../lib/firebase/firestore'
import walletKeysService, {
  MULTI_FI_WALLET_KEY_VERSION,
  MULTI_REGION_SYMMETRIC_KEY_VERSION,
  PERFORMANT_UPDATE_KEY_VERSION,
  WalletKeysService,
  isKeyVersion,
  isMinimumKeyVersion
} from '../lib/firebase/services/wallet-keys-service'
import walletsService, { WalletsService } from '../lib/firebase/services/wallets-service'
import { KMS } from '../lib/kms/kms'
import { KMSAwsAlpha } from '../lib/kms/kmsAwsAlpha'
import { KMSAwsV1 } from '../lib/kms/kmsAwsV1'
import { KMSAwsV1_1 } from '../lib/kms/kmsAwsV1_1'
import { SimpleEncryptor, decrypt } from '../lib/kms/simpleEncryptor'
import { AsyncStorage } from '../lib/locaforage'
import { UserModel, WalletKeyModel, WalletModel } from '../type'
import { BaseAdapterRamper } from './API'
import { Key } from '../key'

export interface TxData {}

export interface SignedTx {
  msgs: any
  network?: string
}

export interface BroadcastResult {}

export interface SendTxData {}

export interface WalletFragment {
  fragment: string
  index: number
}

export abstract class WalletService {
  abstract WALLET_CHAIN_KEY: string
  abstract WALLET_KEY_VERSION: number

  async createWalletModels({
    firebaseUser,
    accAddress,
    bPrivateKey,
    creationDate,
    kmsInstance
  }: {
    firebaseUser: User
    accAddress: string
    bPrivateKey: Uint8Array
    creationDate?: number
    kmsInstance?: KMS
  }) {
    kmsInstance = kmsInstance || (await this.initializeKMS(firebaseUser, await firebaseUser.getIdToken()))

    const walletId = this.WALLET_CHAIN_KEY + '-' + this.WALLET_KEY_VERSION + '-' + '_' + accAddress
    const newWallet: WalletModel = {
      blockchain: this.WALLET_CHAIN_KEY,
      walletId,
      publicKey: accAddress,
      creationDate: !creationDate ? Date.now() : creationDate,
      version: this.WALLET_KEY_VERSION
    }

    const encrypted = new SimpleEncryptor().encrypt(bPrivateKey)
    const newWalletKey: WalletKeyModel = {
      walletId,
      dek: await kmsInstance.encrypt(encrypted.dek),
      encryptedKey: encrypted.cipher,
      version: this.WALLET_KEY_VERSION,
      fiUri: kmsInstance.identityRoute.resourceUri
    }
    return {
      wallet: newWallet,
      walletKey: newWalletKey
    }
  }

  async saveWallet({
    firebaseUser,
    user,
    accAddress,
    bPrivateKey,
    creationDate,
    walletsServiceInstance,
    walletKeysServiceInstance,
    writeBatchMock,
    kmsInstance
  }: {
    firebaseUser: User
    user: UserModel
    accAddress: string
    bPrivateKey: Uint8Array
    creationDate?: number
    walletsServiceInstance?: WalletsService
    walletKeysServiceInstance?: WalletKeysService
    writeBatchMock?: WriteBatch
    kmsInstance?: KMS
  }): Promise<WalletModel> {
    walletsServiceInstance = walletsServiceInstance || walletsService
    walletKeysServiceInstance = walletKeysServiceInstance || walletKeysService
    const { wallet, walletKey } = await this.createWalletModels({
      firebaseUser,
      accAddress,
      bPrivateKey,
      creationDate,
      kmsInstance
    })

    const batch = writeBatchMock || writeBatch(firestore)
    const [walletListKey, walletListFirestore] = await walletsServiceInstance.getUpdateWalletListReference(
      user.UID,
      wallet
    )
    const [walletKeyFirestoreKey, walletKeyFirestore] = walletKeysServiceInstance.getWalletKeyReference(
      user.UID,
      walletKey.walletId,
      walletKey
    )
    batch.set(walletListKey, walletListFirestore)
    batch.set(walletKeyFirestoreKey, walletKeyFirestore)
    await batch.commit()
    walletsService.updateCache(user.UID, walletListFirestore.walletList)

    return wallet
  }

  async loadWallet(firebaseUID: string, walletIndex: number = 0): Promise<[WalletModel | null, number]> {
    const wallets = await walletsService.getUserWallets(firebaseUID)

    const filteredWallets = wallets.filter((x) => x.blockchain === this.WALLET_CHAIN_KEY)
    if (filteredWallets.length === 0) {
      return [null, walletIndex]
    }

    return [filteredWallets[!walletIndex ? 0 : walletIndex], wallets.length]
  }

  /** Initializes the Latest KMS Version */
  async initializeKMS(
    firebaseUser: User,
    idToken: string,
    identityRoute?: AWSRoutableResource,
    kmsRoute?: AWSRoutableResource
  ): Promise<KMS> {
    return new KMSAwsV1_1(
      firebaseUser,
      idToken,
      identityRoute ?? (await KMSAwsV1_1.getIdentityPoolRoute()),
      kmsRoute ?? (await KMSAwsV1_1.getKMSRoute())
    )
  }

  async loadWalletKey(user: UserModel, wallet: WalletModel): Promise<WalletKeyModel> {
    const keyInfo = await walletKeysService.getWalletKey(user.UID, wallet.walletId)
    return keyInfo
  }

  async decryptWalletKey(firebaseUser: User, walletKey: WalletKeyModel, idToken?: string): Promise<string> {
    let kms
    if (isKeyVersion(walletKey, PERFORMANT_UPDATE_KEY_VERSION)) {
      kms = new KMSAwsAlpha(
        firebaseUser,
        idToken ?? (await firebaseUser.getIdToken()),
        await KMSAwsAlpha.getIdentityPoolRoute(),
        await KMSAwsAlpha.getKMSRoute()
      )
    } else if (!isMinimumKeyVersion(walletKey, MULTI_REGION_SYMMETRIC_KEY_VERSION)) {
      const isMultiregion = isMinimumKeyVersion(walletKey, MULTI_FI_WALLET_KEY_VERSION)
      let identityPoolRoute = walletKey.fiUri
        ? KMSAwsV1.findResourceByFiUri(walletKey.fiUri) ?? (await KMSAwsV1.getIdentityPoolRoute(isMultiregion))
        : await KMSAwsV1.getIdentityPoolRoute(isMultiregion)
      kms = new KMSAwsV1(
        firebaseUser.uid,
        idToken ?? (await firebaseUser.getIdToken()),
        identityPoolRoute,
        await KMSAwsV1.getKMSRoute(isMultiregion)
      )
    } else {
      let identityPoolRoute = KMSAwsV1_1.findResourceByFiUri(walletKey.fiUri!)
      kms = await this.initializeKMS(
        firebaseUser,
        idToken ?? (await firebaseUser.getIdToken()),
        identityPoolRoute,
        await KMSAwsV1_1.getKMSRoute()
      )
    }
    const decryptedDek = await kms.decrypt(walletKey.dek)

    if (isKeyVersion(walletKey, PERFORMANT_UPDATE_KEY_VERSION)) {
      const buff = Buffer.from(decryptedDek)
      const bDEK = new Uint8Array(buff)
      return decrypt(walletKey.encryptedKey, new TextDecoder().decode(Buffer.from(bDEK)), 1000)
    } else {
      const bPrivateKey = new SimpleEncryptor().decrypt(walletKey.encryptedKey, decryptedDek)
      return new TextDecoder().decode(Buffer.from(bPrivateKey))
    }
  }

  async saveLocalKey(bKey: string, uid: string) {
    await AsyncStorage.setValue(uid, bKey)
  }

  async getLocalKey(uid: string) {
    return await AsyncStorage.getValue(uid)
  }

  async decryptMnemonic(walletFragment: WalletFragment[], uid: string): Promise<string> {
    const sharedKey = walletFragment.sort((a, b) => a.index - b.index)
    const sharefragments = sharedKey.map((item, idx) => {
      return {
        x: (item.index + 1).toString(),
        y: Buffer.from(item.fragment, 'hex'),
        z: Buffer.from('0')
      }
    })
    const listIndex = sharedKey.map((item, idx) => item.index)
    const fragmentUse = [0, 1, 2].find((item) => listIndex.indexOf(item) === -1)
    if (fragmentUse === 0) {
      const recoverFragment0 = deriveShare(sharefragments, 1)
      AsyncStorage.setValue(uid, Buffer.from(recoverFragment0.y).toString('hex'))
    }

    const mnemonic = recoverMnemonic(sharefragments)
    return mnemonic
  }

  async obtainNewWallet(firebaseUser: User, user: UserModel, idToken?: string, newMnemonic?: string) {
    const { chainName } = defaultConfig
    const generateMnemonic = newMnemonic || Key.generateMnemonic(false)
    const generatedPhrase = generateMnemonic.split(' ')
    const params = {
      name: 'ramper',
      chain: chainName,
      mnemonic: generatedPhrase.join(' ').toLowerCase()
    }
    const [address, bPrivateKey, mnemonic] = await this.createNewWallet(params)
    const logsWallet = splitMnemonic(mnemonic, 3, 2, user.UID).map((frag) => Buffer.from(frag.y).toString('hex'))
    const [aFragment, bFragment, cFragment] = logsWallet
    const newBPrivateKey = new TextEncoder().encode(bFragment)
    
    this.saveWallet({
      firebaseUser,
      user,
      accAddress: address,
      bPrivateKey: newBPrivateKey,
      kmsInstance: await this.initializeKMS(firebaseUser, idToken ?? (await firebaseUser.getIdToken()))
    })

    await AsyncStorage.setValue(user.UID, aFragment)
    await BaseAdapterRamper.post('fragment', {
      id: user.UID,
      fragment: crypto.AES.encrypt(cFragment, user.UID).toString(),
      address: address
    })

    
    return {
      address,
      bPrivateKey,
      cKey: logsWallet[2],
      mnemonic
    }
  }

  abstract createNewWallet(params: any): Promise<[string, Uint8Array, string]>
  abstract signTransactionImpl(
    firebaseUser: User,
    storedKey: WalletKeyModel,
    tx: TxData,
    idToken?: string
  ): Promise<SignedTx>
  abstract broadcastSync(tx: SignedTx): BroadcastResult

  abstract buildSendTx(tx: SendTxData): TxData
}
