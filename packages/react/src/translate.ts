import type { InternalMessages, MessageKey, MessageValues } from './types'

const translateFnCache = new Map<string, (p: Record<string, any>) => string>()

export function translate<Key extends MessageKey>(
  messages: InternalMessages,
  key: Key,
  values?: MessageValues<Key>,
): string {
  const message = messages[key]

  if (message === undefined) return key

  if (typeof message === 'function') return message(values)

  if (typeof message === 'string' && values && !!Object.keys(values).length) {
    const cacheKey = `${key}\0${message}`

    let translateFn = translateFnCache.get(cacheKey)

    if (!translateFn) {
      translateFn = (p) => {
        return message.replace(/{(\w+)}/g, (_, k) => {
          return p[k] !== undefined ? p[k] : `{${k}}`
        })
      }

      translateFnCache.set(cacheKey, translateFn)
    }

    return translateFn(values)
  }

  return message
}
