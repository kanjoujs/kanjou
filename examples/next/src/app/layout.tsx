import type { Metadata } from 'next'

import { cookies } from 'next/headers'
import { ReactNode } from 'react'

import { IntlProvider } from '@/src/providers/intl-provider'
import { Locale } from '@/src/providers/intl-provider'
import { loadLocale } from '@/src/utils'

export const metadata: Metadata = {
  title: 'Kanjou Example',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const initialLocale = (cookieStore.get('kanjou_locale')?.value || 'en') as Locale
  const initialMessages = await loadLocale(initialLocale)

  return (
    <html lang={initialLocale}>
      <body>
        <IntlProvider initialLocale={initialLocale} initialMessages={initialMessages}>
          {children}
        </IntlProvider>
      </body>
    </html>
  )
}
