import type { UserConfig } from '@kanjou/config'

import consola from 'consola'
import fs from 'node:fs/promises'
import path from 'node:path'

const extractParamsRegex = /\{(?<key>[^}]+)\}/g
const isParameterizedRegex = /\{[^}]+\}/

export async function generateLocalesDts(config: UserConfig) {
  if (!config.dts?.outputDirectory && !config.dts?.localesDtsOutputPath) return

  const localesDtsOutputPath = config.dts.outputDirectory
    ? path.resolve(config.dts.outputDirectory, 'locales.d.ts')
    : path.resolve(config.dts.localesDtsOutputPath!) // we must have it here

  try {
    const localeFilesDir = path.dirname(config.sourceLocalePath)
    const localeFiles = await fs.readdir(localeFilesDir)

    const localeType = localeFiles.map((file) => path.basename(file, '.json')).join(' | ')

    const raw = await fs.readFile(config.sourceLocalePath)
    const messagesRaw: Record<string, string | Record<Intl.LDMLPluralRule, string>> = JSON.parse(
      raw.toString(),
    )

    const messagesType = Object.entries(messagesRaw)
      .map(([key, value]) => {
        key = JSON.stringify(key)

        if (typeof value === 'string' && isParameterizedRegex.test(value)) {
          const matches = Array.from(value.matchAll(extractParamsRegex))
          return `      ${key}: ${matches.map((match) => `"${match.groups?.key}"`).join(' | ')}`
        }

        if (typeof value === 'object') {
          const matches = Array.from(Object.values(value)[0].matchAll(extractParamsRegex))
          return `      ${key}: ${matches.map((match) => `"${match.groups?.key}"`).join(' | ')}`
        }

        if (typeof value === 'string') return `      ${key}: undefined`

        return ''
      })
      .join('\n')

    const content = `export {}

declare module '@kanjou/react' {
  export interface Register {
    locale: ${localeType}
    messages: {
${messagesType}
    }
  }
}`

    await fs.mkdir(path.dirname(localesDtsOutputPath), { recursive: true })
    await fs.writeFile(localesDtsOutputPath, content)
  } catch (error) {
    consola.error('[@kanjou/vite] Failed to generate locales.d.ts', error)
  }
}

const virtualDtsContent = `declare module 'virtual:kanjou/*' {
  const messages: Partial<import('@kanjou/react').Messages>
  export default messages
}

declare module 'virtual:kanjou/modules' {
  const modules: Record<import('@kanjou/react').Locale, () => Promise<{ default: import('@kanjou/react').Messages }>>
  export default modules
}`

export async function generateVirtualDts(config: UserConfig) {
  if (!config.dts?.outputDirectory && !config.dts?.virtualDtsOutputPath) return

  const virtualDtsOutputPath = config.dts.outputDirectory
    ? path.resolve(config.dts.outputDirectory, 'virtual.d.ts')
    : path.resolve(config.dts.virtualDtsOutputPath!) // we must have it here

  try {
    await fs.mkdir(path.dirname(virtualDtsOutputPath), { recursive: true })
    await fs.writeFile(virtualDtsOutputPath, virtualDtsContent)
  } catch (error) {
    consola.error('[@kanjou/vite] Failed to generate virtual.d.ts', error)
  }
}
