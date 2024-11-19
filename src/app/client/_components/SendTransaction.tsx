import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { Coin98SDK, SupportChain } from "~coin98-com/telegram-connect-sdk";

const codeExample = `
const result = await coin98SDK.handle({
  chain: SupportChain.evm,
  method: 'eth_sendTransaction',
  data: {
    from: address,
    to: address,
    value: '0x0'
  }
})
`

export const SendTransaction = ({ address = '', coin98SDK }: { address: string, coin98SDK: Coin98SDK }) => {
  // const {sendTransaction, address} = useEvmHandle()
  const [txsResult, setTxResult] = useState('')

  const handleSendTransaction = async () => {
    const result = await coin98SDK.handle({
      chain: SupportChain.evm,
      method: 'eth_sendTransaction',
      data: {
        from: address,
        to: address,
        value: '0x0'
      }
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