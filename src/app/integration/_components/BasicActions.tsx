import React from "react";
import { HandleCard } from "./HandleCard";
import { useEvmHandle } from "~coin98-com/telegram-connect-sdk";

const codeConnect = `
const {connect} = useEvmHandle()
const handleConnect = () => {
  connect()
}
`
export const BasicActions = () => {
  const {
    connect,
    address
  } = useEvmHandle()
  
  return (
    <HandleCard
      title='BASIC ACTIONS'
      btnA={{
        handle: connect,
        description: address ? 'Connected' : 'Connect',
        codeExample: codeConnect,
        disabled: !!address
      }}
    />
  )
}