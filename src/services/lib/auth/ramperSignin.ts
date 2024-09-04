import {getFirebaseUser, isFirebaseSignIn, ramperSignUp} from '.'
import {defaultConfig} from '../../constants/defaultConfig'
import {walletServiceForChain} from '../../service/walletServiceForChain'
import {updateWalletIfNeeded} from '../firebase/services/updateWalletIfNeeded'
import usersService from '../firebase/services/users-service'
import walletKeysService from '../firebase/services/wallet-keys-service'
import walletsService from '../firebase/services/wallets-service'
import _ from 'lodash'

export const ramperSignIn = async (mnemonic = '') => {
  if (!isFirebaseSignIn()) {
    throw new Error('need firebase auth')
  }
  const firebaseUser = getFirebaseUser()!
  usersService.updateFirestore()
  walletsService.updateFirestore()
  walletKeysService.updateFirestore()

  const {chainName} = defaultConfig
  const [userModel, walletModel, idToken] = await Promise.all([
    usersService.getUser(firebaseUser.uid, true),
    walletsService.getUserWallets(firebaseUser.uid, true),
    firebaseUser.getIdToken(true)
  ])

  if (_.isEmpty(userModel)) {
    return await ramperSignUp(mnemonic)
  } else {
    const isWalletExist = await walletsService.isWalletExist(firebaseUser.uid, chainName)
    if (!isWalletExist) {
      const walletService = walletServiceForChain(chainName)
      const wallet = await walletService.obtainNewWallet(firebaseUser, userModel, idToken, mnemonic)
      return wallet
    } else {
      const user = await updateWalletIfNeeded(firebaseUser, walletModel, idToken)
      return user
    }
  }
}

export const ramperCheckWallet = async () => {
  if (!isFirebaseSignIn()) {
    throw new Error('need firebase auth')
  }
}
