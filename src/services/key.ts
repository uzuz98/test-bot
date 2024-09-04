import { entropyToMnemonic, HDNode, isValidMnemonic } from '@ethersproject/hdnode'
import { randomBytes } from '@ethersproject/random'
import { mnemonicToSeed } from 'bip39'

interface GenerateSeedOptions{
    alg: 'bip39' | 'bip32' | 'seckp256' | 'ed25519',
    mnemonic: string
}

interface NodeFromPathParams{
  seed: Buffer | Uint8Array
  path?: string | number
  index?: string | number

  options?: {
    bip32?: boolean
  }
}

export interface INodePath{
  address?: string
  privateKey: string
}

export class NodePath implements INodePath {
  address?: string | undefined
  privateKey: string

  constructor (options: INodePath) {
    this.address = options.address
    this.privateKey = options.privateKey
  }

  static fromObject (options: INodePath) {
    return new NodePath(options)
  }

  static from (address:string, privateKey: string) {
    return new NodePath({
      address,
      privateKey
    })
  }
}

export class Key {
  static async generateSeed (options: GenerateSeedOptions = {
    alg: 'bip39',
    mnemonic: ''
  }): Promise<Buffer | Uint8Array> {
    if (!options.mnemonic) {
      throw new Error('Mnemonic is required for generate seed')
    }

    const rootSeed = await mnemonicToSeed(options.mnemonic)

    switch (options.alg) {
      case 'seckp256':
      case 'ed25519':
        throw new Error('This method is not implemented!')
      default:
        return rootSeed
    }
  }

  static generateMnemonic (is24Word: boolean) {
    const entropy = randomBytes(is24Word ? 32 : 16)
    const mnemonic = entropyToMnemonic(entropy)
    return mnemonic
  }

  static isMnemonic (mnemonic: string) {
    return isValidMnemonic(mnemonic)
  }

  static nodeFromPath (params: NodeFromPathParams): HDNode {
    // Default Path 60 | Default Index = 0
    const { seed, path = 60, index = 0 } = params

    const derivePath = `44'/${path}'/0'/0/${index}`

    // Cosmos use difference alg
    // if (options?.bip32) {
    //   const node = (seed as BIP32Interface).derivePath(derivePath)
    //   return NodePath.from('', node.privateKey?.toString('hex') as string)
    // }

    return HDNode.fromSeed(seed as Buffer).derivePath(derivePath)
  }
}
