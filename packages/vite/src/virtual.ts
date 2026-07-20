import consola from 'consola'
import fs from 'node:fs/promises'
import path from 'node:path'

import type { Message } from '#/shared/types'

import { HAS_PARAM_REGEX, PARAM_REGEX } from '#/shared/constants'

export async function generateLocaleMessages(
  sourceLocale: string,
  locale: string,
): Promise<string | undefined> {
  try {
    const dir = path.dirname(sourceLocale)
    const localeFilePath = path.join(dir, `${locale}.json`)
    const messagesRaw = await fs.readFile(localeFilePath, 'utf-8')
    const messages: Record<string, Message> = JSON.parse(messagesRaw)

    const hasPlural = Object.values(messages).some((value) => typeof value === 'object')

    const lines: string[] = []

    if (hasPlural) lines.push(`const ${locale}p = new Intl.PluralRules("${locale}")`)

    const entries = Object.entries(messages).map(([key, value]) => {
      if (typeof value === 'object') {
        const cases = Object.entries(value)
          .map(([pluralCase, text]) => {
            const body = text.replace(PARAM_REGEX, (_, param) => `\${p[${JSON.stringify(param)}]}`)
            return `    case "${pluralCase}": return \`${body}\``
          })
          .join('\n')
        return `  ${JSON.stringify(key)}(p) {\n    switch (${locale}p.select(p.count)) {\n${cases}\n    }\n  }`
      }

      if (!HAS_PARAM_REGEX.test(value)) return `  ${JSON.stringify(key)}: ${JSON.stringify(value)}`

      const template = value.replace(PARAM_REGEX, (_, param) => `\${p[${JSON.stringify(param)}]}`)
      return `  ${JSON.stringify(key)}: (p) => \`${template}\``
    })

    lines.push(`export default {\n${entries.join(',\n')}\n}`)

    return lines.join('\n')
  } catch (error) {
    consola.error('[@kanjou/vite] Failed to load locale', error)
  }
}

export async function generateLocaleModules(sourceLocale: string): Promise<string | undefined> {
  try {
    const dir = path.dirname(sourceLocale)
    const localeFiles = await fs.readdir(dir)
    const locales = localeFiles.map((file) => path.basename(file, '.json'))

    const entries = locales.map(
      (locale) => `  "${locale}": () => import('virtual:kanjou/${locale}')`,
    )

    return `export default {\n${entries.join(',\n')}\n}`
  } catch (error) {
    consola.error('[@kanjou/vite] Failed to generate locale modules', error)
  }
}
