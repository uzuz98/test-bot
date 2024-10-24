import { useCoin98 } from "@/context";
import { ERROR_MESSAGE } from "@/context/constants";
import { getReqEvent, getResponseEvent } from "@/context/services";
import { EVENT_NAME } from "@/context/types";
import { IEvmContext, IParamsPersonalSign, IParamsSendTransaction, IParamsSignTypedData, IParamsSignTypedDataV1, ITypesTypedData } from './type'
import React, { useState } from "react";
import * as ethUtil from '@metamask/eth-sig-util'
import {ethers} from 'ethers'

const EvmContext = React.createContext<IEvmContext>({
  address: '',
  encryptionKey: ''
} as IEvmContext)

const EvmProvider: React.FC<React.PropsWithChildren> = ({children}) => {
  const {handleOpenGateway, activeSocket, mqttClient, openTelegram, threadNameMqtt} = useCoin98()

  const [address, setAddress] = useState('')
  const [encryptionKey, setEncryptionKey] = useState('')


  const connect = async () => {
    const platform: string = window.Telegram.WebApp.platform as string
    if(ERROR_MESSAGE[platform]) {
      window.Telegram.WebApp.showAlert(ERROR_MESSAGE[platform])
      throw Error('error')
    }

    // const version = window.Telegram.WebApp.version

    const mqttClient = await activeSocket()

    const message = {
      method: "eth_requestAccounts",
      params: []
    }

    return await new Promise<string>((resolve, reject) => {
      mqttClient.removeAllListeners('message')
      mqttClient.on('message', (topic, data) => {
        let resMsg: {
          data: any
          event: string
        } = JSON.parse(data.toString())

        if(resMsg.event === 'join-room') {
          mqttClient.publish(threadNameMqtt, JSON.stringify({
            data: message,
            event: getReqEvent(EVENT_NAME.connectWallet)
          }))
        }

        if(resMsg.event === getResponseEvent(EVENT_NAME.connectWallet)) {
          mqttClient.removeAllListeners('message')
          
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

  const sendTransaction = (params: IParamsSendTransaction) => {
    const data = {
      method: 'eth_sendTransaction',
      params: [
        params
      ]
    }
    return handleOpenGateway<string>(data)
  }

  const personalSign = (params: IParamsPersonalSign) => {
    const data = {
      params: [...Object.values(params), address],
      method: 'personal_sign'
    }
    
    
    return handleOpenGateway<string>(data)
  }

  const getEncryptionKey = () => {
    const data = {
      method: "eth_getEncryptionPublicKey",
      params: [
        address
      ]
    }
    return handleOpenGateway<string>(data, setEncryptionKey)
  }

  const encryptKey = (data: string) => {
    if(!encryptionKey) throw new Error('need encryption key')
    const encryptMessage = ethUtil.encrypt({
      publicKey: encryptionKey,
      data,
      version: 'x25519-xsalsa20-poly1305'
    })
    const message = ethers.hexlify(Buffer.from(JSON.stringify(encryptMessage)))
    return message
  }

  const decryptKey = (message: string) => {
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

  const signTypedData = (params: IParamsSignTypedDataV1[]) => {
    const data = {
      method: 'eth_signTypedData',
      params: [
        params,
        address
      ]
    }
    return handleOpenGateway(data)
  }

  const signTypedDataV3 = <T extends ITypesTypedData> (params: IParamsSignTypedData<T>) => {
    const data = {
      method: "eth_signTypedData_v3",
      params: [
        address,
        JSON.stringify(params)
      ]
    }

    return handleOpenGateway(data)
  }

  const signTypedDataV4 = <T extends ITypesTypedData> (params: IParamsSignTypedData<T>) => {
    const data = {
      method: "eth_signTypedData_v4",
      params: [
        address,
        JSON.stringify(params)
      ]
    }

    return handleOpenGateway(data)
  }

  return (
    <EvmContext.Provider value={{
      address,
      encryptionKey,
      connect,
      decryptKey,
      encryptKey,
      getEncryptionKey,
      personalSign,
      sendTransaction,
      signTypedData,
      signTypedDataV3,
      signTypedDataV4,
    }}>
      {children}
    </EvmContext.Provider>
  )
}

const useEvmHandle = () => React.useContext(EvmContext)

export {
  EvmProvider,
  useEvmHandle
}