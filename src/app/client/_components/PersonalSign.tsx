import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { Coin98SDK, SupportChain } from "~coin98-com/telegram-connect-sdk";

const codeExampleSign = `
const result = await coin98SDK.handle({
  chain: SupportChain.evm,
  method: 'personal_sign',
  data: {
    message: 'This is message'
  }
})
`

export const PersonalSign = ({ address = '', coin98SDK }: {
  coin98SDK: Coin98SDK,
  address: string
}) => {
  const [personalResult, setPersonalResult] = useState('')

  const handleSignPersonal = async () => {
    const result = await coin98SDK.handle({
      chain: SupportChain.evm,
      method: 'personal_sign',
      data: {
        message: 'This is message'
      }
    })

    setPersonalResult(JSON.stringify(result))
  }

  return (
    <HandleCard
      title="PERSONAL SIGN"
      btnA={{
        description: 'Sign',
        handle: handleSignPersonal,
        codeExample: codeExampleSign,
        result: personalResult,
        disabled: !address
      }}
    />
  )
}