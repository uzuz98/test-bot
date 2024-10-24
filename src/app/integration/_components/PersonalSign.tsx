import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { useEvmHandle } from "@/context/integration/evm";

const codeExampleSign = `
const { personalSign } = useEvmHandle()
const handleSignPersonal = () => {
  personalSign({
    message: 'This is message'
  })
}
`

export const PersonalSign = () => {
  const { personalSign, address } = useEvmHandle()
  const [personalResult, setPersonalResult] = useState('')

  const handleSignPersonal = async () => {
    const result = await personalSign({
      message: 'This is message'
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