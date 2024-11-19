import React, { useEffect, useState } from "react";
import { CopyBlock, dracula } from 'react-code-blocks';

const getCode = (code: string) => {
  return`
  ${code}
`
}

export const ModalShowCode = () => {
  const [code, setCode] = useState('')

  const closeModal = () => {
    setCode('')
  }

  useEffect(() => {
    const body = document.querySelector('body')
    if (body) {
      body.style.overflowY = code ? 'hidden' : 'auto'
    }
  }, [code])

  useEffect(() => {
    // @ts-expect-error
    window.openModal = (newCode: string) => {
      setCode(newCode)
    }
    // @ts-expect-error
    window.closeModal = closeModal
  }, [])

  return (
    <div className={"fixed h-screen top-0 left-0 w-screen bg-[#0608164d] backdrop-blur-xl " +  (code ? 'block' : 'hidden')}>
      <div onClick={closeModal} className="absolute h-screen w-screen"></div>
      <div className="absolute bg-sub2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-lg font-medium text-white">Show Code</p>
          <p onClick={closeModal} className="cursor-pointer text-white">X</p>
        </div>
        <div>
          <CopyBlock
            text={code}
            language="javascript"
            theme={dracula}
            customStyle={{
              overflow: 'auto',
              paddingTop: '16px',
              maxHeight: '400px',
            }}
          />
        </div>
      </div>
    </div>
  )
}

