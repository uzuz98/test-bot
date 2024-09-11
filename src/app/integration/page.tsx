'use client'
import React, { useEffect, useRef, useState } from "react";
import {io, Socket} from 'socket.io-client'
import * as ethUtil from '@metamask/eth-sig-util'
import {ethers} from 'ethers'

type FuncHandleOpenGateWay = <T = any> (message: any, callback: (data: T) => void) => void
interface TelegramUser{
  id: number
  first_name: string
  last_name: string
  username: string
  language_code: string
  allows_write_to_pm: boolean
}


const getTelegramUser = (): Partial<TelegramUser> => {
  try {
    const searchData = new URLSearchParams(window.Telegram?.WebApp?.initData)
    const user = searchData.get('user')

    if (!user) {
      throw Error('not found')
    }
    return JSON.parse(user)
  } catch (e) {
    // Default user for testing on browser
    return {}
  }
}

const IntegrationScreen = () => {
  const [value, setValue] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [encryptionKey, setEncryptionKey] = useState('')
  const [cipherText, setCipherText] = useState('')
  const [clearText, setClearText] = useState('')
  const [personalSignMsg, setPersonalSignMsg] = useState('')
  const [signTypedData, setSignTypedData] = useState('')
  const [txsHash, setTxsHash] = useState('')

  const ioClient = useRef<Socket>()

  const handleOpenGateway: FuncHandleOpenGateWay = (message, callback) => {
    const user = getTelegramUser()

    const socketClient = io('https://sse-example-zzop.onrender.com/', {
      transports: ['websocket'],
    // const socketClient = io('https://sse-example-zzop.onrender.com', {
      query: {
        partner: 'coin98',
        id: user.id
      }
    })

    socketClient.on('join-room', (data) => {
      if(data.includes('coin98-bot')) {
        socketClient.emit('from-wallet', message)

        socketClient.on('event-sdk', (eventData) => {
          console.log("🩲 🩲 => socketClient.on => eventData:", eventData)
          if(eventData.error) {
            return
          }
          callback(eventData)
          socketClient.disconnect()
        })
      }
    })
    const url = new URL('https://t.me/uzuz_send_message_bot/integration_app')
    const startapp = 'coin98'
    url.searchParams.append('partner', startapp)

    window.Telegram.WebApp.openTelegramLink(url.toString())
    // ioClient.current?.emit('')
    // window.open('http://localhost:8000/tabs/integration.html', "_blank")
  }

  const handleConnect = async () => {
    handleOpenGateway<[string]>({
      method: "eth_requestAccounts",
      params: []
    }, (data) => {
      setAddress(data[0])
    })
  }

  const handleSendTransaction = () => {
    const data = {
      method: 'eth_sendTransaction',
      params: [
        {
          "from": address,
          "to": address,
          "value": "0x0",
          "gasLimit": "0x5208",
          "gasPrice": "0x2540be400",
          "type": "0x0"
        }
      ]
    }
    handleOpenGateway(data, setTxsHash)
  }

  const handlePersonalSign = () => {
    const data = {
      params: [
        "0x4578616d706c652060706572736f6e616c5f7369676e60206d657373616765",
        "0xb5a53013aad152a5ea01a9b3fbeef81bba4b280c",
        "Example password"
      ],
      method: 'personal_sign'
    }
    
    handleOpenGateway<string>(data, setPersonalSignMsg)
  }

  const handleGetEncryptionKey = () => {
    const data = {
      method: "eth_getEncryptionPublicKey",
      params: [
        address
      ]
    }
    handleOpenGateway<string>(data, setEncryptionKey)
  }

  const handleEncryptKey = () => {
    if(!encryptionKey) return
    const encryptMessage = ethUtil.encrypt({
      publicKey: encryptionKey,
      data: value,
      version: 'x25519-xsalsa20-poly1305'
    })
    const message = ethers.hexlify(Buffer.from(JSON.stringify(encryptMessage)))
    setCipherText(message)
  }

  const handleDecryptKey = () => {
    if(!encryptionKey && !cipherText) return
    const data = {
      method: 'eth_decrypt',
      params: [
        cipherText,
        address
      ]
    }
    handleOpenGateway<string>(data, setClearText)
  }

  const handleSignTypedDataV1 = () => {
    const data = {
      method: 'eth_signTypedData',
      params: [
        [
          {
              "type": "string",
              "name": "Message",
              "value": "Hi, Alice!"
          },
          {
              "type": "uint32",
              "name": "A number",
              "value": "1337"
          }
        ],
        address
      ]
    }
    handleOpenGateway(data, setSignTypedData)
  }

  return (
    <div className="flex flex-col items-center gap-y-4 p-4 text-center">
      <h1>Integration Screen</h1>
      <div className="bg-gray-500 gap-x-2 w-80 text-white p-4 rounded-xl break-all">
        <p>Your address: </p>
        <p>{address}</p>
      </div>

      <div onClick={handleConnect} className="cursor-pointer border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center">
        Connect
      </div>

      <div className="p-4 bg-gray-400 flex flex-col items-center rounded-xl gap-y-4 w-full">
        <div onClick={handleGetEncryptionKey} className="cursor-pointer border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center">
          Get Encryption Key
        </div>
        <div className="gap-x-2 p-2 bg-yellow-400 w-full flex items-start break-all">
          Encryption key:
          <p className="flex-1">{encryptionKey}</p>
        </div>

        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          className="rounded-sm"
          placeholder="Message to encrypt"
        />
        <div
          onClick={handleEncryptKey}
          className="cursor-pointer border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center"
        >
          Encrypt
        </div>
        <div onClick={handleDecryptKey} className="cursor-pointer border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center">
          Decrypt
        </div>

        <div className="gap-x-2 p-2 bg-yellow-400 w-full flex items-start break-all">
          <p className="">
          Ciphertext:
          </p>
          <p className="flex-1">{cipherText}</p>
        </div>
        <div className="gap-x-2 p-2 bg-yellow-400 w-full flex items-start break-all">
          Cleartext:
          <p className="flex-1">{clearText}</p>
        </div>
      </div>

      <div className="p-4 bg-gray-400 flex flex-col items-center rounded-xl gap-y-4 w-full break-all">
        <div onClick={handlePersonalSign} className="cursor-pointer border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center">
          Personal sign
        </div>

        <div className="gap-x-2 p-2 bg-yellow-400 w-full flex items-start break-all">
          Result:
          <p className="flex-1">{personalSignMsg}</p>
        </div>

        <div onClick={handleSignTypedDataV1} className="cursor-pointer border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center">
          Sign Typed Data
        </div>

        <div className="gap-x-2 p-2 bg-yellow-400 w-full flex items-start -breakall">
          Result:
          <p className="flex-1">{signTypedData}</p>
        </div>
      </div>

      <div className="p-4 bg-gray-400 flex flex-col items-center rounded-xl gap-y-4 w-full break-all">
        <div onClick={handleSendTransaction} className="cursor-pointer border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center">
          Send Transaction
        </div>

        <div className="gap-x-2 p-2 bg-yellow-400 w-full flex items-start break-all">
          Result:
          <p className="flex-1">{txsHash}</p>
        </div>
      </div>
    </div>
  )
}

export default IntegrationScreen
