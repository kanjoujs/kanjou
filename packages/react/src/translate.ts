import type { MessagePart } from 'messageformat'

import { MessageFormat } from 'messageformat'

import type {
  Locale,
  Message,
  MessageKey,
  MessageValues,
  MessageFormatOptions,
  InferPartsType,
} from './types'

export interface TranslateParts {
  <Key extends MessageKey>(
    key: Key,
    values?: MessageValues<Key>,
  ): MessagePart<InferPartsType<Key>>[]
  unsafe: (key: any, values?: Record<string, any>) => MessagePart<string>[]
}

export interface Translate {
  <Key extends MessageKey>(key: Key, values?: MessageValues<Key>): string
  unsafe: (key: any, values?: Record<string, any>) => string

  parts: TranslateParts
}

const cache: Map<string, MessageFormat<string, string>> = new Map()

function translate<Key extends MessageKey>(
  messages: Record<string, Message>,
  locale: Locale,
  key: Key,
  values?: MessageValues<Key>,
  options?: MessageFormatOptions,
): string {
  const message = messages[key]
  if (!message) return key

  const formatter = cache.getOrInsert(
    `${locale}:${key}`,
    new MessageFormat(locale, message, options as any),
  )

  return formatter.format(values)
}

function translateToParts<Key extends MessageKey>(
  messages: Record<string, Message>,
  locale: Locale,
  key: Key,
  values?: MessageValues<Key>,
  options?: MessageFormatOptions,
): MessagePart<InferPartsType<Key>>[] {
  const message = messages[key]
  if (!message) return [{ type: 'text', value: key }]

  const formatter = cache.getOrInsert(
    `${locale}:${key}`,
    new MessageFormat(locale, message, options as any),
  )

  return formatter.formatToParts(values) as MessagePart<InferPartsType<Key>>[]
}

export function createTranslate(
  messages: Record<string, Message>,
  locale: Locale,
  options?: MessageFormatOptions,
): Translate {
  const t: Translate = (key, values) => translate(messages, locale, key, values, options)
  t.unsafe = (key, values) => translate(messages, locale, key, values, options)

  const parts: TranslateParts = (key, values) =>
    translateToParts(messages, locale, key, values, options)
  parts.unsafe = (key, values) => translateToParts(messages, locale, key, values, options)

  t.parts = parts

  return t
}
