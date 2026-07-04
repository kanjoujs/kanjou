'use client'

import { useI18n } from '@kanjou/react'
import { useRouter } from 'next/navigation'
import { use } from 'react'

import { loadLocale } from '@/src/utils'

import type { Locale } from './intl-context'

import { IntlContext } from './intl-context'

export function useIntl() {
  const context = use(IntlContext)
  const { t } = useI18n()
  const router = useRouter()

  const setLocale = async (newLocale: Locale) => {
    const newMessages = await loadLocale(newLocale)
    context.setMessages(newMessages)
    context.setLocale(newLocale)

    document.cookie = `kanjou_locale=${newLocale}; path=/; max-age=31536000`
    router.refresh()
  }

  return {
    t,
    locale: context.locale,
    setLocale,
  }
}
