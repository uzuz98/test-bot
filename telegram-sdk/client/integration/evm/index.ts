import { BaseHandle } from "../../../client/abstract/handle";
import { IntegrationHandleParams, SupportChain } from "../../../client/types";
import { ERROR_MESSAGE } from "../../../context/constants";
import { EVENT_NAME } from "../../../context/types";
import { getReqEvent, getResponseEvent } from "../../../services";
import { MqttClient } from "mqtt";
import { ParamsDecryptKey, ParamsEncryptKey, ParamsGetEncryptionPublicKey, ParamsPersonalSignHandle, ParamsSendTransactionHandle, ParamsSignTypedDataV1, SignTypedDataV3, SignTypedDataV4 } from "./types";
import * as ethUtil from '@metamask/eth-sig-util'
import { ethers } from 'ethers'

export class EvmIntegrationHandle extends BaseHandle {
  encryptionKey?: string

  constructor(mqttClient: MqttClient, mqttName: string, chainId: string, partner: string) {
    super(mqttClient, mqttName, chainId, partner)
    this.chain = SupportChain.evm
  }

  handle = (params: IntegrationHandleParams): Promise<any> => {
    const method = params.method
    const executeFunction = this[method] as (...args: any[]) => any;
    if (typeof executeFunction === 'function') {
      return executeFunction(params)
    }
    throw new Error('method not found')
  }

  private eth_sendTransaction = (params: ParamsSendTransactionHandle) => {
    const data = {
      method: 'eth_sendTransaction',
      params: [
        params.data
      ]
    }
    return this.handleOpenGateway<string>(data)
  }

  private personal_sign = (params: ParamsPersonalSignHandle) => {
    const data = {
      params: [...Object.values(params.data), this.address],
      method: 'personal_sign'
    }

    return this.handleOpenGateway<string>(data)
  }

  private eth_getEncryptionPublicKey = (_params: ParamsGetEncryptionPublicKey) => {
    const data = {
      method: "eth_getEncryptionPublicKey",
      params: [
        this.address!,
      ]
    }
    return this.handleOpenGateway<string>(data, (data) => {
      this.encryptionKey = data
    })
  }

  private eth_signTypedData = (params: ParamsSignTypedDataV1) => {
    const data = {
      method: "eth_signTypedData",
      params: [
        params.data,
        this.address,
      ]
    }

    return this.handleOpenGateway(data)
  }

  private eth_signTypedDataV3 = (params: SignTypedDataV3) => {
    const data = {
      method: "eth_signTypedData_v3",
      params: [
        this.address,
        JSON.stringify(params.data)
      ]
    }

    return this.handleOpenGateway(data)
  }

  private eth_signTypedDataV4 = (params: SignTypedDataV4) => {
    const data = {
      method: "eth_signTypedData_v4",
      params: [
        this.address,
        JSON.stringify(params.data)
      ]
    }
    return this.handleOpenGateway(data)
  }

  private eth_decrypt = (params: ParamsDecryptKey) => {
    const message = params.data.message
    if (!message) throw new Error('message required')
    const data = {
      method: 'eth_decrypt',
      params: [
        message,
        this.address
      ]
    }
    return this.handleOpenGateway<string>(data)
  }

  private encryptKey = (params: ParamsEncryptKey) => {
    const encryptMessage = ethUtil.encrypt({
      publicKey: this.encryptionKey!,
      data: params.data,
      version: 'x25519-xsalsa20-poly1305'
    })
    const message = ethers.hexlify(Buffer.from(JSON.stringify(encryptMessage)))
    return message
  }

  connect = async (): Promise<string> => {
    const platform: string = window.Telegram.WebApp.platform as string
    if (ERROR_MESSAGE[platform]) {
      window.Telegram.WebApp.showAlert(ERROR_MESSAGE[platform])
      throw Error('error')
    }

    this.mqttClient.on('error', (err) => {
      console.log("Mqtt Error:", err)
    })

    const message = {
      method: "eth_requestAccounts",
      params: []
    }

    return await new Promise<string>((resolve, reject) => {
      this.mqttClient.removeAllListeners('message')
      this.mqttClient.on('message', (_topic, data) => {
        const messageData = data.toString()
        if (!messageData) return

        let resMsg: {
          data: any
          event: string
        } = JSON.parse(messageData)

        if (resMsg.event === 'join-room') {
          this.mqttClient.publish(this.mqttClientName, JSON.stringify({
            data: message,
            event: getReqEvent(EVENT_NAME.connectWallet)
          }))
        }

        if (resMsg.event === getResponseEvent(EVENT_NAME.connectWallet)) {
          this.mqttClient.removeAllListeners('message')

          if (resMsg?.data?.error) {
            reject(resMsg)
            return
          }

          this.address = resMsg?.data[0]
          this.isConnected = true
          resolve(resMsg?.data[0])
        }
      })

      this.openTelegram(EVENT_NAME.connectWallet)
    })
  }
}