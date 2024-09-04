import localforage from 'localforage'

export class RamperLocalForage {
  instance: any
  store = {}
  ramperforage: LocalForage

  constructor() {
    if (this.instance) return this.instance
    this.init()
    this.instance = this
  }

  init() {
    this.ramperforage = localforage.createInstance({
      description: process.env.PLASMO_PUBLIC_INDEX_DB_DESCRIPTION,
      name: 'ramper_v2',
      storeName: 'ramper_v2'
    })
  }

  async initStore() {
    this.store = {}
  }

  setValue(key: string, value: any) {
    this.ramperforage.setItem(key, value)
  }

  async getValue<T = any>(key: string, defaultValue?: any): Promise<T> {
    return await new Promise(async (resolve) => {
      setTimeout(() => {
        resolve(null)
      }, 2500)

      const value = await this.ramperforage.getItem(key).catch(() => null)
      let parseValue
      try {
        parseValue = JSON.parse(value as string) || defaultValue
      } catch (error) {
        parseValue = (value || defaultValue) as T
      }
      resolve(parseValue)
    })
  }

  getStore() {
    return this.store
  }
}

export const AsyncStorage = new RamperLocalForage()
