import axios from 'axios'

import { isLive } from '../constants'

const DEFAULT_TIMEOUT = 120000
const SOURCE = 'C98WLFININS'
const VERSION = '14.6.3'

const sampleConfig = {
  Accept: 'application/json',
  'content-type': 'application/json',
  Source: SOURCE,
  VERSION
}

export const BaseAdapterRamper = axios.create({
  baseURL: isLive() ? 'https://fragment-api.coin98.com' : 'https://ramper-v2-fragment-stg.coin98.dev/',
  // baseURL: 'https://ramper-v2-fragment-stg.coin98.dev/',
  timeout: DEFAULT_TIMEOUT,
  headers: sampleConfig
})

const RequestInterceptor = (isAdapter) => (config) => {
  // const token = window.listener.jwtToken
  // const spamToken = process.env.PLASMO_PUBLIC_SPAM_TOKEN || ''

  config.headers = {
    origin: 'coin98.com',
    Accept: 'application/json',
    'content-type': 'application/json',
    Version: VERSION,
    Authorization: `Bearer ${'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IndPcTdpNHNFakdwUWtWcVhKUUU5TCIsInRva2VuIjoiIiwiaWF0IjoxNzI0MjM4MTEzLCJleHAiOjIwMzk1OTgxMTN9.zat7dvbv_ofplIG_yo1xMLi8jAhcEMGBMY5DPBRpk1I'}`,
    Source: SOURCE,
    ...config.headers
  }

  return config
}

const ResponseInterceptor = (response) => {
  if (!response || !response.data) {
    return Promise.reject(new Error())
  }

  if (response.data?.data) {
    return response.data?.data
  }

  return response.data
}

const ErrorHandler = async (error) => {
  if (!error) {
    return Promise.reject(error)
  }

  return Promise.reject('error')
}

BaseAdapterRamper.interceptors.request.use(RequestInterceptor(true), ErrorHandler)
BaseAdapterRamper.interceptors.response.use(ResponseInterceptor, ErrorHandler)
