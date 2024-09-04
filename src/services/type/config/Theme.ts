export type Theme = (typeof THEME)[keyof typeof THEME]

export const THEME = {
  DARK: 'dark',
  LIGHT: 'light'
} as const
