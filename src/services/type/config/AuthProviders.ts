export type AuthProviders = AuthProvider[]

export type AuthProvider = (typeof AUTH_PROVIDER)[keyof typeof AUTH_PROVIDER]

export const AUTH_PROVIDER = {
  GOOGLE: 'google',
  FACEBOOK: 'facebook',
  APPLE: 'apple',
  TWITTER: 'twitter',
  GITHUB: 'github',
  EMAIL: 'email'
} as const
