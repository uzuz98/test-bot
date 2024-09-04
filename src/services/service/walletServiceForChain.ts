import { WalletService } from './walletService'
import { ethWalletService } from './evm/evmWalletService'
import { CHAIN } from '../type'

export const walletServiceForChain = (chainName: string): WalletService => {
  if (chainName === CHAIN.ETHEREUM) {
    return ethWalletService
  }

  throw Error('Invalid chain name ' + chainName)
}
