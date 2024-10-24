import { MqttClient } from "mqtt"

export interface ICoin98Props {
  partner: string
  chainId: string
}

export interface ICoin98Context {
  mqttClient: MqttClient
  threadNameMqtt: string
  handleOpenGateway: FuncHandleOpenGateWay
  activeSocket: () => Promise<MqttClient>
  openTelegram: (eventName: EVENT_NAME) => void
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

export enum EnumKeyStorage {
  telegramToken = 'TELEGRAM_TOKEN'
}