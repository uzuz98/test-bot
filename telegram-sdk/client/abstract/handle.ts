import { MqttClient } from "mqtt";
import { IntegrationHandleParams, SupportChain } from "../types";
import { ERROR_MESSAGE } from "../../context/constants";
import { encodeTelegramUrlParameters, getReqEvent, getResponseEvent } from "../../services";
import { EVENT_NAME, FuncHandleOpenGateWay } from "../../context/types";
import { INTEGRATION_MINIAPP_URL } from "../../constants/telegram";

export abstract class BaseHandle {
  address?: string
  isConnected: boolean = false
  chain: SupportChain = SupportChain.evm
  mqttClient: MqttClient
  mqttClientName: string
  chainId: string
  partner: string

  constructor(mqtt: MqttClient, mqttName: string, chainId: string, partner: string) {
    this.mqttClient = mqtt
    this.mqttClientName = mqttName
    this.chainId = chainId
    this.partner = partner
  }

  abstract handle(params: IntegrationHandleParams): void
  abstract connect(): Promise<string>

  handleOpenGateway: FuncHandleOpenGateWay = async (message, callback) => {
    const platform: string = window.Telegram.WebApp.platform as string
    if (ERROR_MESSAGE[platform]) {
      window.Telegram.WebApp.showAlert(ERROR_MESSAGE[platform])
      throw Error('error')
    }

    return await new Promise((resolve, reject) => {
      this.mqttClient?.removeAllListeners('message')
      this.mqttClient?.on('message', (_topic, data) => {
        const messageData = data.toString()
        if (!messageData) return

        let resMsg: {
          data: any
          event: string
        } = JSON.parse(messageData)
        if (resMsg.event === 'join-room') {
          this.mqttClient?.publish(this.mqttClientName!, JSON.stringify({
            data: message,
            event: getReqEvent(EVENT_NAME.integration)
          }))
        }

        if (resMsg.event === getResponseEvent(EVENT_NAME.integration)) {
          this.mqttClient?.removeAllListeners('message')
          if (resMsg?.data?.error) {
            reject(resMsg)
            return
          }

          callback?.(resMsg?.data)
          resolve(resMsg?.data)
        }
      })

      this.openTelegram()
    })
  }

  openTelegram = (eventType: EVENT_NAME = EVENT_NAME.integration) => {
    if (!this.chainId || !this.partner) {
      throw new Error('chainId and partner is required')
    }

    const url = new URL(INTEGRATION_MINIAPP_URL)
    const paramsURL = new URLSearchParams({
      partner: this.partner,
      type: eventType,
      chainId: this.chainId
    })

    const encodeUrl = encodeTelegramUrlParameters(paramsURL.toString())
    url.searchParams.append('startapp', encodeUrl)

    window.Telegram.WebApp.openTelegramLink(url.toString())

    /** TEST ENV */
    // const url = new URL('http://localhost:8000/tabs/integration.html')
    // url.searchParams.append('partner', this.partner)
    // url.searchParams.append('type', eventType)
    // url.searchParams.append('chainId', this.chainId)
    // window.open(url.toString(), "_blank")
  }

  disconnect = () => {
    this.address = undefined
    this.isConnected = false
  }
}