export {}

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: any
        ready: () => void
        expand: () => void
      }
    }
  }
}