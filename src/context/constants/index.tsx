import { ICoin98Context } from "../types";

export const defaultValues: ICoin98Context = {
  address: '',
  encryptionKey: ''
} as ICoin98Context

export const ERROR_MESSAGE: Record<string, string> = {
  weba: 'Please switch to K version or use another platform to use this feature',
  version: 'Please update to latest version of Telegram to use this feature'
}
