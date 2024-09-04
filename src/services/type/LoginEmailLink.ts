import { UserModel } from './User'
import { WalletModel } from './Wallet'

type SSOCredential = {
  accessToken: string
  idToken?: string
  refreshToken?: string
  providerId?: string
  expiresIn?: number
  tokenType?: string
  scope?: string
}

export type ValidationResult = {
  success: boolean
  newAccount: boolean
  customToken: string
  ssoCredential: SSOCredential
  error?: string
  user?: UserModel
  walletList?: WalletModel[]
}
