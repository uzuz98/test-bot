import {v4} from 'uuid'
import {SSO_HOST, SSO_HOST_RAMPER, WALLET_APP_ID, WALLET_RAMPER_ID} from '../../constants'
import {Auth, signInWithCustomToken} from 'firebase/auth'
import axios from 'axios'

type SendResult = {
  success: boolean
  pendingToken?: string
  data: any
}

type LoginEmailLink = {
  transactionId: string
  pendingToken: string
  auth: Auth
  appId?: string
  platform?: string
}

type VerifyCodeEmail = {
  transactionId: string
  appId: string
  verificationCode: string
  platform?: string
}

type VerifyResponse = {
  success: boolean
}

// return pending token to verify email expired
export const sendInviteLink = async (email: string, appId?: string, platform = 'coin98') => {
  const transactionId = v4()
  const newAppId = platform !== 'coin98' ? WALLET_RAMPER_ID : appId || WALLET_APP_ID

  const sendResult: SendResult = await axios.post(`${platform !== 'coin98' ? SSO_HOST_RAMPER : SSO_HOST}/appSend`, {
    appId: newAppId,
    email,
    time: new Date().toLocaleString(undefined, {timeZoneName: 'short'}),
    transactionId,
    lang: 'en',
    partner: 'coin98',
    // redirectSource: window.location.origin + '/',
    redirectSource: 'https://socialwallet.coin98.com/'
  })

  if (sendResult.data.success && sendResult.data.pendingToken) {
    return {
      ...sendResult.data,
      appId: newAppId,
      transactionId
    }
  } else {
    return {
      success: false,
      pendingToken: null,
      ...sendResult.data
    }
  }
}
export const sendInviteLinkV3 = async (email: string, appId?: string, platform = 'coin98', deeplinkDevice = 'coin98://ramper') => {
  const transactionId = v4()
  const newAppId = platform !== 'coin98' ? WALLET_RAMPER_ID : appId || WALLET_APP_ID
  const HOST = platform !== 'coin98' ? SSO_HOST_RAMPER : SSO_HOST
  const pendingToken = await axios.post(
    `${HOST}/pendingToken`,
    {
      transactionId,
      appId: newAppId
    },
    {
      headers: {
        origin: 'coin98.com'
      }
    }
  )
  const sendResult: SendResult = await axios.post(`${HOST}/appSendV3`, {
    appId: newAppId,
    email,
    time: new Date().toLocaleString(undefined, {timeZoneName: 'short'}),
    transactionId,
    pendingToken: pendingToken.data.pendingToken,
    lang: 'en',
    partner: 'coin98',
    deeplinkDevice,
    // redirectSource: window.location.origin + '/',
    redirectSource: 'https://socialwallet.coin98.com/'
  })

  if (sendResult.data.success) {
    return {
      pendingToken: pendingToken.data.pendingToken,
      appId: newAppId,
      transactionId
    }
  } else {
    return {
      success: false,
      pendingToken: null
    }
  }
}

// verify code send from email user input
export const verifyEmail = async ({transactionId, appId, verificationCode, platform = 'coin98'}: VerifyCodeEmail) => {
  const HOST = platform !== 'coin98' ? SSO_HOST_RAMPER : SSO_HOST

  const result = await axios.post(`${HOST}/verify`, {
    timeout: false,
    json: {
      transactionId,
      appId,
      verificationCode
    }
  })
  return result
}

export const completeEmailLogin = async ({transactionId, pendingToken, appId, auth, platform = 'coin98'}: LoginEmailLink) => {
  try {
    const newAppId = platform !== 'coin98' ? WALLET_RAMPER_ID : appId || WALLET_APP_ID

    const HOST = platform !== 'coin98' ? SSO_HOST_RAMPER : SSO_HOST

    const verifyEmail = await axios.post(`${HOST}/checkVerify`, {transactionId})
    if (!verifyEmail.data.success || !verifyEmail.data.validated) {
      throw new Error('Not validated')
    }
    const validationResult = await axios.post(`${HOST}/exchangeToken`, {
      transactionId,
      appId: newAppId,
      pendingToken: pendingToken
    })
    if (validationResult.data.success) {
      await signInWithCustomToken(auth, validationResult.data.customToken)
      return validationResult.data
    } else {
      throw 'login failed'
    }
  } catch (err) {
    throw err
  }
}
