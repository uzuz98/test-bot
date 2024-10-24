import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { useEvmHandle } from "@/context/integration/evm";

const codeExample = `
const {sendTransaction, address} = useEvmHandle()

const handleSendTransaction = async () => {
  await sendTransaction({
    from: address,
    to: address,
    value: '0x0'
  })
}
`

export const SendTransaction = () => {
  const {sendTransaction, address} = useEvmHandle()
  const [txsResult, setTxResult] = useState('')

  const handleSendTransaction = async () => {
    const result = await sendTransaction({
      from: address,
      to: address,
      value: '0x0'
    })
    setTxResult(JSON.stringify(result))
  }
    
  return (
    <HandleCard
      title="SEND NATIVE TOKEN"
      btnA={{
        description: 'Send',
        codeExample: codeExample,
        handle: handleSendTransaction,
        disabled: !address,
        result: txsResult
      }}
    />
  )
}