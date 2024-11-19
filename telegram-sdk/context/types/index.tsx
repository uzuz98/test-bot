import { MqttClient } from "mqtt"

export interface ICoin98Props {
  partner: string
  chainId: string
}

export interface ICoin98Context {
  handleOpenGateway: FuncHandleOpenGateWay
  activeMqtt: () => Promise<{
    mqttClient: MqttClient
    threadNameMqtt: string
  }>
  openTelegram: (eventName: EVENT_NAME) => void
  handleAccountsChanged: (callback: () => void) => void
}

export interface TelegramUser {
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