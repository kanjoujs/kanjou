import type { ReactNode } from 'react'

import { I18nProvider } from '@kanjou/react'
import { useState } from 'react'

import type { Locale } from './intl-context'

import { IntlContext } from './intl-context'

export function IntlProvider({
  children,
  initialLocale,
  initialMessages,
}: {
  children: ReactNode
  initialLocale: Locale
  initialMessages: Record<string, string>
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale)
  const [messages, setMessages] = useState<Record<string, string>>(initialMessages)

  return (
    <IntlContext value={{ locale, setLocale, messages, setMessages }}>
      {/* kanjou provider only needs the current locale and raw messages object */}
      <I18nProvider locale={locale} messages={messages}>
        {children}
      </I18nProvider>
    </IntlContext>
  )
}
