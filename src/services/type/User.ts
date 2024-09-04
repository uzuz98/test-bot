import { WalletModel } from '.'

export type UserModel = {
  UID: string
  signupSource: string
  notificationPreference?: string
  email?: string
  preferredCommunicationMethod?: string
  region?: string
}

export type RamperCredential = {
  accessToken?: string
  idToken?: string
  refreshToken?: string
}

export type User = {
  wallets: Record<string, WalletModel>
  ramperCredential?: RamperCredential
} & UserModel

export const User = (user: UserModel, walletModels: WalletModel[]): User => {
  return {
    ...user,
    wallets: walletModels?.reduce(
      (acc, item) => ((acc[item.blockchain] = item), acc),
      {} as Record<string, WalletModel>
    )
  }
}
