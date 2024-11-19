import { TelegramUser } from "../context/types"
// const SAMPLE_TELE_BOT = 'user=%7B%22id%22%3A9898989898%2C%22first_name%22%3A%22Coin98%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22test_c98%22%2C%22language_code%22%3A%22en%22%2C%22allows_write_to_pm%22%3Atrue%7D'

export const getTelegramUser = (): Partial<TelegramUser> => {
  try {
    const searchData = new URLSearchParams(window.Telegram?.WebApp?.initData)
    const user = searchData.get('user')

    if (!user) {
      throw Error('not found')
    }
    return JSON.parse(user)
  } catch (e) {
    // const searchData = new URLSearchParams(SAMPLE_TELE_BOT)
    // Default user for testing on browser
    return {}
  }
}

export const getReqEvent = (name: string) => {
  return `request-${name}`
}

export const getResponseEvent = (name: string) => {
  return `response-${name}`
}

const REPLACE_RULES = [
  ['.', '%2E'],
  ['-', '%2D'],
  ['_', '%5F'],
  ['/', '%2F'],
  ['&', '-'],
  ['=', '__'],
  ['%', '--']
]

export function encodeTelegramUrlParameters(parameters: string): string {
  if (!parameters) return ''
  return REPLACE_RULES
    .reduce((prev, replaceRule) => {
      return prev.replaceAll(replaceRule[0], replaceRule[1])
    }, parameters)
}

export const decodeTelegramUrlParameters = (parameters: string): string => {
  if (!parameters) return ''
  return REPLACE_RULES
    .reverse()
    .reduce((prev, replaceRule) => {
      return prev.replaceAll(replaceRule[1], replaceRule[0])
    }, parameters)
}
