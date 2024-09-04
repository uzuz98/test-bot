import { isLive } from '.'

export const OAUTH_URLS = {
  google: `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
    response_type: 'id_token',
    scope: 'openid profile email',
    // client_id: isLive()
    //   ? '897776340259-fqksgtjpo49c4em216lt6tm837klar2l.apps.googleusercontent.com'
    //   : '114789873055-e2sktrogsg2k12rj9lhhvfhpg796ebsf.apps.googleusercontent.com',
    // for SuperApp
    client_id:
      process.env.PLASMO_PUBLIC_GOOGLE_CLIENT_ID ??
      '663197326394-brgh9rdnug8e0nn3tm5ti7p7mp715pk3.apps.googleusercontent.com',
    state: JSON.stringify({
      provider: 'google',
      appId: 'jlaomyagnx'
    })
  })}`,
  facebook: `https://www.facebook.com/v19.0/dialog/oauth?${new URLSearchParams({
    response_type: 'token',
    scope: 'email public_profile',
    display: 'popup',
    client_id: isLive() ? '468982885473956' : '5151557998201045',
    state: JSON.stringify({
      provider: 'facebook',
      appId: 'jlaomyagnx'
    })
  })}`,
  twitter: `https://twitter.com/i/oauth2/authorize?${new URLSearchParams({
    response_type: 'code',
    code_challenge_method: 'S256',
    code_challenge: 'S6Kz0qLOhEDikHce5sOMpd5t6voSTqqqGKcRhS9oZhk',
    scope: 'tweet.read users.read follows.read follows.write',
    client_id: isLive() ? 'N1I2Y0N3WWg0bFVObjQtZXI0S2M6MTpjaQ' : 'REZfWGpVeUllanpaRzNWbnl4Tmo6MTpjaQ',
    state: 'twitter_ramper'
  })}`,
  apple: `https://appleid.apple.com/auth/authorize?${new URLSearchParams({
    response_type: 'code',
    response_mode: 'form_post',
    scope: 'name email',
    client_id: isLive() ? 'xyz.ramper.auth|7LWUP8MLA9|VLBYLGQ4Z7' : '107ccb777defb782381a',
    state: JSON.stringify({
      provider: 'apple',
      appId: 'jlaomyagnx'
    })
  })}`
}

export const SSO_HOST_ENV = {
  local: 'https://us-central1-bright-zodiac-339920.cloudfunctions.net',
  preview: 'https://us-central1-bright-zodiac-339920.cloudfunctions.net',
  dev: 'https://us-central1-bright-zodiac-339920.cloudfunctions.net',
  staging: 'https://us-central1-ramper-prod.cloudfunctions.net',
  ramper: 'https://us-central1-ramper-prod.cloudfunctions.net',
  prod: 'https://us-central1-coin98-b7f98.cloudfunctions.net'
}

export const SSO_HOST = SSO_HOST_ENV.prod
export const SSO_HOST_RAMPER = SSO_HOST_ENV.ramper
