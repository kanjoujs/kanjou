'use server'

import type { MessageKey, MessageValues } from './types'

import { translate } from './translate'

export interface CreateI18nReturn {
  t: <Key extends MessageKey>(key: Key, values?: MessageValues<Key>) => string
}

export async function createI18n({
  messages,
}: {
  messages: Record<string, any>
}): Promise<CreateI18nReturn> {
  const t = <Key extends MessageKey>(key: Key, values?: MessageValues<Key>) =>
    translate(messages, key, values)

  return { t }
}
