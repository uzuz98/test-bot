import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { Coin98SDK, SupportChain } from '~coin98-com/telegram-connect-sdk'

const codeConnect = `
const addressConnected = await coin98SDK.connect(SupportChain.evm)
setAddress(addressConnected)
`
export const BasicActions = (props: {
  address: string
  setAddress: (address: string) => void
  coin98SDK: Coin98SDK
}) => {
  const { address, setAddress, coin98SDK } = props

  const handleConnect = async () => {
    const addressConnected = await coin98SDK?.connect(SupportChain.evm)
    setAddress(addressConnected)
  }

  return (
    <HandleCard
      title='BASIC ACTIONS'
      btnA={{
        handle: handleConnect,
        description: address ? 'Connected' : 'Connect',
        codeExample: codeConnect,
        disabled: !!address
      }}
    />
  )
}