import type { Options as PrettierOptions } from 'prettier'
import type { LoadConfigResult } from 'unconfig'

import consola from 'consola'
import { createConfigLoader as createLoader } from 'unconfig'

export interface UserConfig {
  sourceLocale: string
  format?: boolean | PrettierOptions
  dts?: {
    outDir?: string
    localesPath?: string
    virtualPath?: string
  }
}

export function defineConfig(config: UserConfig): UserConfig {
  return config
}

export type LoadUserConfigResult<Config = UserConfig> = LoadConfigResult<Config>

export async function loadConfig<Config = UserConfig>(
  cwd: string = process.cwd(),
  inlineConfig: Partial<UserConfig>,
): Promise<LoadConfigResult<Config>> {
  const loader = createLoader<Config>({
    cwd,
    sources: [{ files: ['kanjou.config'] }],
  })

  const result = await loader.load()

  if (!result.config && !inlineConfig) consola.error('[@kanjou/config] Config file not found')

  result.config = Object.assign({}, result.config, inlineConfig)

  if (!(result.config as UserConfig)?.sourceLocale) {
    throw new Error('[@kanjou/config] "sourceLocale" is strictly required in the configuration')
  }

  return result
}

export function createRecoveryConfigLoader<Config extends UserConfig = UserConfig>(): (
  cwd: string | undefined,
  inlineConfig: Partial<UserConfig>,
) => Promise<LoadConfigResult<Config>> {
  let lastResolved: LoadConfigResult<Config>

  return async (
    cwd: string = process.cwd(),
    inlineConfig: Partial<UserConfig>,
  ): Promise<LoadConfigResult<Config>> => {
    try {
      const config = await loadConfig<Config>(cwd, inlineConfig)
      lastResolved = config
      return config
    } catch (error) {
      if (lastResolved) {
        consola.error('[@kanjou/config] Error loading config:', error)
        return lastResolved
      }
      throw error
    }
  }
}
