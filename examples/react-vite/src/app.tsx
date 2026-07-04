import type { Locale } from '#/providers/intl-provider'

import { useIntl } from '#/providers/intl-provider'

export function App() {
  const { t, locale, setLocale } = useIntl()

  return (
    <div>
      {/* fully typesafe translation, try changing 'greet' or 'name' to see ts errors */}
      <p>{t('greet', { name: 'You' })}</p>

      <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  )
}
