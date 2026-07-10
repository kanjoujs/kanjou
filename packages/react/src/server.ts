'use server'

import type { Translate } from './translate'
import type { Locale } from './types'

import { createTranslate } from './translate'

class LRUCache<Key, Value> extends Map<Key, Value> {
  get(key: Key): Value | undefined {
    if (!this.has(key)) return undefined
    const value = super.get(key)!
    this.delete(key)
    super.set(key, value)
    return value
  }

  set(key: Key, value: Value): this {
    super.set(key, value)
    if (this.size > 500) {
      const firstKey = this.keys().next().value
      if (firstKey !== undefined) this.delete(firstKey)
    }
    return this
  }
}

const intlCache = new Map<string, Intl.PluralRules>()
const translateFnCache = new LRUCache<string, (p: Record<string, any>) => string>()

const translate = createTranslate(intlCache, translateFnCache)

export type CreateI18n = (options: {
  locale: Locale
  messages: Record<string, any>
}) => Promise<{ t: Translate }>

export const createI18n: CreateI18n = async ({ messages, locale }) => {
  const t: Translate = (key, values) => translate(messages, locale, key, values)

  return { t }
}
