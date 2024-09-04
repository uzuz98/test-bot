export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY]

export const CURRENCY = {
  USD: 'usd'

  // TODO
  // KRW: 'krw'
} as const
