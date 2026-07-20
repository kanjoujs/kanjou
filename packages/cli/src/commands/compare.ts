import consola from 'consola'
import fs from 'node:fs'
import path from 'node:path'

import type { KanjouPluginContext } from '#/shared/context'

function readLocaleKeys(dir: string, locale: string) {
  const filePath = path.join(dir, `${locale}.json`)
  const content = fs.readFileSync(filePath, 'utf-8')
  const json = JSON.parse(content) as Record<string, unknown>
  return new Set(Object.keys(json))
}

export function compare(ctx: KanjouPluginContext) {
  return async () => {
    const config = await ctx.getConfig()
    const dir = path.dirname(config.sourceLocale)

    const locales = fs.readdirSync(dir).map((file) => path.basename(file, path.extname(file)))

    const keysByLocale = new Map(locales.map((locale) => [locale, readLocaleKeys(dir, locale)]))

    for (const locale of locales) {
      const ownKeys = keysByLocale.get(locale)!

      const missingKeyOrigins = new Map<string, Set<string>>()

      for (const other of locales) {
        if (other === locale) continue

        const missingKeys = keysByLocale.get(other)!.difference(ownKeys)

        for (const key of missingKeys) missingKeyOrigins.getOrInsert(key, new Set()).add(other)
      }

      if (!missingKeyOrigins.size) continue

      const lines = missingKeyOrigins
        .entries()
        .map(([key, origins]) => `  missing "${key}" from ${[...origins].join(', ')}`)
        .toArray()

      consola.log(`${locale}\n${lines.join('\n')}`)
    }
  }
}
