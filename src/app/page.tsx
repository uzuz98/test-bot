'use client'
import Image from "next/image";
import { useEffect, useState } from "react";
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { ramperSignIn } from "@/services/lib";
import axios from "axios";

const REPLACE_RULES = [
  ['.', '%2E'],
  ['-', '%2D'],
  ['_', '%5F'],
  ['/', '%2F'],
  ['&', '-'],
  ['=', '__'],
  ['%', '--']
]

export const decodeTelegramUrlParameters = (parameters: string): string => {
  return REPLACE_RULES
    .reverse()
    .reduce((prev, replaceRule) => {
      return prev.replaceAll(replaceRule[1], replaceRule[0])
    }, parameters)
}

export default function Home() {
  const testTelegram = () => {

    // axios.post(`${process.env.NEXT_PUBLIC_BASE_API}/api/sse/send`, {
    //   mnemonic: '5 testset'
    // })
    // return
    if (typeof window !== 'undefined') {
      // window.Telegram.WebApp.openInvoice('https://walletbot.me/scw/tc/connect')

      if (!window.Telegram || !window.Telegram.WebApp) {
        return
      }

      const url = window.Telegram.WebApp.initData
      let uri = decodeURIComponent(url)
      uri = decodeURIComponent(uri)
      const params = new URLSearchParams(uri)
      const data = Object.fromEntries(params.entries())
      console.log("🩲 🩲 => testTelegram => data:", data)
      const user = data.user
      const startParams = data.start_param
      console.log("🩲 🩲 => testTelegram => startParams:", startParams)
      if(startParams) {
        console.log("🩲 🩲 => testTelegram => startParams:", startParams)
        console.log('url', decodeTelegramUrlParameters(startParams))
      }
      if (data) {
        ;(async () => {
          try {
            const result = await fetch('/api/token', {
              body: JSON.stringify(data),
              method: 'POST'
            })

            const response = await result.json()
            console.log("🩲 🩲 => ; => response:", response)
            
            if (response.result) {
              const data = response.result
              console.log("🩲 🩲 => ; => data:", data)
              // const auth = getAuth()
              // await signInWithCustomToken(auth, data.customToken)
              axios.post(`${process.env.NEXT_PUBLIC_BASE_API}/api/sse/send`, {
                mnemonic: data.customToken
              })
              // const user = await ramperSignIn();
              // console.log("🩲 🩲 => ; => user:", user)
              // const mnemonic = user?.mnemonic

            }
          } catch (error) {
            console.debug('🚀 ~ useEffectOnce ~ error:', error)
          }
        })()
      }
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
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
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className="mb-3 text-2xl font-semibold">
            Get Wallet{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </button>

      </div>
    </main>
  );
}
