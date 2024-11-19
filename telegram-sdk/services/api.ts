import axios from "axios";
import adapter from '@vespaiach/axios-fetch-adapter'
import crypto from 'crypto-js'
import { getTelegramUser } from ".";
import { API_URL, SOURCE, SPAM_TOKEN } from "../constants";

const api = axios.create({
  baseURL: API_URL,
  adapter: adapter,
  headers: {
    chromeId: '',
    Version: '14.6.3',
    os: 'extension',
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: 'Bearer ',
    Source: SOURCE
  }
})

export const postApiGetToken = () => {
  const user = getTelegramUser()
  const spamToken = SPAM_TOKEN

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
