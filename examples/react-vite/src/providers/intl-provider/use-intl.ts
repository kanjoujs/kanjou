import { useI18n } from '@kanjou/react'
import { use } from 'react'

import { loadLocale } from '#/utils'

import type { Locale } from './intl-context'

import { IntlContext } from './intl-context'

export function useIntl() {
  const context = use(IntlContext)
  const { t } = useI18n()

  const setLocale = async (newLocale: Locale) => {
    const newMessages = await loadLocale(newLocale)
    context.setMessages(newMessages)
    context.setLocale(newLocale)
  }

  return {
    t,
    locale: context.locale,
    setLocale,
  }
}
