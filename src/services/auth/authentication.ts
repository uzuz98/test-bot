import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  OAuthProvider,
  TwitterAuthProvider,
  fetchSignInMethodsForEmail,
  signInWithCredential,
  signOut
} from 'firebase/auth'
import { get } from 'lodash'

import { errorMessages } from '../constants'
import { defaultConfig } from '../constants/defaultConfig'
import { auth as authSDK, completeEmailLogin, getFirebaseUser, ramperSignIn } from '../lib/auth'
import usersService from '../lib/firebase/services/users-service'
import walletKeysService from '../lib/firebase/services/wallet-keys-service'
import walletsService from '../lib/firebase/services/wallets-service'
import { AUTH_PROVIDER, AuthProvider } from '../type'

interface IParamsSignIn {
  provider: AuthProvider
  idToken: string // with case login with invite link from email, get from link invite email user input (pendingToken)
  email?: string // with case login with invite link from email
  transactionId?: string // transaction id get from link invite email user input
  appId?: string // appId get from link invite email user input
  isRedirect?: boolean
  nonce?: string
  mnemonic?: string
}

export const getAuthProvider = (provider: string, isRedirect: boolean = false) => {
  let authProvider
  if (isRedirect) {
    switch (provider) {
      case AUTH_PROVIDER.GOOGLE:
        return GoogleAuthProvider
      case AUTH_PROVIDER.FACEBOOK:
        return FacebookAuthProvider
      case AUTH_PROVIDER.TWITTER:
        return TwitterAuthProvider
    }
  }
  if (provider === AUTH_PROVIDER.GOOGLE) {
    authProvider = new GoogleAuthProvider()
  } else if (provider === AUTH_PROVIDER.APPLE) {
    authProvider = new OAuthProvider('apple.com')
  } else if (provider === AUTH_PROVIDER.TWITTER) {
    authProvider = new TwitterAuthProvider()
  } else if (provider === AUTH_PROVIDER.FACEBOOK) {
    authProvider = new FacebookAuthProvider()
  } else {
    throw new Error(errorMessages.notSupported(provider))
  }

  return authProvider
}

export const firebaseSignOut = async () => {
  await signOut(authSDK)
}

export const handleGetEmailSignIn = async (paramSignIn: IParamsSignIn) => {
  const { provider, idToken, isRedirect } = paramSignIn
  const authProvider = getAuthProvider(provider, isRedirect)
  const data = await signInWithCredential(authSDK, authProvider.credential(idToken, null))
  return get(data, '_tokenResponse')
}

export const handleSignIn = async (paramSignIn: IParamsSignIn) => {
  try {
    const { provider, idToken, isRedirect, transactionId, appId, nonce, mnemonic = '' } = paramSignIn
    if (provider === AUTH_PROVIDER.EMAIL) {
      await completeEmailLogin({
        transactionId,
        pendingToken: idToken,
        appId,
        auth: authSDK
      })
      // return credentials
      const user = await ramperSignIn(mnemonic)
      return {
        ...user
      }
    }
    //sign-in with apple (IOS only)
    if (provider === AUTH_PROVIDER.APPLE) {
      const authProvider = getAuthProvider(provider, isRedirect)
      authProvider.addScope('email')
      authProvider.addScope('name')
      authProvider.addScope('displayName')
      authProvider.addScope('photoURL')
      const credential = authProvider.credential({
        idToken: idToken,
        rawNonce: nonce
      })
      const data = await signInWithCredential(authSDK, credential)

      const user = await ramperSignIn(mnemonic)
      return {
        ...user,
        // @ts-ignore
        email: data?._tokenResponse && data._tokenResponse.email
      }
    }
    const authProvider = getAuthProvider(provider, isRedirect)
    const data = await signInWithCredential(authSDK, authProvider.credential(idToken, null))
    const user = await ramperSignIn(mnemonic)

      if(provider === AUTH_PROVIDER.FACEBOOK) {
      // @ts-ignore
      const userInfo = JSON.parse(data?._tokenResponse?.rawUserInfo || '{}')
      return {
        ...user,
        email: userInfo?.name,
        rawId: userInfo?.id
      }
    }

    return {
      ...user,
      // @ts-ignore
      email: data?._tokenResponse && (data._tokenResponse.email || data._tokenResponse.displayName)
    }
  } catch (error) {
    const { provider, isRedirect } = paramSignIn

    if (error.code === 'auth/account-exists-with-different-credential') {
      const authProvider = getAuthProvider(provider, isRedirect)
      const email = error?.customData._tokenResponse.email
      const getListPossible = await fetchSignInMethodsForEmail(authSDK, email)
    }
  }
}

export const handleCheckWallet = async (paramSignIn: IParamsSignIn) => {
  try {
    const { provider, idToken, isRedirect, transactionId, appId, nonce } = paramSignIn
    if (provider === AUTH_PROVIDER.EMAIL) {
      const firebaseUser = getFirebaseUser()!
      usersService.updateFirestore()
      walletsService.updateFirestore()
      walletKeysService.updateFirestore()
      const { chainName } = defaultConfig
      const userModel = await usersService.getUser(firebaseUser.uid, true)
      if (!userModel) return false
      const isWalletExist = await walletsService.isWalletExist(firebaseUser.uid, chainName)
      return isWalletExist
    }
    //sign-in with apple (IOS only)
    if (provider === AUTH_PROVIDER.APPLE) {
      const authProvider = getAuthProvider(provider, isRedirect)
      authProvider.addScope('email')
      authProvider.addScope('name')
      authProvider.addScope('displayName')
      authProvider.addScope('photoURL')
      const credential = authProvider.credential({
        idToken: idToken,
        rawNonce: nonce
      })
      const data = await signInWithCredential(authSDK, credential)
      const firebaseUser = getFirebaseUser()!
      usersService.updateFirestore()
      walletsService.updateFirestore()
      walletKeysService.updateFirestore()
      const { chainName } = defaultConfig
      const userModel = await usersService.getUser(firebaseUser.uid, true)
      if (!userModel) return false
      const isWalletExist = await walletsService.isWalletExist(firebaseUser.uid, chainName)
      return isWalletExist
    }
    const authProvider = getAuthProvider(provider, isRedirect)
    const data = await signInWithCredential(authSDK, authProvider.credential(idToken, null))
    const firebaseUser = getFirebaseUser()!
    usersService.updateFirestore()
    walletsService.updateFirestore()
    walletKeysService.updateFirestore()
    const { chainName } = defaultConfig
    const userModel = await usersService.getUser(firebaseUser.uid, true)
    if (!userModel) return false
    const isWalletExist = await walletsService.isWalletExist(firebaseUser.uid, chainName)
    return isWalletExist
  } catch (error) {
    const { provider, isRedirect } = paramSignIn

    if (error.code === 'auth/account-exists-with-different-credential') {
      const authProvider = getAuthProvider(provider, isRedirect)
      const email = error?.customData._tokenResponse.email
      const getListPossible = await fetchSignInMethodsForEmail(authSDK, email)
    }
  }
}

export const credentialsEmailLogin = async (paramSignIn: IParamsSignIn) => {
  try {
    const { provider, idToken, isRedirect, transactionId, appId, nonce, mnemonic = '' } = paramSignIn
    if (provider === AUTH_PROVIDER.EMAIL) {
      const credentials = await completeEmailLogin({
        transactionId,
        pendingToken: idToken,
        appId,
        auth: authSDK
      })
      const isWalletExist = await handleCheckWallet(paramSignIn)
      return {
        isWalletExist,
        isVerified: credentials.success
      }
    }
  } catch (e) {}
}
