import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { Coin98SDK, SupportChain } from "~coin98-com/telegram-connect-sdk";

const codeExampleSign = `
const result = await coin98SDK.handle({
  method: 'eth_signTypedData',
  chain: SupportChain.evm,
  data: [
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
  ]
})
`

export const SignTypedData = ({ address = '', coin98SDK }: { address: string, coin98SDK: Coin98SDK }) => {
  const [signTypedDataResult, setSignTypedDataResult] = useState('')

  const handleSignPersonal = async () => {
    const result = await coin98SDK.handle({
      method: 'eth_signTypedData',
      chain: SupportChain.evm,
      data: [
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
      ]
    })

    setSignTypedDataResult(JSON.stringify(result))
  }

  return (
    <HandleCard
      title="SIGN TYPED DATA"
      btnA={{
        description: 'Sign',
        handle: handleSignPersonal,
        codeExample: codeExampleSign,
        result: signTypedDataResult,
        disabled: !address
      }}
    />
  )
}