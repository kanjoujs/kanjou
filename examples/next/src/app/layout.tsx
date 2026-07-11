import type { InferMessages, Locale } from '@kanjou/react'
import type { Metadata } from 'next'

import { I18nProvider } from '@kanjou/react'
import { cookies } from 'next/headers'
import { ReactNode } from 'react'

import en from '@/src/assets/locales/en'
import { loadLocale } from '@/src/utils'

declare module '@kanjou/react' {
  export interface Register {
    locale: 'en' | 'es' | 'fr'
    messages: InferMessages<typeof en>
  }
}

export const metadata: Metadata = {
  title: 'Kanjou Next Example',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const initialLocale = (cookieStore.get('kanjou_locale')?.value ?? 'en') as Locale
  const initialMessages = await loadLocale(initialLocale)

  return (
    <html lang={initialLocale}>
      <body>
        <I18nProvider locale={initialLocale} messages={initialMessages}>
          {children}
        </I18nProvider>
      </body>
    </html>
  )
}
