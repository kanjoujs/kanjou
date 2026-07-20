import type { WriterFunction } from 'ts-morph'

import fs from 'node:fs/promises'
import path from 'node:path'
import { Writers } from 'ts-morph'

import type { Message } from '#/shared/types'

import { PARAM_REGEX } from '#/shared/constants'

export function unionOf(keys: string[]): string | WriterFunction {
  if (!keys.length) return 'undefined'
  if (keys.length === 1) return keys[0]
  return Writers.unionType(keys[0], keys[1], ...keys.slice(2))
}

export async function getLocaleUnion(sourceLocale: string): Promise<string | WriterFunction> {
  const dir = path.dirname(sourceLocale)
  const localeFiles = await fs.readdir(dir)
  const locales = localeFiles.map((file) => `"${path.basename(file, '.json')}"`)
  return unionOf(locales)
}

function getMessageParamsUnion(value: Message): string | WriterFunction {
  const template = typeof value === 'object' ? Object.values(value)[0] : value
  if (typeof template !== 'string') return 'undefined'
  return unionOf(
    template
      .matchAll(PARAM_REGEX)
      .map((m) => `"${m.groups!.key}"`)
      .toArray(),
  )
}

export async function readMessageProperties(sourceLocale: string) {
  const messagesRaw = await fs.readFile(sourceLocale, 'utf-8')
  const messages: Record<string, Message> = JSON.parse(messagesRaw)
  return Object.entries(messages).map(([key, message]) => ({
    name: key,
    type: getMessageParamsUnion(message),
  }))
}
