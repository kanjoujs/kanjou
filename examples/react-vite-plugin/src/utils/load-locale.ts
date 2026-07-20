import type { Locale } from '@kanjou/react'

import localeModules from 'virtual:kanjou/locales'

export async function loadLocale(locale: Locale): Promise<Record<string, any>> {
  const modules = localeModules as Record<
    string,
    () => Promise<{ default: import('@kanjou/react').Messages }>
  >
  const messages = await modules[locale]()
  return messages.default
}
