'use client'
import React, { ChangeEvent } from "react";

interface IHandleCard {
  title: string
  btnA: {
    description: string
    codeExample: string
    handle: () => void
    result?: string
    disabled?: boolean
  }
  btnB?: {
    description: string
    codeExample: string
    handle: () => any
    result?: string
    disabled?: boolean
  }
  inputCard?: {
    value: string
    onChangeValue: (value: string) => void
    label: string
    btn: {
      description: string
      codeExample: string
      handle: () => any
      result?: string
      disabled?: boolean
    }
  }
}

export const HandleCard = (props: IHandleCard) => {
  const {title, btnA, btnB, inputCard} = props

  const handleShowCode = (code: string) => () => {
    // @ts-expect-error
    window.openModal(code)
  }

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    inputCard?.onChangeValue(e.target.value)
  }

  return (
    <div className="p-4 bg-thumbnail bg-sub1 bg-top bg-no-repeat text-white rounded-xl w-full flex flex-col gap-y-4">
      <p className="text-main-yellow text-xl font-semibold text-center">
        {title}
      </p>
      <div>
        <div
          onClick={btnA.disabled ? undefined : btnA.handle}
          className={"cursor-pointer py-4 text-center rounded-md bg-sub-yellow " + (btnA.disabled ? 'bg-sub2 cursor-not-allowed' : 'bg-sub-yellow hover:text-black')}
        >
          <p>{btnA.description}</p>
        </div>
        <div
          onClick={handleShowCode(btnA.codeExample)}
          className="text-sub2-yellow cursor-pointer text-center my-2 text-sm"
        >
          <p>{'< >'} Show code Example</p>
        </div>
        {
          btnA.result && (
            <div className="bg-sub3-yellow rounded-md p-4 break-all">
              <p className="text-sub2-yellow">Result:</p>
              <p>{btnA.result}</p>
            </div>
          )
        }
      </div>

      {
        inputCard ? (
          <>
            <input
              className="p-4 rounded-md bg-sub2 outline-none"
              value={inputCard.value}
              onChange={onChange}
              placeholder={inputCard.label}
            />
            <div>
              <div
                onClick={inputCard.btn.disabled ? undefined : inputCard.btn.handle}
                className={"cursor-pointer py-4 text-center rounded-md bg-sub-yellow " + (inputCard.btn.disabled ? 'bg-sub2 cursor-not-allowed' : 'bg-sub-yellow hover:text-black')}
              >
                <p>{inputCard.btn.description}</p>
              </div>
              <div
                onClick={handleShowCode(inputCard.btn.codeExample)}
                className="text-sub2-yellow cursor-pointer text-center my-2 text-sm"
              >
                <p>{'< >'} Show code Example</p>
              </div>
              {
                inputCard.btn.result && (
                  <div className="bg-sub3-yellow rounded-md p-4 break-all">
                    <p className="text-sub2-yellow">Result:</p>
                    <p>{inputCard.btn.result}</p>
                  </div>
                )
              }
            </div>
          </>
        ) : null
      }

      {
        btnB && (
          <>
            <div>
              <div
                onClick={btnB.disabled ? undefined : btnB.handle}
                className={"cursor-pointer py-4 text-center rounded-md bg-sub-yellow  " + (btnB.disabled ? 'bg-sub2 cursor-not-allowed' : 'bg-sub-yellow hover:text-black')}
                >
                <p>{btnB.description}</p>
              </div>
              <div onClick={handleShowCode(btnB.codeExample)} className="text-sub2-yellow cursor-pointer text-center my-2 text-sm">
                <p>{'< >'} Show code Example</p>
              </div>
            </div>
            {
              btnB.result && (
                <div className="bg-sub3-yellow rounded-md p-4 break-all">
                  <p className="text-sub2-yellow">Result:</p>
                  <p>{btnB.result}</p>
                </div>
              )
            }
          </>
        )
      }
    </div>
  )
}