'use client'
import React, { useEffect, useRef, useState } from "react";
import { Coin98Context } from ".";
import { encodeTelegramUrlParameters, getReqEvent, getResponseEvent, getTelegramUser } from "./services";
import { EnumKeyStorage, EVENT_NAME, FuncHandleOpenGateWay, ICoin98Props } from "./types";
import { ERROR_MESSAGE } from "./constants";
import mqtt, { MqttClient } from 'mqtt'
import { postApiGetToken } from "./services/api";
import { EvmProvider } from "./integration/evm";

const Coin98Provider: React.FC<React.PropsWithChildren<ICoin98Props>> = ({children, partner, chainId = '0x38'}) => {
  const mqttClient = useRef<MqttClient>()
  const threadNameMqtt = useRef<string>()

  const mqttGeneralClient = useRef<MqttClient>()
  const threadNameMqttGeneral = useRef<string>()

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
    const url = new URL('https://t.me/super_wallet_staging_bot/integration')
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
  
  const activeMqtt = async () => {
    if(!mqttClient.current?.connected) {
      const token = await getToken()
      const platform = window.Telegram?.WebApp?.platform === 'unknown' ? 'macos' : window.Telegram?.WebApp?.platform

      const user = getTelegramUser()
      let endpoint = process.env.NEXT_PUBLIC_MQTT_URL!
      const urlString = new URLSearchParams({
        partner,
        platform,
        jwt: token
      })

      const queryParams = urlString.toString()
      endpoint += `&${queryParams}`
    
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
      return {
        mqttClient: mqttClient.current,
        threadNameMqtt: threadNameMqtt.current
      }
    }
    return {
      mqttClient: mqttClient.current,
      threadNameMqtt: threadNameMqtt.current!
    }
  }

  const handleOpenGateway: FuncHandleOpenGateWay = async (message, callback) => {
    const platform: string = window.Telegram.WebApp.platform as string
    if(ERROR_MESSAGE[platform]) {
      window.Telegram.WebApp.showAlert(ERROR_MESSAGE[platform])
      throw Error('error')
    }

    await activeMqtt()
    // const version = window.Telegram.WebApp.version

    return await new Promise((resolve, reject) => {
      mqttClient.current?.removeAllListeners('message')
      mqttClient.current?.on('message', (topic, data) => {
        const messageData = data.toString()
        if(!messageData) return

        let resMsg: {
          data: any
          event: string
        } = JSON.parse(messageData)
        if(resMsg.event === 'join-room') {
          mqttClient.current?.publish(threadNameMqtt.current!, JSON.stringify({
            data: message,
            event: getReqEvent(EVENT_NAME.integration)
          }))
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

  const handleAccountsChanged = async (callback: () => void) => {
    if (!mqttGeneralClient.current?.connected) {
      const jwtToken = await getToken()
      const platform = window.Telegram?.WebApp?.platform === 'unknown' ? 'macos' : window.Telegram?.WebApp?.platform
      const partner = 'GENERAL'
      let endpoint = process.env.NEXT_PUBLIC_MQTT_URL!
      const urlString = new URLSearchParams({
        partner,
        platform,
        jwt: jwtToken
      })

      const queryParams = urlString.toString()
      endpoint += `&${queryParams}`
      const user = getTelegramUser()
      threadNameMqttGeneral.current = `AuthenticatedUser_${user.id}_${partner}_${platform}`

      console.log("🩲 🩲 => handleAccountsChanged => threadNameMqttGeneral.current:", threadNameMqttGeneral.current)
      mqttGeneralClient.current = mqtt.connect(
        endpoint,
        {
          clientId: `ne_chat_client_${Math.random().toString(16).substr(2, 8)}`,
          reconnectPeriod: 3000,
          keepalive: 30,
          connectTimeout: 10000
        }
      )
      mqttGeneralClient.current.subscribe(threadNameMqttGeneral.current!)
    }

    mqttGeneralClient.current.on('message', (topic, data) => {
      const msgText = data.toString()
      if (!msgText) return

      const {type} = JSON.parse(msgText)
      if (type === 'accountsChanged') {
        callback()
      }
    })
  }

  return (
    <Coin98Context.Provider value={{
      handleOpenGateway,
      activeMqtt,
      openTelegram,
      handleAccountsChanged
    }}>
      <EvmProvider>
        {children}
      </EvmProvider>
    </Coin98Context.Provider>
  )
}

export default Coin98Provider