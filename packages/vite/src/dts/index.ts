import type { UserConfig } from '@kanjou/config'

import consola from 'consola'
import path from 'node:path'
import { Project, StructureKind, Writers } from 'ts-morph'

import { writeFile } from '#/shared/fs'

import { getLocaleUnion, readMessageProperties } from './utils'

export async function generateLocalesDts(config: UserConfig) {
  const localesPath = config.dts!.localesPath ?? path.join(config.dts!.outDir!, 'locales.d.ts')
  try {
    const [localeType, messageProperties] = await Promise.all([
      getLocaleUnion(config.sourceLocale),
      readMessageProperties(config.sourceLocale),
    ])

    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile('locales.d.ts', {
      statements: [
        { kind: StructureKind.ExportDeclaration },
        {
          kind: StructureKind.Module,
          name: `'@kanjou/react'`,
          hasDeclareKeyword: true,
          statements: [
            {
              kind: StructureKind.Interface,
              name: 'Register',
              isExported: true,
              properties: [
                { name: 'locale', type: localeType },
                { name: 'messages', type: Writers.objectType({ properties: messageProperties }) },
              ],
            },
          ],
        },
      ],
    })
    const content = sourceFile.getFullText()

    await writeFile(localesPath, content, { mkdir: { recursive: true } })
  } catch (error) {
    consola.error(`[@kanjou/vite] Failed to generate "${localesPath}"`, error)
  }
}

const VIRTUAL_DTS_CONTENT = `declare module 'virtual:kanjou/*' {
  const messages: Partial<import('@kanjou/react').Messages>
  export default messages
}
declare module 'virtual:kanjou/locales' {
  const modules: Record<import('@kanjou/react').Locale, () => Promise<{ default: import('@kanjou/react').Messages }>>
  export default modules
}`

export async function generateVirtualDts(config: UserConfig) {
  const virtualPath = config.dts!.virtualPath ?? path.resolve(config.dts!.outDir!, 'virtual.d.ts')

  await writeFile(virtualPath, VIRTUAL_DTS_CONTENT, { mkdir: { recursive: true } })
}
