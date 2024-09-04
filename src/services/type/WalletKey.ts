/**
 * Version Change Log:
 *
 * 2: Switched from raw privateKey in terra to mnemonic key.
 * before 2: version does not exist.
 */

export type WalletKeyModel = {
  walletId: string
  dek: Uint8Array
  encryptedKey: string
  version?: number
  fiUri?: string
}
