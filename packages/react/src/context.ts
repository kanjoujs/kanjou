import type { Context } from 'react'

import { createContext } from 'react'

import type { Messages, Locale } from './types'

export interface I18nContextValue {
  locale: Locale
  messages: Messages
}

export const I18nContext: Context<I18nContextValue> = createContext({ locale: '', messages: {} })
