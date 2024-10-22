'use client'
import React, { ChangeEvent, useState } from "react";
import Coin98Provider from "@/context/provider";
import { useCoin98 } from "@/context";
import { HandleCard } from "./_components/HandleCard";
import { BasicActions } from "./_components/BasicActions";
import { ModalShowCode } from "./_components/ModalShowCode";
import { PersonalSign } from "./_components/PersonalSign";
import { SignTypedDataV4 } from "./_components/SignTypedDataV4";
import { SignTypedData } from "./_components/SignTypedData";
import { SignTypedDataV3 } from "./_components/SignTypedDataV3";
import { SendTransaction } from "./_components/SendTransaction";
import { SwitchChain } from "./_components/SwitchChain";

const IntegrationScreen = () => {
  const { address } = useCoin98()

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
        <SwitchChain/>
        <div className="flex flex-col items-center gap-y-6">

          <BasicActions />
          <PersonalSign />
          <SignTypedData/>
          <SignTypedDataV3/>
          <SignTypedDataV4/>
          <SendTransaction/>

          <ModalShowCode />
        </div>
      </div>
    </div>
  )
}

const HomePage = () => {
  return (
    <Coin98Provider partner="eternals">
      <IntegrationScreen/>
    </Coin98Provider>
  )
}

export default HomePage
