import { use } from 'react'

import type { Translate } from './translate'
import type { Locale } from './types'

import { I18nContext } from './context'
import { translate } from './translate'

export interface UseI18nReturn {
  locale: Locale
  t: Translate
}

export function useI18n(): UseI18nReturn {
  const { locale, messages } = use(I18nContext)

  const t: Translate = (key, values) => translate(messages, locale, key, values)

  return { locale, t }
}
