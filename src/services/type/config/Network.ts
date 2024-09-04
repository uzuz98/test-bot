import { CHAIN } from './Chain'

export const NETWORK = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet',
  LOCAL: 'local'
} as const

export type Network = {
  blockchain: string
  rpcURL: string
  name: string
  chainId: number
  currency?: {
    symbol: string
    name: string
    decimal: number
    logoURL: string
  }
  explorerURL?: string
}

export const SUPPORTED_ETHEREUM_NETWORKS = {
  MAINNET: 'mainnet',
  ROPSTEN: 'ropsten',
  GOERLI: 'goerli',
  MATIC: 'matic',
  MATICMUM: 'maticmum'
} as const

export type EthereumNetwork =
  (typeof SUPPORTED_ETHEREUM_NETWORKS)[keyof typeof SUPPORTED_ETHEREUM_NETWORKS]

export const NFT_SUPPORTED_ETHEREUM_NETWORKS = {
  MAINNET: SUPPORTED_ETHEREUM_NETWORKS.MAINNET,
  GOERLI: SUPPORTED_ETHEREUM_NETWORKS.GOERLI,
  MATIC: SUPPORTED_ETHEREUM_NETWORKS.MATIC,
  MATICMUM: SUPPORTED_ETHEREUM_NETWORKS.MATICMUM
}

export const SUPPORTED_ETHEREUM_CHAIN_IDS = {
  MAINNET: 1,
  ROPSTEN: 3,
  GOERLI: 5,
  MATIC: 137,
  MATICMUM: 80001
} as const

export type NFTEthereumNetwork =
  (typeof NFT_SUPPORTED_ETHEREUM_NETWORKS)[keyof typeof NFT_SUPPORTED_ETHEREUM_NETWORKS]

export const SUPPORTED_NEAR_NETWORKS = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet'
} as const

export type NearNetwork = (typeof SUPPORTED_NEAR_NETWORKS)[keyof typeof SUPPORTED_NEAR_NETWORKS]

export const SUPPORTED_POLYGON_NETWORKS = {
  MAINNET: 'mainnet',
  TESTNET: 'testnet'
} as const

export type PolygonNetwork =
  (typeof SUPPORTED_POLYGON_NETWORKS)[keyof typeof SUPPORTED_POLYGON_NETWORKS]

export const SUPPORTED_TERRA_NETWORKS = {
  MAINNET: 'mainnet'
} as const

export type TerraNetwork = (typeof SUPPORTED_TERRA_NETWORKS)[keyof typeof SUPPORTED_TERRA_NETWORKS]

export const SUPPORTED_NETWORKS = {
  [CHAIN.ETHEREUM]: SUPPORTED_ETHEREUM_NETWORKS,
  [CHAIN.NEAR]: SUPPORTED_NEAR_NETWORKS,
  [CHAIN.TERRA]: SUPPORTED_TERRA_NETWORKS
}
