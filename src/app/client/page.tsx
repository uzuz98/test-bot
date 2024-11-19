'use client'
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { HandleCard } from "./_components/HandleCard";
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
import { DEFAULT_CHAIN_ID } from "../constants";
import { Coin98SDK } from "~coin98-com/telegram-connect-sdk";

interface IIntegrationProps {
  switchChain: (chainId: string) => void
  chainId: string
  address: string
  setAddress: (address: string) => void
  coin98SDK: Coin98SDK
}

const IntegrationScreen: React.FC<IIntegrationProps> = ({
  chainId,
  switchChain,
  address,
  setAddress,
  coin98SDK
}) => {
  return (
    <div className="bg-main-bg">
      <div className="bg-header bg-cover bg-no-repeat h-60 bg-center">
        <div className="flex flex-col justify-center items-start text-white h-full gap-y-4 px-4">
          <img className="w-36" src="/coin98-logo.svg"/>
          <p className=" text-3xl"><span className=" text-main-yellow">Coin98</span> Connect</p>
          <p>E2E Test Dapps</p>
        </div>
      </div>
      <div className="p-4">
        <SwitchChain
          chainId={chainId}
          switchChain={switchChain}
          address={address}
        />
        <div className="flex flex-col items-center gap-y-6">

          <BasicActions
            address={address}
            setAddress={setAddress}
            coin98SDK={coin98SDK}
          />
          <PersonalSign 
            address={address}
            coin98SDK={coin98SDK}
          />
          <SignTypedData
            address={address}
            coin98SDK={coin98SDK}
          />
          <SignTypedDataV3
            address={address}
            coin98SDK={coin98SDK}
          />
          <SignTypedDataV4 
            address={address}
            coin98SDK={coin98SDK}
          />
          <SendTransaction 
            address={address}
            coin98SDK={coin98SDK}
          />
          <Encrypt
            address={address}
            coin98SDK={coin98SDK}
          />

          <ModalShowCode />
        </div>
      </div>
    </div>
  )
}

const HomePage = () => {
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID)
  const [address, setAddress] = useState('')
  const [coin98SDK, setCoin98SDK] = useState<Coin98SDK>()

  const handleSwitchChain = (newChainId: string) => {
    coin98SDK?.switchChainId(newChainId)
    setChainId(newChainId)
  }

  useEffect(() => {
    setCoin98SDK(new Coin98SDK('eternals', chainId))
  }, [])

  return (
    <IntegrationScreen
      switchChain={handleSwitchChain}
      chainId={chainId}
      setAddress={setAddress}
      address={address}
      coin98SDK={coin98SDK!}
    />
  )
}

export default dynamic(() => Promise.resolve(HomePage), {
  ssr: false
})
