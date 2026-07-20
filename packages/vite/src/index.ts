import type { UserConfig } from '@kanjou/config'
import type { Plugin } from 'vite'

import fs from 'node:fs/promises'
import path from 'node:path'
import { normalizePath } from 'vite'

import { createContext } from '#/shared/context'

import { generateLocalesDts, generateVirtualDts } from './dts'
import { generateLocaleMessages, generateLocaleModules } from './virtual'

export function kanjou(config?: UserConfig): Plugin {
  const ctx = createContext(config)

  return {
    name: 'kanjou',
    async handleHotUpdate({ file, server }) {
      const config = await ctx.getConfig()

      const dir = path.dirname(config.sourceLocale)
      const localesDir = normalizePath(path.resolve(dir))
      const fileDir = normalizePath(path.dirname(file))

      if (fileDir !== localesDir) return

      if (
        file === normalizePath(path.resolve(config.sourceLocale)) &&
        (config.dts?.outDir || config.dts?.localesPath)
      ) {
        await generateLocalesDts(config)
      }

      const modules = []

      const localeName = path.basename(file, path.extname(file))
      const localeModule = server.moduleGraph.getModuleById(`\0virtual:kanjou/${localeName}`)
      if (localeModule) modules.push(localeModule)

      const modulesModule = server.moduleGraph.getModuleById('\0virtual:kanjou/locales')
      if (modulesModule) modules.push(modulesModule)

      return modules
    },
    async buildStart() {
      const config = await ctx.getConfig()

      if (!config.dts) return

      const dir = path.dirname(config.sourceLocale)
      const localeFiles = await fs.readdir(dir)

      for (const file of localeFiles) {
        this.addWatchFile(path.join(dir, file))
      }

      if (config.dts.outDir || config.dts.localesPath) await generateLocalesDts(config)
      if (config.dts.outDir || config.dts.virtualPath) await generateVirtualDts(config)
    },
    resolveId(id) {
      if (id.startsWith('virtual:kanjou/')) return '\0' + id
    },
    async load(id) {
      if (!id.startsWith('\0virtual:kanjou/')) return

      const config = await ctx.getConfig()

      if (id === '\0virtual:kanjou/locales') return generateLocaleModules(config.sourceLocale)

      const locale = id.split('/')[1]
      return generateLocaleMessages(config.sourceLocale, locale)
    },
  }
}
