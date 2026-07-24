import type { Context, ReactNode } from 'react'

import { createContext, use } from 'react'

import type { Translate } from './translate'
import type { Functions, Locale, Message, MessageFormatOptions } from './types'

import { createTranslate } from './translate'

export interface KanjouContextValue {
  locale: Locale
  functions?: Functions
  options?: Omit<MessageFormatOptions, 'functions'>
  messages: Record<string, Message>
}

export const KanjouContext: Context<KanjouContextValue> = createContext({
  locale: '',
  messages: {},
})

export interface KanjouProviderProps {
  children: ReactNode
  locale: string
  messages: Record<string, Message>
  functions?: Functions
  options?: Omit<MessageFormatOptions, 'functions'>
}

export function KanjouProvider({
  children,
  messages,
  locale,
  functions,
  options,
}: KanjouProviderProps): ReactNode {
  return <KanjouContext value={{ locale, messages, functions, options }}>{children}</KanjouContext>
}

export interface UseI18nReturn {
  locale: Locale
  t: Translate
}

export function useI18n(): UseI18nReturn {
  const { locale, messages, functions, options } = use(KanjouContext)

  const opts = Object.assign({}, options, { functions })
  const t = createTranslate(messages, locale, opts)

  return { locale, t }
}
