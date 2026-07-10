import type { Locale } from '@kanjou/react'

import { useState } from 'react'

import { useIntl } from '#/providers/intl-provider'

export function App() {
  const { t, locale, setLocale } = useIntl()
  const [count, setCount] = useState(1)

  return (
    <div>
      {/* fully typesafe translation, try changing 'greet' or 'name' to see ts errors */}
      <p>{t('greet', { name: 'You' })}</p>

      <div>
        <p>{t('apples', { count })}</p>
        <div>
          <button onClick={() => setCount((c) => Math.max(0, c - 1))}>-</button>
          <button onClick={() => setCount((c) => c + 1)}>+</button>
        </div>
      </div>

      <select value={locale} onChange={(e) => setLocale(e.target.value as Locale)}>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  )
}
