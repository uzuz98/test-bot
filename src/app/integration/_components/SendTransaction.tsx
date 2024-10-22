import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { useCoin98 } from "@/context";

const codeExample = `
const {sendTransaction, address} = useCoin98()

const handleSendTransaction = async () => {
  await sendTransaction({
    from: address,
    to: address,
    value: '0x0'
  })
}
`

export const SendTransaction = () => {
  const {sendTransaction, address} = useCoin98()
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
        disabled: !address
      }}
    />
  )
}