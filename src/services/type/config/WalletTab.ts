export type WalletTab = (typeof WALLET_TABS)[keyof typeof WALLET_TABS]

export const WALLET_TABS = {
  COIN: 'COIN',
  NFT: 'NFT'
} as const
