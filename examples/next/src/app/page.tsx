import { createI18n } from '@kanjou/react/server'
import { cookies } from 'next/headers'

import { Locale } from '@/src/providers/intl-provider'
import { loadLocale } from '@/src/utils'

import { ClientComponent } from './client-component'

export default async function Home() {
  const cookieStore = await cookies()
  const locale = (cookieStore.get('kanjou_locale')?.value || 'en') as Locale
  const messages = await loadLocale(locale)
  const { t } = await createI18n({ messages })

  return (
    <main>
      <h1>{t('greet', { name: 'Server' })}</h1>

      <ClientComponent />
    </main>
  )
}
