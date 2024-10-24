import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { useEvmHandle } from "@/context/integration/evm";

const codeExampleSign = `
const { signTypedData, address } = useEvmHandle()
const handleSignPersonal = () => {
  signTypedData([
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
}
`

export const SignTypedData = () => {
  const { signTypedData, address } = useEvmHandle()
  const [signTypedDataResult, setSignTypedDataResult] = useState('')

  const handleSignPersonal = async () => {
    const result = await signTypedData([
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