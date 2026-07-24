import type { UserConfig } from '@kanjou/config'
import type { Plugin } from 'vite'

import path from 'node:path'
import { normalizePath } from 'vite'

import { createContext } from '#/shared/context'
import { readdir } from '#/shared/fs'
import { basename, basenames } from '#/shared/path'

import { writeLocalesDts, writeVirtualDts } from './dts'
import { filterLocaleFiles, readLocaleFile } from './utils'
import { compileAst, compileLocales } from './virtual'

export function kanjou(config?: UserConfig): Plugin {
  const ctx = createContext(config)

  return {
    name: 'kanjou',
    async handleHotUpdate({ file, server }) {
      const config = await ctx.getConfig()

      const fileDir = normalizePath(path.dirname(file))
      const sourceLocale = normalizePath(path.resolve(config.sourceLocale))
      const localesDir = normalizePath(path.dirname(sourceLocale))

      if (fileDir !== localesDir) return

      if (file === sourceLocale) await writeLocalesDts(config)

      const modules = []

      const locale = basename(file)
      const localeModule = server.moduleGraph.getModuleById(`\0virtual:kanjou/${locale}`)
      if (localeModule) modules.push(localeModule)

      const modulesModule = server.moduleGraph.getModuleById('\0virtual:kanjou/locales')
      if (modulesModule) modules.push(modulesModule)

      return modules
    },
    async buildStart() {
      const config = await ctx.getConfig()

      if (!config.dts) return

      const localeFiles = await readdir(path.dirname(config.sourceLocale))

      filterLocaleFiles(localeFiles).forEach((file) => this.addWatchFile(file.absolute))

      await Promise.all([writeLocalesDts(config), writeVirtualDts(config)])
    },
    resolveId(id) {
      if (id.startsWith('virtual:kanjou/')) return '\0' + id
    },
    async load(id) {
      if (!id.startsWith('\0virtual:kanjou/')) return

      const config = await ctx.getConfig()

      const localeFiles = await readdir(path.dirname(config.sourceLocale))

      if (id === '\0virtual:kanjou/locales') return compileLocales(basenames(localeFiles))

      const locale = id.split('/')[1]
      const localeFile = localeFiles.find((localeFile) => localeFile.name === locale)!

      const messages = await readLocaleFile(localeFile)

      return compileAst(messages ?? {})
    },
  }
}
