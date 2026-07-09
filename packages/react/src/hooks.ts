import type { Translate } from './translate'
import type { Locale } from './types'

import { use } from 'react'

import { I18nContext } from './context'
import { createTranslate } from './translate'

export interface UseI18nReturn {
  locale: Locale
  t: Translate
}

const intlCache = new Map<string, Intl.PluralRules>()
const translateFnCache = new Map<string, (p: Record<string, any>) => string>()

const translate = createTranslate(intlCache, translateFnCache)

export function useI18n(): UseI18nReturn {
  const { locale, messages } = use(I18nContext)

  const t: Translate = (key, values) => translate(messages, locale, key, values)

  return { locale, t }
}
