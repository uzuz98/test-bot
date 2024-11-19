import mqtt, { MqttClient } from "mqtt"
import { EvmIntegrationHandle } from "./integration/evm"
import { IntegrationHandleParams, SupportChain } from "./types"
import get from 'lodash/get'
import { EnumKeyStorage } from "../context/types"
import { postApiGetToken } from "../services/api"
import { getTelegramUser } from "../services"
import { MQTT_SERVER } from "../constants"

// const engines = {
//   [SupportChain.evm]: EvmIntegrationHandle
// }

export class Coin98SDK {
  partner: string
  chainId: string = '0x1'

  platform: string = get(window, ['Telegram', 'WebApp', 'platform'], 'macos')
  mqttClient?: MqttClient
  mqttClientName?: string

  mqttGeneralClient?: MqttClient
  mqttGeneralName?: string

  [SupportChain.evm]?: EvmIntegrationHandle

  static Instance?: Coin98SDK

  constructor(partner: string, chainId: string) {
    this.partner = partner
    this.chainId = chainId
    Coin98SDK.Instance = this
  }

  async handle(params: IntegrationHandleParams) {
    if (Object.values(SupportChain).includes(params.chain)) {
      await this.activeMqtt()
      const client = this.getClient(params.chain)
      return client?.handle(params)
    }
    throw Error(`Chain ${params.chain} not supported`)
  }

  connect = async (chain: SupportChain): Promise<string> => {
    if (Object.values(SupportChain).includes(chain)) {
      await this.activeMqtt()
      const client = this.getClient(chain)
      if (!client) {
        throw Error(`Chain ${chain} not supported`)
      }
      return client.connect()
    }
    throw Error(`Chain ${chain} not supported`)
  }

  private getClient(chain: SupportChain) {
    if (this[chain]) {
      return this[chain]
    }

    switch (chain) {
      case SupportChain.evm: {
        this[chain] = new EvmIntegrationHandle(this.mqttClient!, this.mqttClientName!, this.chainId, this.partner)
        return this[chain]
      }
      default:
        throw Error(`Chain ${chain} not supported`)
    }
  }

  private async getToken(): Promise<string> {
    const telegramToken = localStorage.getItem(EnumKeyStorage.telegramToken)
    if (telegramToken) {
      return telegramToken
    }

    const responseToken = await postApiGetToken()
    if (!responseToken.status || !responseToken.data?.data.code) {
      throw new Error('error')
    }

    const newTelegramToken = responseToken.data?.data.code
    localStorage.setItem(EnumKeyStorage.telegramToken, newTelegramToken)
    return responseToken.data?.data.code
  }

  private async activeMqtt() {
    if (!this.mqttClient?.connected) {
      const token = await this.getToken()
      const platform = window.Telegram?.WebApp?.platform === 'unknown' ? 'macos' : window.Telegram?.WebApp?.platform
      this.platform = platform

      const user = getTelegramUser()
      let endpoint = MQTT_SERVER
      const urlString = new URLSearchParams({
        partner: this.partner,
        platform,
        jwt: token
      })

      const queryParams = urlString.toString()
      endpoint += `&${queryParams}`

      const client = mqtt.connect(endpoint, {
        clientId: `ne_chat_client_${Math.random().toString(16).substr(2, 8)}`,
        reconnectPeriod: 3000,
        keepalive: 30,
        connectTimeout: 10000
      })

      const threadName = `AuthenticatedUser_${user.id}_${this.partner}_${this.platform}`
      this.mqttClientName = threadName

      client.subscribe(this.mqttClientName, (err) => {
        if (err) {
          console.log('Error:', err)
        } else {
          console.log('Subscribed!')
        }
      })

      this.mqttClient = client
    }
  }

  // Support for evm method
  switchChainId = (chainId: string) => {
    this.chainId = chainId
  }
}
