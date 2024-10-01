export {}

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        platform: string
        version: any
        initData: any
        ready: () => void
        expand: () => void
        openTelegramLink: (url: string) => void
      }
    }
  }
}