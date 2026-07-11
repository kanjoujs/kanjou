import consola from 'consola'
import fs from 'node:fs/promises'
import path from 'node:path'

const extractParamsRegex = /\{(?<key>[^}]+)\}/g
const isParameterizedRegex = /\{[^}]+\}/

export async function generateLocaleMessages(
  sourceLocalePath: string,
  locale: string,
): Promise<string | undefined> {
  try {
    const localeFilePath = path.join(path.dirname(sourceLocalePath), `${locale}.json`)
    const raw = await fs.readFile(localeFilePath, 'utf-8')
    const messages: Record<string, string | Record<Intl.LDMLPluralRule, string>> = JSON.parse(raw)

    let hasPlural = false

    const entries = Object.entries(messages).map(([rawKey, value]) => {
      const key = JSON.stringify(rawKey)

      if (typeof value === 'object') {
        hasPlural = true

        const cases = Object.entries(value)
          .map(([pluralCase, text]) => {
            const body = text.replace(extractParamsRegex, (_, param) => `\${p.${param}}`)
            return `      case ${JSON.stringify(pluralCase)}: return \`${body}\``
          })
          .join('\n')

        return `  ${key}: (p) => {\n    switch (${locale}Plural.select(p.count ?? 0)) {\n${cases}\n      default: return ''\n    }\n  }`
      }

      if (!isParameterizedRegex.test(value)) return `  ${key}: ${JSON.stringify(value)}`

      const template = value.replace(extractParamsRegex, (_, param) => `\${p.${param}}`)
      return `  ${key}: (p) => \`${template}\``
    })

    const header = hasPlural ? `const ${locale}Plural = new Intl.PluralRules('${locale}')\n\n` : ''

    return `${header}export default {\n${entries.join(',\n')}\n}\n`
  } catch (error) {
    consola.error('[@kanjou/vite] Failed to load locale', error)
  }
}

export async function generateLocaleModules(sourceLocalePath: string): Promise<string | undefined> {
  try {
    const localeFilesDir = path.dirname(sourceLocalePath)
    const localeFiles = await fs.readdir(localeFilesDir)
    const locales = localeFiles.map((file) => path.basename(file, '.json'))

    const modules = locales.map((locale) => `  ${locale}: () => import('virtual:kanjou/${locale}')`)

    return `export default {\n${modules.join(',\n')}\n}`
  } catch (error) {
    consola.error('[@kanjou/vite] Failed to generate locale modules', error)
  }
}
