import { SupportChain } from "../../types"
import { IParamsPersonalSign, IParamsSendTransaction, IParamsSignTypedData, IParamsSignTypedDataV1, ITypesTypedData } from "../../../context/integration/evm/type"

export interface ParamsSendTransactionHandle {
  method: 'eth_sendTransaction'
  data: IParamsSendTransaction
}

export interface ParamsPersonalSignHandle {
  method: 'personal_sign'
  data: IParamsPersonalSign
}

export interface ParamsSignTypedDataV1 {
  method: 'eth_signTypedData'
  data: IParamsSignTypedDataV1[]
}

export interface SignTypedDataV3 {
  method: 'eth_signTypedDataV3'
  data: IParamsSignTypedData<ITypesTypedData>
}

export interface SignTypedDataV4 {
  method: 'eth_signTypedDataV4'
  data: IParamsSignTypedData<ITypesTypedData>
}

export interface ParamsGetEncryptionPublicKey {
  method: 'eth_getEncryptionPublicKey'
}

export interface ParamsDecryptKey {
  method: 'eth_decrypt'
  data: {
    message: string
  }
}

export interface ParamsEncryptKey {
  method: 'encryptKey'
  data: string
}

export type EvmHandleParams =
  (ParamsSendTransactionHandle |
    ParamsPersonalSignHandle |
    ParamsSignTypedDataV1 |
    SignTypedDataV3 |
    SignTypedDataV4 |
    ParamsGetEncryptionPublicKey |
    ParamsDecryptKey |
    ParamsEncryptKey) & {
      chain: SupportChain.evm
    }