import { omit } from 'lodash'

export class Wallet {
  public name: string = ''
  public address: string = ''
  public privateKey: string
  public publicKey?: string
  public privateKey64?: string
  public mnemonic?: string
  public nearDomain?: string
  public meta?: Partial<any>
  public isActive?: boolean
  public alternativeAddress?: string
  public connections: any[] = []

  constructor(wallet) {
    this.name = wallet.name
    this.publicKey = wallet.publicKey
    this.address = wallet.address
    this.privateKey64 = wallet.privateKey64
    this.alternativeAddress = wallet.alternativeAddress
    this.privateKey = wallet.privateKey
    this.mnemonic = wallet.mnemonic
    this.meta = wallet.meta
    this.nearDomain = wallet.nearDomain
    return this
  }

  static fromObject = (data) => {
    return new Wallet(data)
  }

  static from = (name: string, address: string, privateKey: KeyType, mnemonic: KeyType, meta: Partial<IMeta> | undefined) => {
    return new Wallet({ name, address, privateKey, mnemonic, meta })
  }

  // Getter: Plain Object
  toObject() {
    // Convert this context to plain object
    return omit(this, ['constructor', 'toObject', 'fromObject', 'from', 'chainData'])
  }
}

export type WalletV2 =
  Pick<
    Wallet,
    'address' |
    'meta' |
    'nearDomain' |
    'alternativeAddress' |
    'name' |
    'publicKey'
  > & Partial<
    Pick<Wallet, 'privateKey' | 'privateKey64'>
  >
