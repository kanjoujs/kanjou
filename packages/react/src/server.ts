import type { Translate } from './translate'
import type { Locale } from './types'

import { translate } from './translate'

export interface CreateI18nOptions {
  locale: Locale
  messages: Record<string, any>
}

export interface CreateI18nReturn {
  t: Translate
}

export type CreateI18n = (options: CreateI18nOptions) => CreateI18nReturn

export const createI18n: CreateI18n = ({ messages, locale }) => {
  const t: Translate = (key, values) => translate(messages, locale, key, values)

  return { t }
}
