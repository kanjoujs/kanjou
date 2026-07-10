import type { Locale, Messages } from '@kanjou/react'

import { createContext } from 'react'

export interface IntlContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  messages: Messages
  setMessages: (messages: Messages) => void
}

export const IntlContext = createContext<IntlContextValue>(null!)
