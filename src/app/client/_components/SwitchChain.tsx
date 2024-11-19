import { Coin98SDK } from "~coin98-com/telegram-connect-sdk";
import React, { useMemo, useState } from "react";

interface IProps {
  chainId: string
  switchChain: (chainId: string) => void
  address: string
}

const CHAIN_LIST = [
  {
    chain: 'BNB Smart Chain',
    chainId: '0x38',
    numChainId: 56
  },
  {
    chain: 'Viction',
    chainId: '0x58',
    numChainId: 88
  },
  {
    chain: 'Ethereum Mainnet',
    chainId: '0x1',
    numChainId: 1
  }
]

export const SwitchChain: React.FC<IProps> = ({ chainId, switchChain, address }) => {
  // const { address } = useEvmHandle()
  const [isCollapse, setIsCollapse] = useState(true)
  // if(!address) return null

  const handleSwitchChain = (newChainId: string) => () => {
    switchChain(newChainId)
    setIsCollapse(false)
  }

  const toggleMenu = () => {
    setIsCollapse(prev => !prev)
  }

  const findChain = useMemo(() => {
    return CHAIN_LIST.find(chain => chain.chainId === chainId)
  }, [chainId])

  return (
    <div className="text-white mb-4 flex flex-col gap-y-4">
      <p className='font-semibold text-2xl'>EVM</p>
      <div onClick={toggleMenu} className="cursor-pointer relative bg-sub2 rounded-lg px-3 py-2 w-52 flex justify-between items-center">
        <p>{findChain?.chain}</p>
        <div>
          <svg fill="#fff" height="16px" width="16px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 511.787 511.787" ><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M508.667,125.707c-4.16-4.16-10.88-4.16-15.04,0L255.76,363.573L18,125.707c-4.267-4.053-10.987-3.947-15.04,0.213 c-3.947,4.16-3.947,10.667,0,14.827L248.293,386.08c4.16,4.16,10.88,4.16,15.04,0l245.333-245.333 C512.827,136.693,512.827,129.867,508.667,125.707z"></path> </g> </g> </g></svg>
        </div>

        <div className={"absolute bg-sub2 top-full translate-y-2 w-full left-0 rounded-lg transition-all overflow-hidden " + (isCollapse ? 'max-h-0' : 'max-h-[200px]')}>
          {
            CHAIN_LIST.map((chainData) => (
              <div className={"p-2 " + (chainId === chainData.chainId ? 'text-main-yellow' : '')} onClick={handleSwitchChain(chainData.chainId)}>
                {chainData.chain}
              </div>
            ))
          }
        </div>
      </div>
      <div className="bg-[#cd6a6580] text-xs rounded-full px-4 py-3 border border-[#b9423c] w-fit">
        <span>
          Your are on the {findChain?.chain}
        </span>
      </div>
      <div className="bg-sub2 text-xs rounded-full px-4 py-3 border border-main-yellow w-fit">
        <span className="text-main-yellow">
          Chain ID <span className="text-white">{findChain?.chainId}</span>
        </span>
      </div>
      <div className="flex gap-x-4">
        <div className="bg-sub2 text-xs rounded-full px-4 py-3 border border-main-yellow w-fit">
          <span className="text-main-yellow">
            Network <span className="text-white">{findChain?.numChainId}</span>
          </span>
        </div>
      </div>
      {address ? (
        <div className="bg-sub2 text-xs rounded-full px-4 py-3 border border-main-yellow w-fit">
          <span className="text-main-yellow">
            Account <span className="text-white">{address.slice(0, 5)}...{address.slice(-5)}</span>
          </span>
        </div>
      ) : null}
    </div>
  )
}