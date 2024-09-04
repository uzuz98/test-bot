import { Bytes, doc, DocumentData, DocumentReference, DocumentSnapshot, Firestore, getDoc, getFirestore, setDoc } from 'firebase/firestore' // for adding the Document to Collection
import { firestore } from '../firestore' // firestore instance
import { auth } from '../../auth'
import { errorMessages } from '../../../constants'
import { WalletKeyModel } from '../../../type'

export const PERFORMANT_UPDATE_KEY_VERSION = 3.1

export const NEW_WALLET_ID_KEY_VERSION = 4
// This wallet key supports routing to closer KMS regions.
export const MULTI_FI_WALLET_KEY_VERSION = 6

export const MULTI_REGION_SYMMETRIC_KEY_VERSION = 7
export const CURRENT_WALLET_KEY_VERSION = MULTI_REGION_SYMMETRIC_KEY_VERSION

export const isMinimumKeyVersion = (walletData: WalletKeyFirestoreModel, minimumKeyVersion: number): boolean => {
  return !!walletData && !!walletData.version && walletData.version >= minimumKeyVersion
}

export const isKeyVersion = (walletData: WalletKeyFirestoreModel, keyVersion: number): boolean => {
  return walletData && walletData.version == keyVersion
}

export type WalletKeyFirestoreModel = {
  walletId: string
  dek: string | Bytes | Uint8Array
  encryptedKey: string
  version?: number
  fiUri?: string
}

export abstract class WalletKeysService {
  abstract insertWalletKey(UID: string, walletId: string, newWalletKey: WalletKeyModel): Promise<void>

  abstract getWalletKey(UID: string, walletId: string): Promise<WalletKeyModel>

  abstract getWalletKeyReference(UID: string, walletId: string, newWalletKey: WalletKeyModel): [DocumentReference, WalletKeyFirestoreModel]
  // No updates to perserve previous wallets
}

// We broke type safety in ramper-server with this dek field, so we have to stick with "any"
export const formatDek = (walletData: any) => {
  return (walletData!.dek as Bytes).toUint8Array()
}

export class FirestoreWalletKeysService extends WalletKeysService {
  firestore: Firestore = firestore

  updateFirestore() {
    this.firestore = getFirestore(auth.app)
  }

  getWalletKeyReference(UID: string, walletId: string, newWalletKey: WalletKeyModel): [DocumentReference, WalletKeyFirestoreModel] {
    const _key = doc(this.firestore, 'users', UID, 'walletList', 'coin98', 'walletkey', walletId)
    const walletKey: WalletKeyFirestoreModel = {
      walletId: newWalletKey.walletId,
      dek: Bytes.fromUint8Array(newWalletKey.dek),
      encryptedKey: newWalletKey.encryptedKey,
      version: newWalletKey.version,
      fiUri: newWalletKey.fiUri
    }
    return [_key, walletKey]
  }

  async insertWalletKey(UID: string, walletId: string, newWalletKey: WalletKeyModel): Promise<void> {
    const [_key, toSave] = this.getWalletKeyReference(UID, walletId, newWalletKey)
    await setDoc(_key, toSave)
  }

  async getWalletKey(UID: string, walletId: string): Promise<WalletKeyModel> {
    const _key = doc(this.firestore, 'users', UID, 'walletList', 'coin98', 'walletkey', walletId)
    const document: DocumentSnapshot<DocumentData> = await getDoc(_key)
    const walletsData = document.data() as WalletKeyFirestoreModel

    if (!walletsData) {
      throw new Error(errorMessages.notFound('walletsData'))
    }

    const walletKey: WalletKeyModel = {
      walletId: document.id,
      dek: formatDek(walletsData),
      encryptedKey: walletsData!.encryptedKey
    }
    if (walletsData!.version) {
      walletKey.version = walletsData!.version
    }
    if (walletsData!.fiUri) {
      walletKey.fiUri = walletsData!.fiUri
    }
    return walletKey
  }
}

// default wallets service
const walletKeysService = new FirestoreWalletKeysService()

export default walletKeysService
