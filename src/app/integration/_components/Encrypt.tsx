import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { useEvmHandle } from "@/context/integration/evm";

const codeExample = `
const { getEncryptionKey } = useEvmHandle()
getEncryptionKey()
`

const codeEncrypExample = `
const { encryptKey } = useEvmHandle()
encryptKey(<YOUR MESSAGE>)
`

const codeDecryptExample = `
const {decrypt} = useEvmHandle()
decrypt(<YOUR DATA ENCRYPTED>)
`

export const Encrypt = () => {
  const {getEncryptionKey, encryptKey, address, encryptionKey, decryptKey} = useEvmHandle()
  const [data, setData] = useState('')
  const [dataEncrypt, setDataEncrypt] = useState('')
  const [value, setValue] = useState('')
  const [dataDecrypt, setDataDecrypt] = useState('')

  const handleGetEncryption = async () => {
    const result = await getEncryptionKey()
    setData(JSON.stringify(result))
  }

  const handleEncryptKey = async () => {
    const result = encryptKey(value)
    setDataEncrypt(result)
  }

  const handleDecryptKey = async () => {
    const res = await decryptKey(dataEncrypt)

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
          disabled: !address || !encryptionKey || !value,
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