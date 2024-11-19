'use client'
import React, { useState } from "react";
import { BasicActions } from "./_components/BasicActions";
import { ModalShowCode } from "./_components/ModalShowCode";
import { PersonalSign } from "./_components/PersonalSign";
import { SignTypedDataV4 } from "./_components/SignTypedDataV4";
import { SignTypedData } from "./_components/SignTypedData";
import { SignTypedDataV3 } from "./_components/SignTypedDataV3";
import { SendTransaction } from "./_components/SendTransaction";
import { SwitchChain } from "./_components/SwitchChain";
import { Encrypt } from "./_components/Encrypt";
import dynamic from "next/dynamic";
import { TelegramStar } from "./_components/TelegramStar";
import { Coin98Provider } from '~coin98-com/telegram-connect-sdk'

interface IIntegrationProps {
  switchChain: (chainId: string) => void
  chainId: string
}

const IntegrationScreen: React.FC<IIntegrationProps> = ({
  chainId,
  switchChain
}) => {
  return (
    <div className="bg-main-bg">
      <div className="bg-header bg-cover bg-no-repeat h-60 bg-center">
        <div className="flex flex-col justify-center items-start text-white h-full gap-y-4 px-4">
          <img className="w-36" src="/coin98-logo.svg" />
          <p className=" text-3xl"><span className=" text-main-yellow">Coin98</span> Connect</p>
          <p>E2E Test Dapps</p>
        </div>
      </div>
      <div className="p-4">
        <SwitchChain
          chainId={chainId}
          switchChain={switchChain}
        />
        <div className="flex flex-col items-center gap-y-6">

          <BasicActions />
          <PersonalSign />
          <SignTypedData />
          <SignTypedDataV3 chainId={chainId} />
          <SignTypedDataV4 chainId={chainId} />
          <SendTransaction />
          <Encrypt />

          <TelegramStar />

          <ModalShowCode />
        </div>
      </div>
    </div>
  )
}

const HomePage = () => {
  const [chainId, setChainId] = useState('0x38')

  const handleSwitchChain = (newChainId: string) => {
    setChainId(newChainId)
  }

  return (
    <Coin98Provider partner="eternals" chainId={chainId}>
      <IntegrationScreen
        switchChain={handleSwitchChain}
        chainId={chainId}
      />
    </Coin98Provider>
  )
}

export default dynamic(() => Promise.resolve(HomePage), {
  ssr: false
})
