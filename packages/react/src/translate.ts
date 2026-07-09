import type { Messages, Locale, MessageValues } from './types'

export type Translate = <Key extends keyof Messages>(
  key: Key,
  values?: MessageValues<Key>,
) => string

export function createTranslate(
  intlCache: Map<string, Intl.PluralRules>,
  translateFnCache: Map<string, (p: Record<string, any>) => string>,
) {
  return <Key extends keyof Messages>(
    messages: Record<string, any>,
    locale: Locale,
    key: Key,
    values?: MessageValues<Key>,
  ): string => {
    const message = messages[key]

    if (message === undefined) return key

    if (typeof message === 'function') return message(values)

    if (typeof message === 'string' && values && !!Object.values(values).length) {
      const translateFnCacheKey = `${key}\0${message}`

      let translateFn = translateFnCache.get(translateFnCacheKey)
      if (translateFn) return translateFn(values)

      translateFn = (params) => {
        return message.replace(/{(\w+)}/g, (_, key) => {
          return params[key] !== undefined ? params[key] : `{${key}}`
        })
      }

      translateFnCache.set(translateFnCacheKey, translateFn)

      return translateFn(values)
    }

    if (
      typeof message === 'object' &&
      !!Object.values(message).length &&
      values &&
      !!Object.values(values).length
    ) {
      const translateFnCacheKey = `${key}\0${JSON.stringify(message)}`

      let translateFn = translateFnCache.get(translateFnCacheKey)
      if (translateFn) return translateFn(values)

      let pluralRules = intlCache.get(locale) ?? new Intl.PluralRules(locale)
      intlCache.set(locale, pluralRules)

      translateFn = (params) => {
        const plural = pluralRules.select(params.count)
        return message[plural].replace(/{(\w+)}/g, (_: any, key: any) => {
          return params[key] !== undefined ? params[key] : `{${key}}`
        })
      }

      translateFnCache.set(translateFnCacheKey, translateFn)

      return translateFn(values)
    }

    return message
  }
}
