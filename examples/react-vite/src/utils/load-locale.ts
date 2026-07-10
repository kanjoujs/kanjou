import type { Locale, Messages } from '@kanjou/react'

export async function loadLocale(locale: Locale): Promise<Messages> {
  const messages = await import(`../assets/locales/${locale}.ts`)
  return messages.default
}
