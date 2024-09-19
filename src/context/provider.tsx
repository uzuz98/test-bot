import React, { useRef, useState } from "react";
import { Coin98Context } from ".";
import { io, Socket } from "socket.io-client";
import * as ethUtil from '@metamask/eth-sig-util'
import {ethers} from 'ethers'
import { encodeTelegramUrlParameters, getReqEvent, getResponseEvent, getTelegramUser } from "./services";
import { EVENT_NAME, FuncHandleOpenGateWay, ICoin98Props, IParamsPersonalSign, IParamsSendTransaction, IParamsSignTypedData, IParamsSignTypedDataV1, ITypesTypedData } from "./types";

const Coin98Provider: React.FC<React.PropsWithChildren<ICoin98Props>> = ({children, partner}) => {
  const [address, setAddress] = useState('')
  const [encryptionKey, setEncryptionKey] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const socketClient = useRef<Socket>()

  const openTelegram = (eventType: EVENT_NAME = EVENT_NAME.integration) => {
    const url = new URL('https://t.me/uzuz_send_message_bot/integration_app')
    // const url = new URL('http://localhost:8000/tabs/integration.html')

    const encodeUrl = encodeTelegramUrlParameters(`partner=${partner}&type=${eventType}`)

    url.searchParams.append('startapp', encodeUrl)
    // url.searchParams.append('type', eventType)

    window.Telegram.WebApp.openTelegramLink(url.toString())
    // window.open(url.toString(), "_blank")
  }
  
  const activeSocket = () => {
    const user = getTelegramUser()

    // socketClient.current = io('http://localhost:3001', {
    socketClient.current = io('https://sse-example-zzop.onrender.com', {
      transports: ['websocket'],
      query: {
        partner: partner,
        id: user.id
      }
    })
  }

  const handleOpenGateway: FuncHandleOpenGateWay = async (message, callback) => {
    return await new Promise((resolve, reject) => {
      socketClient.current?.on(EVENT_NAME.joinRoom, (data) => {
        if(data.includes('coin98-bot')) {
          socketClient.current?.emit(getReqEvent(EVENT_NAME.integration), message, () => {
            socketClient.current?.removeListener(EVENT_NAME.joinRoom)
          })
  
          socketClient.current?.on(getResponseEvent(EVENT_NAME.integration), (eventData) => {
            if(eventData.error) {
              reject(eventData)
              callback?.(eventData)
              return
            }
            callback?.(eventData)
            resolve(eventData)
            socketClient.current?.removeListener(getResponseEvent(EVENT_NAME.integration))
          })
        }
      })
      openTelegram()
    })
  }

  const handleConnect = async () => {
    activeSocket()

    const message = {
      method: "eth_requestAccounts",
      params: []
    }

    return await new Promise<string>((resolve, reject) => {
      socketClient.current?.on(EVENT_NAME.joinRoom, (data) => {
        if(data.includes('coin98-bot')) {
          socketClient.current?.emit(
            getReqEvent(EVENT_NAME.connectWallet),
            message,
            (dataCb: any) => {}
          )
          socketClient.current?.removeListener(EVENT_NAME.joinRoom)
  
          socketClient.current?.on(
            getResponseEvent(EVENT_NAME.connectWallet),
            (eventData) => {
              socketClient.current?.removeListener(getResponseEvent(EVENT_NAME.connectWallet))
              if(eventData.error) {
                reject(eventData)
                return
              }
              resolve(eventData[0] as string)
              setAddress(eventData[0] as string)
            }
          )
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
      params: [
        Object.values(params)
      ],
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

    return handleOpenGateway(data,)
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

  const handleSwitchChain = () => {

  }

  const handleAuthentication = async () => {
    return await new Promise<boolean>((resolve, reject) => {
      socketClient.current?.on(
        'join-room',
        (data) => {
          if (data.includes('coin98-bot')) {
            socketClient.current?.emit('request-sign-auth', {
              params: [
                "Sign message for authenticate to connect bot coin98",
                address,
                "Example password"
              ],
              method: 'personal_sign'
            }, (dataCb: any) => {
  
            })
            socketClient.current?.removeListener('join-room')
  
            socketClient.current?.on(
              'on-response-sign-auth',
              (eventData) => {
                if (eventData.error) {
                  reject(eventData)
                  return false
                }
  
                socketClient.current?.removeListener('on-response-sign-auth')
                
                socketClient.current?.emit('authentication', {signature: eventData, address}, (isAuthorized: boolean) => {
                  if(isAuthorized) {
                    setIsAuthenticated(true)
                  } else {
                    setAddress('')
                    setIsAuthenticated(false)
                  }
                  resolve(isAuthenticated)
                })
              }
            )
          }
        }
      )
  
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
      authentication: handleAuthentication
    }}>
      {children}
    </Coin98Context.Provider>
  )
}

export default Coin98Provider