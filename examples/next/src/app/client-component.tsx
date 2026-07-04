'use client'

import { Locale, useIntl } from '@/src/providers/intl-provider'

export function ClientComponent() {
  const { t, locale, setLocale } = useIntl()

  const handleLocaleChange = async (newLocale: string) => {
    await setLocale(newLocale as Locale)
  }

  return (
    <div>
      <p>{t('greet', { name: 'Client' })}</p>

      <select value={locale} onChange={(event) => handleLocaleChange(event.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  )
}
