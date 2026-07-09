import type { Messages, Locale } from './types'
import type { Context } from 'react'

import { createContext } from 'react'

export interface I18nContextValue {
  locale: Locale
  messages: Messages
}

export const I18nContext: Context<I18nContextValue> = createContext({
  locale: '',
  messages: {},
})
