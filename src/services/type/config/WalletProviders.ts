export type WalletProviders = WalletProvider[]

export type WalletProvider = (typeof WALLET_PROVIDER)[keyof typeof WALLET_PROVIDER]

export const WALLET_PROVIDER = {
  TERRA_STATION: 'terra_station',
  WALLET_CONNECT: 'wallet_connect',
  METAMASK: 'metamask',
  NEAR_WALLET: 'near_wallet'
} as const
