import { Network } from '../type'

export const SUPPORTED_ETHEREUM_NETWORKS = {
  MAINNET: 'mainnet',
  ROPSTEN: 'ropsten',
  GOERLI: 'goerli',
  MATIC: 'matic',
  MATICMUM: 'maticmum'
} as const

export type Networkish = string | Network

export type EthereumNetwork =
  (typeof SUPPORTED_ETHEREUM_NETWORKS)[keyof typeof SUPPORTED_ETHEREUM_NETWORKS]

export const NFT_SUPPORTED_ETHEREUM_NETWORKS = {
  MAINNET: SUPPORTED_ETHEREUM_NETWORKS.MAINNET,
  GOERLI: SUPPORTED_ETHEREUM_NETWORKS.GOERLI,
  MATIC: SUPPORTED_ETHEREUM_NETWORKS.MATIC,
  MATICMUM: SUPPORTED_ETHEREUM_NETWORKS.MATICMUM
}

export type NFTEthereumNetwork =
  (typeof NFT_SUPPORTED_ETHEREUM_NETWORKS)[keyof typeof NFT_SUPPORTED_ETHEREUM_NETWORKS]

export const ETHEREUM_NETWORK_METADATAS = {
  [SUPPORTED_ETHEREUM_NETWORKS.MAINNET]: {
    chainId: 1,
    chainName: 'Ethereum Mainnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    },
    rpcUrls: ['https://mainnet.infura.io/v3/'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  [SUPPORTED_ETHEREUM_NETWORKS.ROPSTEN]: {
    chainId: 3,
    chainName: 'Ropsten Test Network',
    nativeCurrency: {
      name: 'RopstenETH',
      symbol: 'RopstenETH',
      decimals: 18
    },
    rpcUrls: ['https://ropsten.infura.io/v3/'],
    blockExplorerUrls: ['https://ropsten.etherscan.io']
  },
  [SUPPORTED_ETHEREUM_NETWORKS.GOERLI]: {
    chainId: 5,
    chainName: 'Goerli Test Network',
    nativeCurrency: {
      name: 'GoerliETH',
      symbol: 'GoerliETH',
      decimals: 18
    },
    rpcUrls: ['https://goerli.infura.io/v3/'],
    blockExplorerUrls: ['https://goerli.etherscan.io']
  },
  [SUPPORTED_ETHEREUM_NETWORKS.MATIC]: {
    chainId: 137,
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com']
  },
  [SUPPORTED_ETHEREUM_NETWORKS.MATICMUM]: {
    chainId: 80001,
    chainName: 'Mumbai',
    nativeCurrency: {
      name: 'MATIC',
      symbol: 'MATIC',
      decimals: 18
    },
    rpcUrls: ['https://matic-mumbai.chainstacklabs.com', 'https://polygontestapi.terminet.io/rpc'],
    blockExplorerUrls: ['https://mumbai.polygonscan.com']
  }
}
