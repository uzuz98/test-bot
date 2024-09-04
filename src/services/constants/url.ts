export const AUTH_HOST_ENV = {
  local: `http://localhost:3000`,
  extension: `chrome-extension://gijeldabobofgfflinjehcohfhfjkgpg/tabs/welcome.html`,
  preview: `https://auth.v1.preview.ramper.xyz`,
  dev: 'https://auth.v1.dev.ramper.xyz',
  staging: 'https://auth.v1.staging.ramper.xyz',
  prod: 'https://auth.v1.ramper.xyz'
}

export const AUTH_HOST = AUTH_HOST_ENV.prod

export const WALLET_APP_ID_ENV = {
  extension: 'suyklxmori',
  local: 'suyklxmori',
  preview: 'suyklxmori',
  dev: 'suyklxmori',
  staging: 'dtofgevaxu',
  prod: 'jlaomyagnx',
  ramper: 'dtofgevaxu'
}

export const WALLET_APP_ID = WALLET_APP_ID_ENV.prod
export const WALLET_RAMPER_ID = WALLET_APP_ID_ENV.ramper
