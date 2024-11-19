import { EvmHandleParams } from "../integration/evm/types"

export enum SupportChain {
  evm = 'EVM'
}

type HandleParams = EvmHandleParams // | SolanaHandleParams

export type IntegrationHandleParams = HandleParams & {
  chain: SupportChain
}