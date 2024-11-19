import React, { useState } from "react";
import { HandleCard } from "./HandleCard";
import { Coin98SDK, SupportChain } from "~coin98-com/telegram-connect-sdk";

const codeExampleSign = `
await coin98SDK.handle({
  method: 'eth_signTypedDataV4',
  chain: SupportChain.evm,
  data: {
    domain: {
      chainId: Number(coin98SDK.chainId),
      name: 'Ether Mail',
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
      version: '1',
    },
    message: {
      contents: 'Hello, Bob!',
      from: {
        name: 'Cow',
        wallets: [
          '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
        ],
      },
      to: [
        {
          name: 'Bob',
          wallets: [
            '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
            '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
            '0xB0B0b0b0b0b0B000000000000000000000000000',
          ],
        },
      ],
      attachment: '0x',
    },
    primaryType: 'Mail',
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" },
      ],
      Group: [
        { name: 'name', type: 'string' },
        { name: 'members', type: 'Person[]' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person[]' },
        { name: 'contents', type: 'string' },
        { name: 'attachment', type: 'bytes' },
      ],
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallets', type: 'address[]' },
      ],
    }
  }
})
`

export const SignTypedDataV4 = ({ address = '', coin98SDK }: { address: string, coin98SDK: Coin98SDK }) => {
  // const { signTypedDataV4, address } = useEvmHandle()
  const [signTypedDataV4Result, setSignTypedDataV4Result] = useState('')

  const handleSignTypedV4 = async () => {
    const result = await coin98SDK.handle({
      method: 'eth_signTypedDataV4',
      chain: SupportChain.evm,
      data: {
        domain: {
          chainId: Number(coin98SDK.chainId),
          name: 'Ether Mail',
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
          version: '1',
        },
        message: {
          contents: 'Hello, Bob!',
          from: {
            name: 'Cow',
            wallets: [
              '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
              '0xDeaDbeefdEAdbeefdEadbEEFdeadbeEFdEaDbeeF',
            ],
          },
          to: [
            {
              name: 'Bob',
              wallets: [
                '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
                '0xB0BdaBea57B0BDABeA57b0bdABEA57b0BDabEa57',
                '0xB0B0b0b0b0b0B000000000000000000000000000',
              ],
            },
          ],
          attachment: '0x',
        },
        primaryType: 'Mail',
        types: {
          EIP712Domain: [
            { name: "name", type: "string" },
            { name: "version", type: "string" },
            { name: "chainId", type: "uint256" },
            { name: "verifyingContract", type: "address" },
          ],
          Group: [
            { name: 'name', type: 'string' },
            { name: 'members', type: 'Person[]' },
          ],
          Mail: [
            { name: 'from', type: 'Person' },
            { name: 'to', type: 'Person[]' },
            { name: 'contents', type: 'string' },
            { name: 'attachment', type: 'bytes' },
          ],
          Person: [
            { name: 'name', type: 'string' },
            { name: 'wallets', type: 'address[]' },
          ],
        }
      }
    })

    setSignTypedDataV4Result(JSON.stringify(result))
  }

  return (
    <HandleCard
      title="SIGN TYPED DATA V4"
      btnA={{
        description: 'Sign',
        handle: handleSignTypedV4,
        codeExample: codeExampleSign,
        result: signTypedDataV4Result,
        disabled: !address
      }}
    />
  )
}