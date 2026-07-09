'use client'

import type { Locale } from './intl-context'
import type { ReactNode } from 'react'

import { I18nProvider } from '@kanjou/react'
import { useState } from 'react'

import { IntlContext } from './intl-context'

export function IntlProvider({
  children,
  initialLocale,
  initialMessages,
}: {
  children: ReactNode
  initialLocale: Locale
  initialMessages: Record<string, any>
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [messages, setMessages] = useState<Record<string, any>>(initialMessages)

  return (
    <IntlContext value={{ locale, setLocale, messages, setMessages }}>
      {/* kanjou provider only needs the current locale and raw messages object */}
      <I18nProvider locale={locale} messages={messages as any}>
        {children}
      </I18nProvider>
    </IntlContext>
  )
}

// im gonna create cli tool soon for those who cant use vite plugin
declare module '@kanjou/react' {
  export interface Register {
    messages: {
      greet: 'name'
      apples: 'count'
    }
  }
}
