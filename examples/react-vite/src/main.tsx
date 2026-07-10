import type { InferMessages } from '@kanjou/react'

import { createRoot } from 'react-dom/client'

import { App } from '#/app'
import en from '#/assets/locales/en'
import { IntlProvider } from '#/providers/intl-provider'
import { loadLocale } from '#/utils'

declare module '@kanjou/react' {
  export interface Register {
    locale: 'en' | 'es' | 'fr'
    messages: InferMessages<typeof en>
  }
}

const initialLocale = 'en' // load from localStorage or whatever you want
const initialMessages = await loadLocale(initialLocale)

createRoot(document.getElementById('root')!).render(
  <IntlProvider initialLocale={initialLocale} initialMessages={initialMessages}>
    <App />
  </IntlProvider>,
)
