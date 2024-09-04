export type Language = (typeof LANGUAGE)[keyof typeof LANGUAGE]

export const LANGUAGE = {
  EN: 'en',
  KR: 'kr'
} as const
