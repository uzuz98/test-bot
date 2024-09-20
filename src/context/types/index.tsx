export interface ICoin98Props {
  partner: string
}

export interface ICoin98Context {
  address: string
  encryptionKey: string
  isAuthenticated: boolean
  connect: () => Promise<string>
  // signMessage: () => Promise<string>
  personalSign: (params: IParamsPersonalSign) => Promise<string>
  sendTransaction: (params: IParamsSendTransaction) => Promise<string>
  switchChain: () => void
  signTypedData: (params: IParamsSignTypedDataV1[]) => Promise<string>
  signTypedDataV3: <T extends ITypesTypedData> (params: IParamsSignTypedData<T>) => Promise<string>
  signTypedDataV4: <T extends ITypesTypedData> (params: IParamsSignTypedData<T>) => Promise<string>
  getEncryptionKey: () => Promise<string>
  encryptKey: (data: string) => string
  decryptKey: (msg: string) => Promise<string>
}

export interface TelegramUser{
  id: number
  first_name: string
  last_name: string
  username: string
  language_code: string
  allows_write_to_pm: boolean
}

export type FuncHandleOpenGateWay = <T = any> (message: any, callback?: (data: T) => void) => Promise<T>

export enum EVENT_NAME {
  integration = 'integration',
  signAuth = 'sign-auth',
  authentication = 'authentication',
  connectWallet = 'connect-wallet',
  joinRoom = 'join-room'
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
  address: string
  password?: string
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

export interface IParamsSignTypedData <T extends ITypesTypedData> {
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
