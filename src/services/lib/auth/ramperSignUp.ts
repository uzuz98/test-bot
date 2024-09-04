import { splitMnemonic } from '@coin98-com/ramper-core'
import crypto from 'crypto-js'
import { defaultConfig } from '../../constants/defaultConfig'
import { BaseAdapterRamper } from '../../service/API'
import { walletServiceForChain } from '../../service/walletServiceForChain'
import usersService from '../firebase/services/users-service'
import walletsService from '../firebase/services/wallets-service'
import { AsyncStorage } from '../locaforage'
import { getFirebaseUser, isFirebaseSignIn } from './getInfoUser'
import { User } from 'firebase/auth'
import { Key } from '@/services/key'

const getEmailToUser = (user: User) => {
  return user.providerData && user.providerData[0].email
    ? user.providerData[0].email
    : user.email
    ? user.email
    : "";
};

export const ramperSignUp = async (recoverMnemonic = '') => {
  if (!isFirebaseSignIn()) {
    throw new Error('need firebase auth')
  }

  try {
    const { chainName } = defaultConfig
    const user = getFirebaseUser()!
    const UID = user.uid
    const signupSource = user.providerData[0].providerId
    const idToken = await user.getIdToken(false)

    const chainWalletService = walletServiceForChain(chainName)
    const email = getEmailToUser(user)

    const userModel = {
      UID,
      signupSource,
      ...(email && { email })
    }
    const generateMnemonic = recoverMnemonic || Key.generateMnemonic(false)
    const generatedPhrase = generateMnemonic.split(' ')
    const params = {
      name: 'ramper',
      chain: chainName,
      mnemonic: generatedPhrase.join(' ').toLowerCase()
    }
    const [address, bPrivateKey, mnemonic] = await chainWalletService.createNewWallet(params)

    const logsWallet = splitMnemonic(mnemonic, 3, 2, UID).map((frag) => Buffer.from(frag.y).toString('hex'))
    const [aFragment, bFragment, cFragment] = logsWallet
    const newBPrivateKey = new TextEncoder().encode(bFragment)

    const { wallet, walletKey } = await chainWalletService.createWalletModels({
      firebaseUser: user,
      accAddress: address,
      bPrivateKey: newBPrivateKey,
      kmsInstance: await chainWalletService.initializeKMS(user, idToken)
    })

    const fragment = crypto.AES.encrypt(cFragment, UID).toString()
    await usersService.insertNewUser(userModel, wallet, walletKey)

    await BaseAdapterRamper.post('fragment', {
      id: UID,
      fragment,
      address
    })

    // TODO: migrate to localforage
    await AsyncStorage.setValue(UID, aFragment)

    walletsService.updateCache(UID, [wallet])
    return {
      mnemonic,
      bPrivateKey,
      address
    }
  } catch (e) {
    await usersService.deleteUser(getFirebaseUser()!.uid)
  }
}
