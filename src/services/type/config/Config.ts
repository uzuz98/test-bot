import {Currency} from '../Currency'
import {AuthProviders} from './AuthProviders'
import {Chain} from './Chain'
import {Language} from './Language'
import {Network} from './Network'
import {Theme} from './Theme'
import {WalletProviders} from './WalletProviders'
import {WalletTab} from './WalletTab'

export type Config = {
  /**
   * App ID
   * @default 'missing_app_id'
   */
  appId: string

  /**
   * Whether the app should issue an dapp based idToken on login in.
   * Setting to false improves log in performance.
   * Setting to true requires a valid appId to be set.
   * @default false
   */
  issueIdToken: boolean

  /**
   * App Name
   * @default ''
   */
  appName: string

  /**
   * List of social sign in methods to use for sign in.
   * @default "['google', 'facebook', 'email']"
   */
  authProviders: AuthProviders

  /**
   * List of wallet providers to use for connect.
   * @default "['metamask']"
   */
  walletProviders: WalletProviders

  /**
   * Theme to use for the UI.
   * @default 'light'
   */
  theme: Theme

  /**
   * Primary color to use for the UI.
   * @default '#00B5D8'
   */
  // primaryColor: string

  /**
   * Logo to display on top of sign in popup.
   * @default 'https://static.ramper.xyz/logo.png'
   */
  // logoURI: string

  /**
   * Language to use for the UI.
   * @default 'en'
   */
  language: Language

  /**
   * Network to use for the app.
   * @default 'mainnet'
   */
  network: string | Network

  /**
   * Currency to display in the UI.
   * @default 'usd'
   */
  currency: Currency

  /**
   * Whether to show debug information in the browser console.
   * @default false
   */
  debug: boolean

  _host: string

  /**
   * Chain Name
   * @default 'ethereum'
   */
  chainName: Chain

  /**
   * Token addresses to show default tokens on WalletView.
   * @default []
   */
  defaultTokenAddresses: string[]

  /**
   * List of wallet tabs to show on WalletView.
   * @default "['coin', 'nft']"
   */
  walletTabs: WalletTab[]
}

declare global {
  interface Window {
    listener: {
      jwtTokenOld: string
      jwtToken: string
    }
  }
}
