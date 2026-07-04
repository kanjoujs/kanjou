import consola from 'consola'
import fs from 'node:fs/promises'
import path from 'node:path'

export interface DtsOptions {
  sourceLocalePath: string
  outputDirectory: string
}

export async function generateVirtualModulesDts({ outputDirectory, sourceLocalePath }: DtsOptions) {
  try {
    const localeFilesDir = path.dirname(sourceLocalePath)
    const localeFiles = await fs.readdir(localeFilesDir)
    const locales = localeFiles.map((file) => path.basename(file, '.json'))
    const localeType = locales.map((locale) => `'${locale}'`).join(' | ')

    const content = `/* eslint-disable */
declare module 'virtual:kanjou/*' {
  const messages: Partial<import('@kanjou/react').Messages>
  export default messages
}

declare module 'virtual:kanjou/modules' {
  export type Locale = ${localeType}

  const localeModules: Record<Locale, () => Promise<{ default: Record<string, any> }>>
  export default localeModules
}`

    await fs.writeFile(path.resolve(outputDirectory, 'virtual-messages.d.ts'), content)
  } catch (error) {
    consola.error('[@kanjou/vite] Failed to generate virtual-messages.d.ts', error)
  }
}

export async function generateLocaleDts({ outputDirectory, sourceLocalePath }: DtsOptions) {
  try {
    const jsonRaw = await fs.readFile(sourceLocalePath)!
    const messagesRaw = jsonRaw.toString()

    await fs.writeFile(
      path.resolve(outputDirectory, 'messages.d.ts'),
      `/* eslint-disable */\nexport {}\ndeclare module '@kanjou/react' {\n  export interface Messages  ${messagesRaw}}`,
    )
  } catch (error) {
    consola.error('[@kanjou/vite] Failed to generate messages.d.ts', error)
  }
}
