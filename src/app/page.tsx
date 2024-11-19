'use client'
import Image from "next/image";
import { useState } from "react";

const REPLACE_RULES = [
  ['.', '%2E'],
  ['-', '%2D'],
  ['_', '%5F'],
  ['/', '%2F'],
  ['&', '-'],
  ['=', '__'],
  ['%', '--']
]

export function encodeTelegramUrlParameters (parameters: string): string {
  if (!parameters) return ''
  return REPLACE_RULES
    .reduce((prev, replaceRule) => {
      return prev.replaceAll(replaceRule[0], replaceRule[1])
    }, parameters)
}

export const decodeTelegramUrlParameters = (parameters: string): string => {
  return REPLACE_RULES
    .reverse()
    .reduce((prev, replaceRule) => {
      return prev.replaceAll(replaceRule[1], replaceRule[0])
    }, parameters)
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)

  const testTelegram = () => {
        const url = new URL("https://t.me/super_wallet_pre_prd_bot/integration_production")
        const paramsURL = new URLSearchParams({
      partner: 'eternals',
    })

    const encodeUrl = encodeTelegramUrlParameters(paramsURL.toString())
    url.searchParams.append('startapp', encodeUrl)
    return url.toString()
   }

  return (
    <main className="flex bg-white min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href={testTelegram()}
            target="_blank"
            rel="noopener noreferrer"
          >
            By{" "}
            <Image
              src="/vercel.svg"
              alt="Vercel Logo"
              className="dark:invert"
              width={100}
              height={24}
              priority
            />
          </a>
        </div>
      </div>

      <div className="mb-32 grid text-center ">
        <button
          onClick={testTelegram}
          className="group rounded-lg border border-gray-300 border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
            <h2 className="mb-3 text-2xl font-semibold">
              {isLoading ? 'Loading...': 'Get Wallet " "'}
              <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                -&gt;
              </span>
            </h2>
        </button>

      </div>
    </main>
  );
}
