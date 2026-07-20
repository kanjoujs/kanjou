import type { UserConfig, LoadUserConfigResult } from '@kanjou/config'

import { createRecoveryConfigLoader } from '@kanjou/config'

export interface KanjouPluginContext<Config extends UserConfig = UserConfig> {
  ready: Promise<LoadUserConfigResult<Config>>
  reloadConfig: () => Promise<LoadUserConfigResult<Config>>
  getConfig: () => Promise<Config>
}

export function createContext<Config extends UserConfig = UserConfig>(
  inlineConfig: Partial<UserConfig> = {},
): KanjouPluginContext<Config> {
  const root = process.cwd()

  const loadConfig = createRecoveryConfigLoader<Config>()

  const _ready = reloadConfig()
  let _config = {} as Config

  async function reloadConfig() {
    const result = await loadConfig(root, inlineConfig)
    _config = result.config
    return result
  }

  async function getConfig() {
    await _ready
    return _config
  }

  return {
    get ready() {
      return _ready
    },
    reloadConfig,
    getConfig,
  }
}
