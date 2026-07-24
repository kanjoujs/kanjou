import type { Translate } from './translate'
import type { Functions, Locale, Message, MessageFormatOptions } from './types'

import { createTranslate } from './translate'

export interface CreateI18nOptions {
  locale: Locale
  messages: Record<string, Message>
  functions?: Functions
  options?: MessageFormatOptions
}

export interface CreateI18nReturn {
  t: Translate
}

export function createI18n({
  messages,
  locale,
  functions,
  options,
}: CreateI18nOptions): CreateI18nReturn {
  const opts = Object.assign({}, options, { functions })
  const t = createTranslate(messages, locale, opts)

  return { t }
}
