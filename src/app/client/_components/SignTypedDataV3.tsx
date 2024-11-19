import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { Coin98SDK, SupportChain } from "~coin98-com/telegram-connect-sdk";

const codeExampleSign = `
const result = await coin98SDK.handle({
  chain: SupportChain.evm,
  method: 'eth_signTypedDataV3',
  data: {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    },
    primaryType: 'Mail',
    domain: {
      name: 'Ether Mail',
      version: '1',
      chainId: Number(coin98SDK.chainId),
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    },
    message: {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: 'Hello, Bob!',
    },
  }
})
`

export const SignTypedDataV3 = ({ address = '', coin98SDK }: { address: string, coin98SDK: Coin98SDK }) => {
  // const { signTypedDataV3, address } = useEvmHandle()
  const [signTypedDataV3Result, setSignTypedDataV3Result] = useState('')

  const handleSignPersonal = async () => {
    const result = await coin98SDK.handle({
      chain: SupportChain.evm,
      method: 'eth_signTypedDataV3',
      data: {
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallet', type: 'address' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person' },
            { name: 'contents', type: 'string' },
          ],
        },
        primaryType: 'Mail',
        domain: {
          name: 'Ether Mail',
          version: '1',
          chainId: Number(coin98SDK.chainId),
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
        },
        message: {
          from: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
          contents: 'Hello, Bob!',
        },
      }
    })

    setSignTypedDataV3Result(JSON.stringify(result))
  }

  return (
    <HandleCard
      title="SIGN TYPED DATA V3"
      btnA={{
        description: 'Sign',
        handle: handleSignPersonal,
        codeExample: codeExampleSign,
        result: signTypedDataV3Result,
        disabled: !address
      }}
    />
  )
}