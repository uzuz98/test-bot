import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { Coin98SDK, SupportChain } from "~coin98-com/telegram-connect-sdk";

const codeExample = `
const result = await coin98SDK.handle({
  method: 'eth_getEncryptionPublicKey',
  chain: SupportChain.evm
})
`

const codeEncrypExample = `
const result = await coin98SDK.handle({
  method: 'encryptKey',
  data: value,
  chain: SupportChain.evm
})
`

const codeDecryptExample = `
const res = await coin98SDK.handle({
  method: 'eth_decrypt',
  chain: SupportChain.evm,
  data: {
    message: dataEncrypt
  }
})
`

export const Encrypt = ({ address, coin98SDK }: { address: string, coin98SDK: Coin98SDK }) => {
  // const {getEncryptionKey, encryptKey, encryptionKey, decryptKey} = coin98SDK
  const [data, setData] = useState('')
  const [dataEncrypt, setDataEncrypt] = useState('')
  const [value, setValue] = useState('')
  const [dataDecrypt, setDataDecrypt] = useState('')

  const handleGetEncryption = async () => {
    const result = await coin98SDK.handle({
      method: 'eth_getEncryptionPublicKey',
      chain: SupportChain.evm
    })
    setData(JSON.stringify(result))
  }

  const handleEncryptKey = async () => {
    const result = await coin98SDK.handle({
      method: 'encryptKey',
      data: value,
      chain: SupportChain.evm
    })
    setDataEncrypt(result)
  }

  const handleDecryptKey = async () => {
    const res = await coin98SDK.handle({
      method: 'eth_decrypt',
      chain: SupportChain.evm,
      data: {
        message: dataEncrypt
      }
    })

    setDataDecrypt(res)
  }

  return (
    <HandleCard
      title="ENCRYPT"
      btnA={{
        codeExample: codeExample,
        description: 'Get Public Encryption Key',
        handle: handleGetEncryption,
        result: data,
        disabled: !address
      }}
      // btnB={{}}
      inputCard={{
        value,
        onChangeValue: setValue,
        label: 'Encryption Text',
        btn: {
          codeExample: codeEncrypExample,
          description: 'Encrypt',
          handle: handleEncryptKey,
          disabled: !address || !data || !value,
          result: dataEncrypt
        }
      }}
      btnB={{
        codeExample: codeDecryptExample,
        description: 'Decrypt',
        handle: handleDecryptKey,
        disabled: !address || !dataEncrypt,
        result: dataDecrypt
      }}
    />
  )
}