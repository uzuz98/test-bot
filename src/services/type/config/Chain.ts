export type Chain = (typeof CHAIN)[keyof typeof CHAIN]

export const CHAIN = {
  ETHEREUM: 'ethereum',
  TERRA: 'terra',
  NEAR: 'near'
} as const
