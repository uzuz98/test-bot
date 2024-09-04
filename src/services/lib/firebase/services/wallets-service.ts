import { find, isEmpty, map, pipe, toArray } from '@fxts/core'
import {
  doc,
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  getDoc,
  getFirestore,
  setDoc
} from 'firebase/firestore' // for adding the Document to Collection
import { firestore } from '../firestore' // firestore instance
import { auth } from '../../auth'
import { WalletModel } from '../../../type'

export type WalletListFirestore = {
  walletList: WalletModel[]
}

export abstract class WalletsService {
  abstract insertNewWallet(UID: string, newWallet: WalletModel): Promise<void>

  abstract getUserWallets(UID: string, noCache?: boolean): Promise<WalletModel[]>

  abstract updateWallet(UID: string, updatedWallet: WalletModel): Promise<void>

  abstract getUpdateWalletListReference(
    UID: string,
    updatedWallet: WalletModel
  ): Promise<[DocumentReference, WalletListFirestore]>
}

export class FirestoreWalletsService extends WalletsService {
  cache: Record<string, WalletModel[]> = {}
  firestore: Firestore = firestore

  updateFirestore() {
    this.firestore = getFirestore(auth.app)
  }

  async insertNewWallet(UID: string, newWallet: WalletModel): Promise<void> {
    // TODO (HOA): Protect against wallet deletes from the client side and
    // wallet overrides from hackers. Users do not want to lose all their
    // wallets from an accidental delete or overwrite.
    const _key = doc(this.firestore, 'users', UID, 'walletList', 'coin98')
    const document: DocumentSnapshot<DocumentData> = await getDoc(_key)
    const walletsData = document.data()
    const walletList: WalletModel[] = walletsData?.walletList ?? []
    walletList.push(newWallet)
    await setDoc(_key, {
      walletList
    })
    this.updateCache(UID, walletList)
  }

  async getUserWallets(UID: string, noCache = false): Promise<WalletModel[]> {
    if (this.cache[UID] && !noCache) {
      return this.cache[UID]
    }
    const _key = doc(this.firestore, 'users', UID, 'walletList', 'coin98')
    const document: DocumentSnapshot<DocumentData> = await getDoc(_key)

    if (document.exists()) {
      const walletsData = document.data()
      const walletList: WalletModel[] = walletsData?.walletList ?? []
      if (walletList.length) {
        this.updateCache(UID, walletList)
      }
      return walletList
    }

    return []
  }

  async getUpdateWalletListReference(
    UID: string,
    updatedWallet: WalletModel
  ): Promise<[DocumentReference, WalletListFirestore]> {
    const _key = doc(this.firestore, 'users', UID, 'walletList', 'coin98')
    const document: DocumentSnapshot<DocumentData> = await getDoc(_key)
    const walletsData = document.data()
    const walletList: WalletModel[] = walletsData?.walletList ?? []

    const isNotExist = pipe(
      walletList,
      find(wallet => wallet.publicKey === updatedWallet.publicKey),
      isEmpty
    )

    return [
      _key,
      {
        walletList: isNotExist
          ? [...walletList, updatedWallet]
          : pipe(
              walletList,
              map(wallet =>
                wallet.walletId.indexOf('_' + updatedWallet.publicKey) !== -1
                  ? updatedWallet
                  : wallet
              ),
              toArray
            )
      }
    ]
  }

  async updateWallet(UID: string, updatedWallet: WalletModel): Promise<void> {
    // TODO (HOA): Protect against wallet deletes from the client side and
    // wallet overrides from hackers. Users do not want to lose all their
    // wallets from an accidental delete or overwrite.
    const [_key, walletListFirestore] = await this.getUpdateWalletListReference(UID, updatedWallet)
    await setDoc(_key, walletListFirestore)
    this.updateCache(UID, walletListFirestore.walletList)
  }

  async isWalletExist(UID: string, chainName: string): Promise<boolean> {
    let walletList = this.cache[UID]
    if (!walletList) {
      walletList = await this.getUserWallets(UID)
    }

    return !pipe(
      walletList,
      find(wallet => wallet.blockchain == chainName),
      isEmpty
    )
  }

  updateCache(uid: string, walletList: WalletModel[]) {
    this.cache[uid] = walletList
  }
}

// default wallets service
const walletsService = new FirestoreWalletsService()

export default walletsService
