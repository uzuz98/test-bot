'use client'
import React, { ChangeEvent, useState } from "react";
import Coin98Provider from "@/context/provider";
import { useCoin98 } from "@/context";

const CHAIN_LIST = [
  {
    chain: 'BNB Smart Chain',
    chainId: '0x38',
    numChainId: 56
  },
  {
    chain: 'Viction',
    chainId: '0x58',
    numChainId: 88
  },
  {
    chain: 'Ethereum',
    chainId: '0x1',
    numChainId: 1
  }
]

const IntegrationScreen = () => {
  const [value, setValue] = useState('')
  const [cipherText, setCipherText] = useState('')
  const [clearText, setClearText] = useState('')
  const [personalSignMsg, setPersonalSignMsg] = useState('')
  const [signTypedData, setSignTypedData] = useState('')
  const [txsHash, setTxsHash] = useState('')
  const [signTypedDataV3Res, setSignTypedDataV3Res] = useState('')
  const [signTypedDataV4Res, setSignTypedDataV4Res] = useState('')

  const {
    connect,
    address,
    encryptionKey,
    getEncryptionKey,
    decryptKey,
    encryptKey,
    sendTransaction,
    personalSign,
    signTypedData: handleSignTypedV1,
    signTypedDataV3,
    signTypedDataV4,
    isAuthenticated,
    chainId,
    switchChain
  } = useCoin98()

  const handleConnect = async () => {
    await connect()
  }

  const onChangeChain = (e: ChangeEvent<HTMLSelectElement>) => {
    switchChain(e.target.value)
  }

  const handleSendTransaction = async () => {
    const data = await sendTransaction({
      from: '0x5a94fF9fefc5B69140375739EB7018AcB0a60cbD',
      to: '0x5a94fF9fefc5B69140375739EB7018AcB0a60cbD',
      value: '0x0'
    })
    setTxsHash(data)
  }

  const handlePersonalSign = async () => {
    const data = await personalSign({
      message: "0x4578616d706c652060706572736f6e616c5f7369676e60206d657373616765",
      address: address,
      password: "Example password"
    })
    setPersonalSignMsg(data)
  }

  const handleGetEncryptionKey = async () => {
    const encryptionKey = await getEncryptionKey()
    console.log("🩲 🩲 => handleGetEncryptionKey => encryptionKey:", encryptionKey)
  }

  const handleEncryptKey = () => {
    const data = encryptKey(value)
    console.log("🩲 🩲 => handleEncryptKey => data:", data)
    setCipherText(data)
  }

  const handleDecryptKey = async () => {
    const data = await decryptKey(cipherText)
    setClearText(data)
  }

  const handleSignTypedDataV1 = async () => {
    const data = await handleSignTypedV1([
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
    ])
    setSignTypedData(data)
  }

  const handleSignTypedDataV3 = async () => {
    const data = await signTypedDataV3({
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallet', type: 'address' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person' },
          { name: 'contents', type: 'string' },
        ],
      },
      primaryType: 'Mail',
      domain: {
        name: 'Ether Mail',
        version: '1',
        chainId: Number(chainId),
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      },
      message: {
        from: {
          name: 'Cow',
          wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        },
        to: {
          name: 'Bob',
          wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
        },
        contents: 'Hello, Bob!',
      },
    })
    setSignTypedDataV3Res(data)
  }

  const handleSignTypedDataV4 = async () => {
    const data = await signTypedDataV4({
      domain: {
        chainId: Number(chainId),
        name: 'Ether Mail',
        verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        version: '1',
      },
      message: {
        contents: 'Hello, Bob!',
        from: {
          name: 'Cow',
          wallets: [
            '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
            '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
          ],
        },
        to: [
          {
            name: 'Bob',
            wallets: [
              '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
              '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
              '0xB0B0b0b0b0b0B000000000000000000000000000',
            ],
          },
        ],
        attachment: '0x',
      },
      primaryType: 'Mail',
      types: {
        EIP712Domain: [
          { name: "name", type: "string" },
          { name: "version", type: "string" },
          { name: "chainId", type: "uint256" },
          { name: "verifyingContract", type: "address" },
        ],
        Group: [
          { name: 'name', type: 'string' },
          { name: 'members', type: 'Person[]' },
        ],
        Mail: [
          { name: 'from', type: 'Person' },
          { name: 'to', type: 'Person[]' },
          { name: 'contents', type: 'string' },
          { name: 'attachment', type: 'bytes' },
        ],
        Person: [
          { name: 'name', type: 'string' },
          { name: 'wallets', type: 'address[]' },
        ],
      }
    })
    setSignTypedDataV4Res(data)
  }

  return (
    <div className="flex flex-col items-center gap-y-4 p-4 text-center">
      <h1>Integration Screen</h1>
      <div className="bg-gray-500 gap-x-2 w-80 text-white p-4 rounded-xl break-all">
        <p>Your address: </p>
        <p>{address}</p>
      </div>

      <div className="flex gap-x-2">
        <p>Chain</p>
        <select
          name="chainId"
          onChange={onChangeChain}
          value={chainId}
          >
          {CHAIN_LIST.map((item) => (
            <option value={item.chainId}>{item.chain}</option>
          ))}
        </select>
      </div>

      <div onClick={handleConnect} className={`cursor-pointer w-full border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center`}>
        Connect
      </div>

      <div className="p-4 bg-gray-400 flex flex-col items-center rounded-xl gap-y-4 w-full">
        <div onClick={handleGetEncryptionKey} className={`cursor-pointer w-full border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center ${address && isAuthenticated ? '' : 'opacity-50 border-black cursor-not-allowed'}`}>
          Get Encryption Key
        </div>
        <div className="gap-x-2 p-2 bg-yellow-400 w-full flex items-start break-all">
          Encryption key:
          <p className="flex-1">{encryptionKey}</p>
        </div>

        <input
          value={value}
          onChange={e => setValue(e.target.value)}
          className="rounded-sm w-full px-2 py-4"
          placeholder="Message to encrypt"
        />
        <div
          onClick={handleEncryptKey}
          className={`cursor-pointer w-full border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center ${address && isAuthenticated ? '' : 'opacity-50 border-black cursor-not-allowed'}r`}
        >
          Encrypt
        </div>
        <div onClick={handleDecryptKey} className={`cursor-pointer w-full border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center ${address && isAuthenticated ? '' : 'opacity-50 border-black cursor-not-allowed'}`}>
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
        <div onClick={handlePersonalSign} className={`cursor-pointer w-full border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center ${address && isAuthenticated ? '' : 'opacity-50 border-black cursor-not-allowed'}`}>
          Personal sign
        </div>

        <div className="gap-x-2 p-2 bg-yellow-400 w-full flex items-start break-all">
          Result:
          <p className="flex-1">{personalSignMsg}</p>
        </div>

        <div onClick={handleSignTypedDataV1} className={`cursor-pointer w-full border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center ${address && isAuthenticated ? '' : 'opacity-50 border-black cursor-not-allowed'}`}>
          Sign Typed Data
        </div>

        <div className="gap-x-2 p-2 bg-yellow-400 w-full flex items-start -breakall">
          Result:
          <p className="flex-1">{signTypedData}</p>
        </div>


        <div onClick={handleSignTypedDataV3} className={`cursor-pointer w-full border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center ${address && isAuthenticated ? '' : 'opacity-50 border-black cursor-not-allowed'}`}>
          Sign Typed Data V3
        </div>

        <div className="gap-x-2 p-2 bg-yellow-400 w-full flex items-start -breakall">
          Result:
          <p className="flex-1">{signTypedDataV3Res}</p>
        </div>

        <div onClick={handleSignTypedDataV4} className={`cursor-pointer w-full border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center ${address && isAuthenticated ? '' : 'opacity-50 border-black cursor-not-allowed'}`}>
          Sign Typed Data V4
        </div>

        <div className="gap-x-2 p-2 bg-yellow-400 w-full flex items-start -breakall">
          Result:
          <p className="flex-1">{signTypedDataV4Res}</p>
        </div>
      </div>

      <div className="p-4 bg-gray-400 flex flex-col items-center rounded-xl gap-y-4 w-full break-all">
        <div onClick={handleSendTransaction} className={`cursor-pointer w-full border border-yellow-300 bg-yellow-200 rounded-xl p-4 flex justify-center items-center ${address && isAuthenticated ? '' : 'opacity-50 border-black cursor-not-allowed'}`}>
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

const HomePage = () => {
  return (
    <Coin98Provider partner="eternals">
      <IntegrationScreen/>
    </Coin98Provider>
  )
}

export default HomePage
