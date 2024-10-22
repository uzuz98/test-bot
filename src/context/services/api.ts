import axios from "axios";
import adapter from '@vespaiach/axios-fetch-adapter'
import crypto from 'crypto-js'
import { getTelegramUser } from ".";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_ADAPTER,
  adapter: adapter,
  headers: {
    chromeId: '',
    Version: '14.6.3',
    os: 'extension',
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: 'Bearer ',
    Source: process.env.NEXT_PUBLIC_SOURCE!
  }
})

export const postApiGetToken = () => {
  const user = getTelegramUser()
  const spamToken = process.env.NEXT_PUBLIC_SPAM_TOKEN!

  const data = {
    device: `${user.id}`
  }
  const signature = crypto.HmacSHA256(JSON.stringify(data), spamToken) as unknown as string

  return api.post<{
    device: string
  }, {
    status: boolean
    data: {
      data: {
        code: string
      }
    }
  }>(
    '/user/device',
    data,
    {
      headers: {
        signature 
      }
    }
  )
}
