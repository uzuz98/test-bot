import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { useCoin98 } from "@/context";

const codeExampleSign = `
const { personalSign } = useCoin98()
const handleSignPersonal = () => {
  personalSign({
    message: 'This is message'
  })
}
`

export const PersonalSign = () => {
  const { personalSign, address } = useCoin98()
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