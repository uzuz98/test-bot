export { }

declare global {
  interface Window {
    Telegram: {
      WebApp: {
        showAlert(arg0: string): unknown
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