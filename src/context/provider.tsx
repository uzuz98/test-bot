import React, { useRef, useState } from "react";
import { Coin98Context } from ".";
import * as ethUtil from '@metamask/eth-sig-util'
import {ethers} from 'ethers'
import { encodeTelegramUrlParameters, getReqEvent, getResponseEvent, getTelegramUser } from "./services";
import { EnumKeyStorage, EVENT_NAME, FuncHandleOpenGateWay, ICoin98Props, IParamsPersonalSign, IParamsSendTransaction, IParamsSignTypedData, IParamsSignTypedDataV1, ITypesTypedData } from "./types";
import { ERROR_MESSAGE } from "./constants";
import mqtt, { MqttClient } from 'mqtt'
import { postApiGetToken } from "./services/api";

const Coin98Provider: React.FC<React.PropsWithChildren<ICoin98Props>> = ({children, partner}) => {
  const [chainId, setChainId] = useState('0x38')
  const [address, setAddress] = useState('')
  const [encryptionKey, setEncryptionKey] = useState('')
  const threadNameMqtt = useRef<string>()

  // const socketClient = useRef<Socket>()

  const mqttClient = useRef<MqttClient>()

  const getToken = async () => {
    const telegramToken = localStorage.getItem(EnumKeyStorage.telegramToken)
    if(telegramToken) {
      return telegramToken
    }

    const responseToken = await postApiGetToken()
    
    if(!responseToken.status || !responseToken.data?.data.code) {
      throw new Error('error')
    }

    const newTelegramToken = responseToken.data?.data.code
    localStorage.setItem(EnumKeyStorage.telegramToken, newTelegramToken)

    return responseToken.data?.data.code
  }

  const openTelegram = async (eventType: EVENT_NAME = EVENT_NAME.integration) => {
    const url = new URL('https://t.me/uzuz_send_message_bot/integration_app')
    const paramsURL = new URLSearchParams({
      partner,
      type: eventType,
      chainId
    })

    const encodeUrl = encodeTelegramUrlParameters(paramsURL.toString())

    url.searchParams.append('startapp', encodeUrl)

    window.Telegram.WebApp.openTelegramLink(url.toString())

    /** TEST ENV */
    // const url = new URL('http://localhost:8000/tabs/integration.html')
    // url.searchParams.append('partner', partner)
    // url.searchParams.append('type', eventType)
    // url.searchParams.append('chainId', chainId)
    // window.open(url.toString(), "_blank")
  }
  
  const activeSocket = async () => {
    const token = await getToken()
    const platform = window.Telegram?.WebApp?.platform === 'unknown' ? 'macos' : window.Telegram?.WebApp?.platform

    const user = getTelegramUser()
    let endpoint = `wss://superwallet-stg-iot.coin98.dev/mqtt`
    const urlString = new URLSearchParams({
      partner,
      platform,
      jwt: token
    })

    const queryParams = urlString.toString()
    endpoint += `?${queryParams}`
    
    if(!mqttClient.current) {
      const client = mqtt.connect(endpoint, {
        clientId: `ne_chat_client_${Math.random().toString(16).substr(2, 8)}`,
        reconnectPeriod: 3000,
        keepalive: 30,
        connectTimeout: 10000,
      })

      const threadName = `AuthenticatedUser_${user.id}_${partner}_${platform}`
      threadNameMqtt.current = threadName

      client.subscribe(threadNameMqtt.current, (err) => {
        if (err) {
          console.log('Error:', err)
        } else {
          console.log('Subscribed!')
        }
      })

      mqttClient.current = client
    }
  }

  const handleOpenGateway: FuncHandleOpenGateWay = async (message, callback) => {
    const platform: string = window.Telegram.WebApp.platform as string
    if(ERROR_MESSAGE[platform]) {
      window.Telegram.WebApp.showAlert(ERROR_MESSAGE[platform])
      throw Error('error')
    }

    // const version = window.Telegram.WebApp.version

    return await new Promise((resolve, reject) => {
      mqttClient.current?.removeAllListeners('message')
      mqttClient.current?.on('message', (topic, data) => {
        let resMsg: {
          data: any
          event: string
        } = JSON.parse(data.toString())
        if(resMsg.event === 'join-room') {
          mqttClient.current?.publish(threadNameMqtt.current!, JSON.stringify({
            data: message,
            event: getReqEvent(EVENT_NAME.integration)
          }), {
            qos: 1
          })
        }

        if(resMsg.event === getResponseEvent(EVENT_NAME.integration)) {
          mqttClient.current?.removeAllListeners('message')
          if(resMsg?.data?.error) {
            reject(resMsg)
            return
          }

          callback?.(resMsg?.data)
          resolve(resMsg?.data)
        }
      })

      openTelegram()
    })
  }

  const handleConnect = async () => {
    const platform: string = window.Telegram.WebApp.platform as string
    if(ERROR_MESSAGE[platform]) {
      window.Telegram.WebApp.showAlert(ERROR_MESSAGE[platform])
      throw Error('error')
    }

    // const version = window.Telegram.WebApp.version

    await activeSocket()

    const message = {
      method: "eth_requestAccounts",
      params: []
    }

    return await new Promise<string>((resolve, reject) => {
      mqttClient.current?.removeAllListeners('message')
      mqttClient.current?.on('message', (topic, data) => {
        let resMsg: {
          data: any
          event: string
        } = JSON.parse(data.toString())

        if(resMsg.event === 'join-room') {
          mqttClient.current?.publish(threadNameMqtt.current!, JSON.stringify({
            data: message,
            event: getReqEvent(EVENT_NAME.connectWallet)
          }), {
            qos: 1
          })
        }

        if(resMsg.event === getResponseEvent(EVENT_NAME.connectWallet)) {
          mqttClient.current?.removeAllListeners('message')
          
          if(resMsg?.data?.error) {
            reject(resMsg)
            return
          }

          setAddress(resMsg?.data[0] as string)
          resolve(resMsg?.data[0])
        }
      })
  
      openTelegram(EVENT_NAME.connectWallet)
    })
  }

  const handleSendTransaction = (params: IParamsSendTransaction) => {
    const data = {
      method: 'eth_sendTransaction',
      params: [
        params
      ]
    }
    return handleOpenGateway<string>(data)
  }

  const handlePersonalSign = (params: IParamsPersonalSign) => {
    const data = {
      params: [...Object.values(params), address],
      method: 'personal_sign'
    }
    
    
    return handleOpenGateway<string>(data)
  }

  const handleGetEncryptionKey = () => {
    const data = {
      method: "eth_getEncryptionPublicKey",
      params: [
        address
      ]
    }
    return handleOpenGateway<string>(data, setEncryptionKey)
  }

  const handleEncryptKey = (data: string) => {
    if(!encryptionKey) throw new Error('need encryption key')
    const encryptMessage = ethUtil.encrypt({
      publicKey: encryptionKey,
      data,
      version: 'x25519-xsalsa20-poly1305'
    })
    const message = ethers.hexlify(Buffer.from(JSON.stringify(encryptMessage)))
    return message
  }

  const handleDecryptKey = (message: string) => {
    if (!message) throw new Error('message required')
    const data = {
      method: 'eth_decrypt',
      params: [
        message,
        address
      ]
    }
    return handleOpenGateway<string>(data)
  }

  const handleSignTypedDataV1 = (params: IParamsSignTypedDataV1[]) => {
    const data = {
      method: 'eth_signTypedData',
      params: [
        params,
        address
      ]
    }
    return handleOpenGateway(data)
  }

  const handleSignTypedDataV3 = <T extends ITypesTypedData> (params: IParamsSignTypedData<T>) => {
    const data = {
      method: "eth_signTypedData_v3",
      params: [
        address,
        JSON.stringify(params)
      ]
    }

    return handleOpenGateway(data)
  }

  const handleSignTypedDataV4 = <T extends ITypesTypedData> (params: IParamsSignTypedData<T>) => {
    const data = {
      method: "eth_signTypedData_v4",
      params: [
        address,
        JSON.stringify(params)
      ]
    }

    return handleOpenGateway(data)
  }

  const handleSwitchChain = (newChainId: string) => {
    setChainId(newChainId)
  }

  return (
    <Coin98Context.Provider value={{
      address,
      encryptionKey,
      connect: handleConnect,
      sendTransaction: handleSendTransaction,
      personalSign: handlePersonalSign,
      signTypedData: handleSignTypedDataV1,
      signTypedDataV3: handleSignTypedDataV3,
      signTypedDataV4: handleSignTypedDataV4,
      getEncryptionKey: handleGetEncryptionKey,
      encryptKey: handleEncryptKey,
      decryptKey: handleDecryptKey,
      switchChain: handleSwitchChain,
      chainId
    }}>
      {children}
    </Coin98Context.Provider>
  )
}

export default Coin98Provider