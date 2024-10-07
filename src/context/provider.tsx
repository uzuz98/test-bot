import React, { useRef, useState } from "react";
import { Coin98Context } from ".";
import { io, Socket } from "socket.io-client";
import * as ethUtil from '@metamask/eth-sig-util'
import {ethers} from 'ethers'
import { encodeTelegramUrlParameters, getReqEvent, getResponseEvent, getTelegramUser } from "./services";
import { EVENT_NAME, FuncHandleOpenGateWay, ICoin98Props, IParamsPersonalSign, IParamsSendTransaction, IParamsSignTypedData, IParamsSignTypedDataV1, ITypesTypedData } from "./types";
import { ERROR_MESSAGE } from "./constants";
import mqtt, { MqttClient } from 'mqtt'

const Coin98Provider: React.FC<React.PropsWithChildren<ICoin98Props>> = ({children, partner}) => {
  const [chainId, setChainId] = useState('0x38')
  const [address, setAddress] = useState('')
  const [encryptionKey, setEncryptionKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(true)
  const threadNameMqtt = useRef<string>()

  // const socketClient = useRef<Socket>()

  const mqttClient = useRef<MqttClient>()

  const openTelegram = (eventType: EVENT_NAME = EVENT_NAME.integration) => {
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
  
  const activeSocket = () => {
    const user = getTelegramUser()
    const IOT_ENDPOINT = `wss://a232wgcz1uajvt-ats.iot.ap-southeast-1.amazonaws.com/mqtt?x-amz-customauthorizer-name=PublicAuthorizerWillDelete&jwt=123&signature=456&device_id=789`;
    
    if(!mqttClient.current) {
      const client = mqtt.connect(IOT_ENDPOINT, {
        clientId: `ne_chat_client_${Math.random().toString(16).substr(2, 8)}`,
        reconnectPeriod: 0,
        query: {
          'bearer-token': 'some-custom-jwt',
          signature: 'some-custom-signature',
          'device-id': 'some-device-id'
        },
        wsOptions: {
          headers: {
            'x-bearer-token': 'some-custom-jwt',
            'x-signature': 'some-custom-signature',
            'x-device-id': 'some-device-id'
          }
        },
        username: 'username',
        password: 'password'
      })

      const threadName = `${partner}-${user.id}-${window.Telegram?.WebApp?.platform}`
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

    // if(!socketClient.current) {
    //   // socketClient.current = io('http://localhost:3001', {
    //   socketClient.current = io('https://sse-example-zzop.onrender.com', {
    //     transports: ['websocket'],
    //     query: {
    //       partner: partner,
    //       id: user.id,
    //       os: platform
    //     }
    //   })
    // }
  }

  const handleOpenGateway: FuncHandleOpenGateWay = async (message, callback) => {
    const platform: string = window.Telegram.WebApp.platform as string
    if(ERROR_MESSAGE[platform]) {
      window.Telegram.WebApp.showAlert(ERROR_MESSAGE[platform])
      throw Error('error')
    }

    const version = window.Telegram.WebApp.version
    console.log("🩲 🩲 => activeSocket => version:", version)

    return await new Promise((resolve, reject) => {
      mqttClient.current?.removeAllListeners('message')
      mqttClient.current?.on('message', (topic, data) => {
        let resMsg: {
          data: any
          event: string
        } = JSON.parse(data.toString())
        if(resMsg.event === 'join-room') {
          console.log("🩲 🩲 => mqttClient.current?.on => resMsg.event:", resMsg.event)
          mqttClient.current?.publish(threadNameMqtt.current, JSON.stringify({
            data: message,
            event: getReqEvent(EVENT_NAME.integration)
          }))
          // mqttClient.current?.publish(getReqEvent(EVENT_NAME.integration), JSON.stringify(message))
        }

        console.log("🩲 🩲 => mqttClient.current?.on => resMsg.event:", resMsg.event)
        console.log("🩲 🩲 => mqttClient.current?.on => getResponseEvent(EVENT_NAME.integration:", getResponseEvent(EVENT_NAME.integration))
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

      // socketClient.current?.on(EVENT_NAME.joinRoom, (data) => {
      //   if(data.includes('coin98-bot')) {
      //     socketClient.current?.emit(getReqEvent(EVENT_NAME.integration), message, () => {
      //       socketClient.current?.removeListener(EVENT_NAME.joinRoom)
      //     })
  
      //     socketClient.current?.on(getResponseEvent(EVENT_NAME.integration), (eventData) => {
      //       console.log("🩲 🩲 => socketClient.current?.on => eventData:", eventData)
      //       if(eventData.error) {
      //         reject(eventData)
      //         // callback?.(eventData)
      //         socketClient.current?.removeListener(getResponseEvent(EVENT_NAME.integration))
      //         return
      //       }
      //       callback?.(eventData)
      //       resolve(eventData)
      //       socketClient.current?.removeListener(getResponseEvent(EVENT_NAME.integration))
      //     })
      //   }
      // })
      openTelegram()
    })
  }

  const handleConnect = async () => {
    const platform: string = window.Telegram.WebApp.platform as string
    console.log("🩲 🩲 => activeSocket => platform:", platform)
    if(ERROR_MESSAGE[platform]) {
      window.Telegram.WebApp.showAlert(ERROR_MESSAGE[platform])
      throw Error('error')
    }

    const version = window.Telegram.WebApp.version
    console.log("🩲 🩲 => activeSocket => version:", version)

    activeSocket()

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

        console.log("🩲 🩲 => mqttClient.current?.on => resMsg:", resMsg)

        if(resMsg.event === 'join-room') {
          mqttClient.current?.publish(threadNameMqtt.current, JSON.stringify({
            data: message,
            event: getReqEvent(EVENT_NAME.connectWallet)
          }))
        }

        console.log("🩲 🩲 => mqttClient.current?.on => resMsg.event:", resMsg.event)
        console.log("🩲 🩲 => mqttClient.current?.on => getResponseEvent(EVENT_NAME.connectWallet):", getResponseEvent(EVENT_NAME.connectWallet))
        if(resMsg.event === getResponseEvent(EVENT_NAME.connectWallet)) {
          mqttClient.current?.removeAllListeners('message')
          
          if(resMsg?.data?.error) {
            reject(resMsg)
            return
          }

          setAddress(resMsg?.data[0] as string)
          resolve(resMsg?.data[0])
        }

        // let eventData = JSON.parse(data.toString())
        // console.log("🩲 🩲 => mqttClient.current?.on => eventData:", eventData)
        // if(topic === 'c98 joined') {
        //   mqttClient.current?.publish(
        //     getReqEvent(EVENT_NAME.connectWallet),
        //     JSON.stringify(message)
        //   )
        // }

        // if(topic === getResponseEvent(EVENT_NAME.connectWallet)) {
        //   let eventData = JSON.parse(data.toString())

        //   if(eventData?.error) {
        //     reject(eventData)
        //     return
        //   }

        //   resolve(eventData[0] as string)
        //   setAddress(eventData[0] as string)
        //   handleAuthentication(eventData[0])
        // }
      })

      // socketClient.current?.on(EVENT_NAME.joinRoom, (data) => {
      //   if(data.includes('coin98-bot')) {
      //     socketClient.current?.emit(
      //       getReqEvent(EVENT_NAME.connectWallet),
      //       message,
      //       (dataCb: any) => {}
      //     )
      //     socketClient.current?.removeListener(EVENT_NAME.joinRoom)
  
      //     socketClient.current?.on(
      //       getResponseEvent(EVENT_NAME.connectWallet),
      //       (eventData) => {
      //         socketClient.current?.removeListener(getResponseEvent(EVENT_NAME.connectWallet))
      //         if(eventData.error) {
      //           reject(eventData)
      //           return
      //         }
      //         resolve(eventData[0] as string)
      //         setAddress(eventData[0] as string)
      //         handleAuthentication(eventData[0])
      //       }
      //     )
      //   }
      // })
  
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
      params: Object.values(params),
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
        // [
        //   {
        //       "type": "string",
        //       "name": "Message",
        //       "value": "Hi, Alice!"
        //   },
        //   {
        //       "type": "uint32",
        //       "name": "A number",
        //       "value": "1337"
        //   }
        // ],
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

  const handleAuthentication = async (addressAuthen: string = address) => {
    return await new Promise<boolean>((resolve, reject) => {

      mqttClient.current?.on('message', (topic, data) => {
        if(topic === 'c98 joined') {
          mqttClient.current?.publish(
            'request-sign-auth',
            JSON.stringify({
              params: [
                "Sign message for authenticate to connect bot coin98",
                addressAuthen,
                "Example password"
              ],
              method: 'personal_sign'
            })
          )
        }

        if(topic === 'on-response-sign-auth') {
          let eventData = JSON.parse(data.toString())

          if(eventData?.error) {
            reject(eventData)
            return
          }

          setIsAuthenticated(true)
        }
      })

      // socketClient.current?.on(
      //   'join-room',
      //   (data) => {
      //     if (data.includes('coin98-bot')) {
      //       socketClient.current?.emit('request-sign-auth', {
      //         params: [
      //           "Sign message for authenticate to connect bot coin98",
      //           addressAuthen,
      //           "Example password"
      //         ],
      //         method: 'personal_sign'
      //       }, (dataCb: any) => {
  
      //       })
      //       socketClient.current?.removeListener('join-room')
  
      //       socketClient.current?.on(
      //         'on-response-sign-auth',
      //         (eventData) => {
      //           if (eventData.error) {
      //             reject(eventData)
      //             return false
      //           }
  
      //           socketClient.current?.removeListener('on-response-sign-auth')
                
      //           socketClient.current?.emit('authentication', {signature: eventData, address: addressAuthen}, (isAuthorized: boolean) => {
      //             if(isAuthorized) {
      //               setIsAuthenticated(true)
      //             } else {
      //               setAddress('')
      //               setIsAuthenticated(false)
      //             }
      //             resolve(isAuthenticated)
      //           })
      //         }
      //       )
      //     }
      //   }
      // )
  
      openTelegram(EVENT_NAME.signAuth)
    })
  }

  return (
    <Coin98Context.Provider value={{
      address,
      encryptionKey,
      isAuthenticated,
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