import type { UserConfig } from '@kanjou/config'
import type { CodeBlockWriter, PropertySignatureStructure } from 'ts-morph'

import { parseMessage } from 'messageformat'
import path from 'node:path'
import { ModuleDeclarationKind, Project, StructureKind, Writers } from 'ts-morph'

import { readdir, writeFile } from '#/shared/fs'

import { format } from './format'
import { filterLocaleFiles, readLocaleFile } from './utils'

export async function compileLocalesDts(sourceLocale: string) {
  const localeFiles = await readdir(path.dirname(sourceLocale))
  const localeWriters = filterLocaleFiles(localeFiles).map(
    (locale) => (writer: CodeBlockWriter) => writer.quote(locale.name),
  )

  const localeType =
    localeWriters.length >= 2
      ? Writers.unionType(localeWriters[0], localeWriters[1], ...localeWriters.slice(2))
      : (localeWriters[0] ?? 'never')

  const messages = await readLocaleFile(sourceLocale)

  const messageProperties: PropertySignatureStructure[] = Object.entries(messages ?? {}).map(
    ([key, message]) => {
      const ast = parseMessage(message)

      const values: Map<string, PropertySignatureStructure> = new Map()

      ast.declarations.forEach((declaration) => {
        const type = declaration.value.functionRef
          ? `{ __fn: '${declaration.value.functionRef.name}' }`
          : 'DefaultMessageValue'

        if (declaration.type === 'input') {
          values.set(declaration.name, {
            kind: StructureKind.PropertySignature,
            type,
            name: declaration.name,
          })
        }

        if (
          declaration.type === 'local' &&
          declaration.value.arg?.type === 'variable' &&
          !values.has(declaration.value.arg.name)
        ) {
          values.set(declaration.value.arg.name, {
            kind: StructureKind.PropertySignature,
            type,
            name: declaration.value.arg.name,
          })
        }
      })

      const patterns =
        ast.type === 'message'
          ? ast.pattern.filter((part) => typeof part === 'object')
          : ast.variants
              .flatMap((variant) => variant.value)
              .filter((part) => typeof part === 'object')

      patterns.forEach((pattern) => {
        if (
          pattern.type !== 'expression' ||
          pattern.arg?.type === 'literal' ||
          !pattern.arg?.name ||
          values.has(pattern.arg?.name)
        ) {
          return
        }

        const type = pattern.functionRef
          ? `{ __fn: '${pattern.functionRef.name}' }`
          : 'DefaultMessageValue'

        values.set(pattern.arg.name, {
          kind: StructureKind.PropertySignature,
          type,
          name: pattern.arg.name,
        })
      })

      return {
        kind: StructureKind.PropertySignature,
        name: key,
        type: Writers.objectType({ properties: values.values().toArray() }),
      }
    },
  )

  const project = new Project({ useInMemoryFileSystem: true })
  const sourceFile = project.createSourceFile('locales.kanjou.d.ts', {
    statements: [
      {
        kind: StructureKind.ImportDeclaration,
        moduleSpecifier: '@kanjou/react',
        namedImports: ['InferFunctionInput', 'DefaultMessageValue'],
        isTypeOnly: true,
      },
      {
        kind: StructureKind.Module,
        declarationKind: ModuleDeclarationKind.Module,
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

  return sourceFile.getFullText()
}

export async function writeLocalesDts(config: UserConfig) {
  const localesPath =
    config.dts?.localesPath ??
    (config.dts?.outDir && path.join(config.dts.outDir, 'locales.kanjou.d.ts'))
  if (!localesPath) return

  const localesDts = await compileLocalesDts(config.sourceLocale)
  const formattedDts = await format(localesDts, config.format)
  await writeFile(localesPath, formattedDts, { mkdir: { recursive: true } })
}

export const VIRTUAL_DTS = `
declare module 'virtual:kanjou/*' {
  const messages: Partial<import('@kanjou/react').Messages>
  export default messages
}

declare module 'virtual:kanjou/locales' {
  const locales: Record<import('@kanjou/react').Locale, () => Promise<{ default: import('@kanjou/react').Messages }>>
  export default locales
}`

export async function writeVirtualDts(config: UserConfig) {
  const virtualPath =
    config.dts?.virtualPath ??
    (config.dts?.outDir && path.join(config.dts.outDir, 'virtual.kanjou.d.ts'))
  if (!virtualPath) return

  const formattedDts = await format(VIRTUAL_DTS, config.format)
  await writeFile(virtualPath, formattedDts, { mkdir: { recursive: true } })
}
