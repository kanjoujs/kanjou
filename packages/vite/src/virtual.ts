import consola from 'consola'
import fs from 'node:fs/promises'
import path from 'node:path'

const extractParamsRegex = /\{(?<key>[^}]+)\}/g
const isParameterizedRegex = /\{[^}]+\}/

export async function generateLocaleMessages(
  sourceLocalePath: string,
  locale: string,
): Promise<string | undefined> {
  const localeFilesDir = path.dirname(sourceLocalePath)
  const localeFilePath = path.join(localeFilesDir, locale + '.json')

  try {
    const jsonRaw = await fs.readFile(localeFilePath)
    const messages: Record<string, string> = JSON.parse(jsonRaw.toString())

    const messagesDeclaration = Object.entries(messages).map(([key, value]) => {
      key = JSON.stringify(key)

      if (!isParameterizedRegex.test(value)) return `  ${key}: ${JSON.stringify(value)}`

      const template = value.replace(extractParamsRegex, (_, key) => `\${p.${key}}`)

      return `  ${key}: (p = {}) => \`${template}\``
    })

    return `export default {\n${messagesDeclaration.join(',\n')}\n}\n`
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

    return `const localeModules = {\n${modules.join(',\n')}\n}\nexport default localeModules`
  } catch (error) {
    consola.error('[@kanjou/vite] Failed to generate locale modules', error)
  }
}
