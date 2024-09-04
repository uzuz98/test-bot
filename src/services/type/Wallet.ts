export type WalletModel = {
  blockchain: string
  walletId: string
  publicKey: string
  creationDate: number // UTC Epoch
  privateKey?: string
  provider?: string
  version?: number
}

export type Wallet = {
  getAddress: () => string
} & WalletModel

export const Wallet = (wallet: WalletModel): Wallet => {
  return {
    ...wallet,
    getAddress: () => wallet.publicKey
  }
}
