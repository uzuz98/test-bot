import { splitMnemonic } from '@coin98-com/ramper-core'
import crypto from 'crypto-js'
import { User } from 'firebase/auth'

import { errorMessages } from '../../../constants'
import { BaseAdapterRamper } from '../../../service/API'
import { walletServiceForChain } from '../../../service/walletServiceForChain'
import { CHAIN, WalletModel } from '../../../type'
import { AsyncStorage } from '../../locaforage'
import usersService from './users-service'
import walletKeysService from './wallet-keys-service'

export const updateWalletIfNeeded = async (user: User, walletModels: WalletModel[], idToken: string) => {
  // Only support ethereum updates.
  const walletModel = walletModels.find((wallet) => wallet.blockchain === CHAIN.ETHEREUM)
  if (!walletModel) {
    return
  }
  if (walletModel.blockchain !== CHAIN.ETHEREUM) {
    return
  }

  const userModel = await usersService.getUser(user.uid)
  if (!userModel) {
    throw new Error(errorMessages.notFound('User'))
  }
  const oldWalletKey = await walletKeysService.getWalletKey(userModel.UID, walletModel.walletId)

  const walletService = walletServiceForChain(walletModel.blockchain)

  const walletFragment = []
  const cFragmentDataEncrypt = (await BaseAdapterRamper.get(`fragment/${userModel.UID}`)) as string
    
  // fetch existing wallet
  const cFragmentData = crypto.AES.decrypt(cFragmentDataEncrypt, userModel.UID).toString(crypto.enc.Utf8)
  if (cFragmentData) {
    walletFragment.push({
      fragment: cFragmentData,
      index: 2
    })
  }

  const bFragment = await AsyncStorage.getValue(userModel.UID)

  if (bFragment) {
    walletFragment.push({
      fragment: bFragment,
      index: 0
    })
  }

  if (walletFragment.length < 2) {
    const aFragment = await walletService.decryptWalletKey(user, oldWalletKey, idToken)
    if (aFragment) {
      walletFragment.push({
        fragment: aFragment,
        index: 1
      })
    }
  }

  if (walletFragment.length < 2) {
    throw new Error('no fragment')
  }
  const _mnemonic = await walletService.decryptMnemonic(walletFragment, userModel.UID)
  const logsWallet = splitMnemonic(_mnemonic, 3, 2, user.uid).map((frag) => Buffer.from(frag.y).toString('hex'))
  const bKey = new TextEncoder().encode(logsWallet[1])

  const params = {
    name: 'ramper',
    chain: walletModel.blockchain,
    mnemonic: _mnemonic
  }

  const [address, bPrivateKey, mnemonic] = await walletService.createNewWallet(params)

  return {
    mnemonic,
    address,
    bPrivateKey,
    bKey
  }
}
