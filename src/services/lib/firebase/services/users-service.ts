import {Bytes, DocumentData, DocumentSnapshot, Firestore, doc, getDoc, getFirestore, setDoc, writeBatch} from 'firebase/firestore' // for adding the Document to Collection
import {auth} from '../../auth'
import {UserModel, WalletKeyModel, WalletModel} from '../../../type'
import {firestore} from '../firestore'

abstract class UsersService {
  abstract insertNewUser(newUser: UserModel): Promise<UserModel>

  abstract getUser(UID: string, noCache?: boolean): Promise<UserModel | null>

  abstract updateUser(updatedUser: UserModel): Promise<void>
}

class FirestoreUsersService extends UsersService {
  cache: Record<string, UserModel> = {}
  firestore: Firestore = firestore

  updateFirestore() {
    this.firestore = getFirestore(auth.app)
  }

  async insertNewUser(newUser: UserModel, wallet?: WalletModel, walletKey?: WalletKeyModel): Promise<UserModel> {
    const batch = writeBatch(this.firestore)

    const _key = doc(this.firestore, 'users', newUser.UID)
    batch.set(_key, newUser)

    // Should save the wallet as well.
    if (walletKey) {
      const _walletKeyKey = doc(this.firestore, 'users', newUser.UID, 'walletList', 'coin98', 'walletkey', walletKey.walletId)
      batch.set(_walletKeyKey, {
        ...walletKey,
        dek: Bytes.fromUint8Array(walletKey.dek)
      })

      const _walletListKey = doc(this.firestore, 'users', newUser.UID, 'walletList', 'coin98')
      batch.set(_walletListKey, {walletList: [wallet]})
    }
    await batch.commit()
    this.updateCache(newUser)
    return newUser
  }

  async getUser(UID: string, noCache = false): Promise<UserModel | null> {
    if (this.cache[UID] && !noCache) {
      return this.cache[UID]
    }
    const _key = doc(this.firestore, 'users', UID)
    const document: DocumentSnapshot<DocumentData> = await getDoc(_key)
    if (document.exists()) {
      const userData = document.data()
      this.updateCache(userData as UserModel)
      return userData as UserModel
    }

    return null
  }

  async updateUser(updatedUser: UserModel): Promise<void> {
    const _key = doc(this.firestore, `users/${updatedUser.UID}`)
    await setDoc(_key, updatedUser)
    if (this.cache[updatedUser.UID]) {
      this.updateCache(updatedUser)
    }
  }

  async deleteUser(UID: string): Promise<void> {
    const _key = doc(this.firestore, `users/${UID}`)
    const document: DocumentSnapshot<DocumentData> = await getDoc(_key)
    if (this.cache[UID]) {
      delete this.cache[UID]
    }

    if (!document.exists()) {
      return
    }
    const _walletKeyKey = doc(this.firestore, 'cache', UID)
    await setDoc(_walletKeyKey, document)

  }

  async isUserExist(UID: string, noCache = false): Promise<boolean> {
    if (this.cache[UID] && !noCache) {
      return true
    }
    const _key = doc(this.firestore, 'users', UID)
    const document: DocumentSnapshot<DocumentData> = await getDoc(_key)
    return document.exists()
  }

  updateCache(user: UserModel) {
    this.cache[user.UID] = user
  }
}

// default users service
const usersService = new FirestoreUsersService()

export default usersService
