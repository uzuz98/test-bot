export interface IEvmContext {
  address: string
  encryptionKey: string
  connect: () => Promise<string>
  // signMessage: () => Promise<string>
  personalSign: (params: IParamsPersonalSign) => Promise<string>
  sendTransaction: (params: IParamsSendTransaction) => Promise<string>
  signTypedData: (params: IParamsSignTypedDataV1[]) => Promise<string>
  signTypedDataV3: <T extends ITypesTypedData> (params: IParamsSignTypedData<T>) => Promise<string>
  signTypedDataV4: <T extends ITypesTypedData> (params: IParamsSignTypedData<T>) => Promise<string>
  getEncryptionKey: () => Promise<string>
  encryptKey: (data: string) => string
  decryptKey: (msg: string) => Promise<string>
}

export interface IParamsSendTransaction {
  from: string
  to: string
  value: string
  gasLimit?: string
  gasPrice?: string
  type?: string
}

export interface IParamsPersonalSign {
  message: string
}

export interface IParamsSignTypedDataV1 {
  type: string
  name: string
  value: string
}

export interface ITypesTypedData {
  [key: string]: {
    name: string
    type: string
  }[]
}

export interface IParamsSignTypedData<T extends ITypesTypedData> {
  types: T
  domain: {
    name: string
    version: string
    chainId: number | string
    verifyingContract: string
  }
  primaryType: keyof T
  message: object
}
