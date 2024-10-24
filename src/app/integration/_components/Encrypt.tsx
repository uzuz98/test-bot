import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { useEvmHandle } from "@/context/integration/evm";

const codeExample = `
const { getEncryptionKey } = useEvmHandle()
getEncryptionKey()
`

export const Encrypt = () => {
  const {getEncryptionKey} = useEvmHandle()
  const [data, setData] = useState('')

  const handleGetEncryption = async () => {
    const result = await getEncryptionKey()
    setData(JSON.stringify(result))
  }

  return (
    <HandleCard 
      title="ENCRYPT"
      btnA={{
        codeExample: codeExample,
        description: 'Get Public Encryption Key',
        handle: handleGetEncryption,
        result: data
      }}
      // btnB={{}}
    />
  )
}