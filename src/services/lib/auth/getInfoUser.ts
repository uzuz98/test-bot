import { getAuth } from 'firebase/auth'
import { App } from '../firebase'

export const auth = getAuth(App)
// check user has signed
export const isFirebaseSignIn = () => !!auth.currentUser

// get info user from firebase
export const getFirebaseUser = () => {
  return auth.currentUser
}
