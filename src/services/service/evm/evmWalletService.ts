import { TransactionRequest } from '@ethersproject/abstract-provider'
import { ethers, Wallet as WalletEther } from 'ethers'
import { User } from 'firebase/auth'
import { BroadcastResult, SendTxData, SignedTx, TxData, WalletService } from '../walletService'
import { CHAIN, WalletKeyModel } from '../../type'
import { defaultConfig } from '../../constants/defaultConfig'
import { Networkish, SUPPORTED_ETHEREUM_NETWORKS } from '../../constants'
import { CURRENT_WALLET_KEY_VERSION } from '../../lib/firebase/services/wallet-keys-service'
import { Key } from '@/services/key'
import { Wallet } from '@/services/wallet'
export interface EthTxData extends TxData {
  transactionRequest: TransactionRequest
}

export interface EthSendTxData extends SendTxData {
  to_address: string
  gas_limit: string
  send_token_amount: string
}

export interface EthSignedTx extends SignedTx {
  transaction: string
}

export interface EthBroadcastResult extends BroadcastResult {}

export class EthWalletService extends WalletService {
  WALLET_CHAIN_KEY = CHAIN.ETHEREUM
  WALLET_KEY_VERSION = CURRENT_WALLET_KEY_VERSION
  provider: ethers.providers.InfuraProvider | undefined

  async createNewWallet(params): Promise<[string, Uint8Array, string]> {
    const keyGen = Key.generateMnemonic(false);
    const generatedPhrase =  params?.mnemonic || keyGen.split('').join('').toLowerCase();
    const nodePath = Key.nodeFromPath({
      seed: (await Key.generateSeed({
        mnemonic: generatedPhrase,
        alg: 'bip39',
      })) as Buffer,
    });
    const newWallet = Wallet.fromObject({
      name: 'ramper',
      address: nodePath.address as string,
      privateKey: nodePath.privateKey,
      mnemonic: generatedPhrase,
    });
    const mnemonic = newWallet.mnemonic as string;
    const address = newWallet.address as string;
    // const privateKey = newWallet.privateKey as string
    // // returns public wallet address and private key (bytes)
    return [address, new TextEncoder().encode(mnemonic), mnemonic];
  }

  getProvider() {
    if (this.provider) {
      return this.provider
    }
    const config = defaultConfig
    let network: Networkish = 'homestead'
    if (config?.network && config?.network != SUPPORTED_ETHEREUM_NETWORKS.MAINNET) {
      network = config.network
    } else if (!config?.network) {
      // Temporary, default the network to "ropsten" as the default for
      // backwards compatibility with existing users.
      network = SUPPORTED_ETHEREUM_NETWORKS.ROPSTEN
    }
    this.provider = new ethers.providers.InfuraProvider(network)
    return this.provider
  }

  async getNonce(walletAddress: string) {
    const provider = this.getProvider()
    return await provider.getTransactionCount(walletAddress, 'latest')
  }

  async signTransactionImpl(
    firebaseUser: User,
    storedKey: WalletKeyModel,
    tx: EthTxData,
    idToken?: string
  ): Promise<EthSignedTx> {
    // Probably need this provider passed in from somewhere?

    // Legacy walletId support for some version 4s that was migrated.
    const walletAddress = storedKey.walletId
      .replace('_cvt', '')
      .substring(storedKey.walletId.indexOf('_') + 1)

    let decryptedKey, nonce
    ;[decryptedKey, nonce] = await Promise.all([
      this.decryptWalletKey(firebaseUser, storedKey, idToken),
      this.getNonce(walletAddress)
    ])
    const wallet = WalletEther.fromMnemonic(decryptedKey)
    const body = tx.transactionRequest
    // assign the from address as the wallet address if not set
    if (!body.from) body.from = wallet.address
    if (!body.nonce) body.nonce = nonce
    const transaction = await wallet.signTransaction(tx.transactionRequest)
    return { transaction, msgs: [] }
  }

  async broadcastSync(input: EthSignedTx): Promise<EthBroadcastResult> {
    const provider = this.getProvider()
    return await provider.sendTransaction(input.transaction)
  }

  async buildSendTx(tx: EthSendTxData): Promise<EthTxData> {
    const provider = this.getProvider()
    const gas_price = await provider.getGasPrice() // gasPrice
    const toSign = {
      to: tx.to_address,
      value: ethers.utils.parseEther(tx.send_token_amount),
      gasLimit: ethers.utils.hexlify(tx.gas_limit), // 100000
      gasPrice: gas_price
    }

    return { transactionRequest: toSign }
  }
}

export const ethWalletService = new EthWalletService()
