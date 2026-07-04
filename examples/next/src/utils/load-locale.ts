import type { Locale } from '../providers/intl-provider'

export async function loadLocale(locale: Locale): Promise<Record<string, any>> {
  const messages = await import(`../assets/locales/${locale}.ts`)
  return messages.default
}
