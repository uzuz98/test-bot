import {
  AUTH_PROVIDER,
  CHAIN,
  CURRENCY,
  Config,
  LANGUAGE,
  SUPPORTED_ETHEREUM_NETWORKS,
  THEME,
  WALLET_PROVIDER,
  WALLET_TABS
} from '../type'

export const defaultConfig: Config = {
  appId: 'missing_app_id',
  issueIdToken: false,
  appName: '',
  authProviders: [AUTH_PROVIDER.GOOGLE, AUTH_PROVIDER.FACEBOOK, AUTH_PROVIDER.EMAIL],
  walletProviders: [WALLET_PROVIDER.METAMASK],
  language: LANGUAGE.EN,
  theme: THEME.LIGHT,
  currency: CURRENCY.USD,
  debug: false,
  _host: '',
  chainName: CHAIN.ETHEREUM,
  network: SUPPORTED_ETHEREUM_NETWORKS.MAINNET,
  defaultTokenAddresses: [],
  walletTabs: [WALLET_TABS.COIN, WALLET_TABS.NFT]
}
