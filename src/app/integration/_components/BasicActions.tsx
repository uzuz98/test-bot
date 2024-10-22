import React from "react";
import { HandleCard } from "./HandleCard";
import { useCoin98 } from "@/context";

const codeConnect = `
const {connect} = useCoin98()
const handleConnect = () => {
  connect()
}
`

export const BasicActions = () => {
  const {
    connect,
    address
  } = useCoin98()

  return (
    <HandleCard
      title='Basic Actions'
      btnA={{
        handle: connect,
        description: address ? 'Connected' : 'Connect',
        codeExample: codeConnect,
        disabled: !!address
      }}
    />
  )
}