import { Locale } from '@kanjou/react'
import { createI18n } from '@kanjou/react/server'
import { cookies } from 'next/headers'

import { loadLocale } from '@/src/utils'

import { ClientComponent } from './client-component'

export default async function Home() {
  const cookieStore = await cookies()
  const locale = (cookieStore.get('kanjou_locale')?.value ?? 'en') as Locale
  const messages = await loadLocale(locale)

  const { t } = createI18n({ messages, locale })

  return (
    <main>
      <h1>{t('greet', { name: 'Server' })}</h1>
      <p>{t('apples', { count: 10 })}</p>

      <ClientComponent />
    </main>
  )
}
