'use client'

import { useI18n } from '@kanjou/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ClientComponent() {
  const router = useRouter()

  const { t, locale } = useI18n()

  const [count, setCount] = useState(1)

  const handleLocaleChange = (newLocale: string) => {
    document.cookie = `kanjou_locale=${newLocale}; path=/; max-age=31536000`
    router.refresh()
  }

  return (
    <div>
      <p>{t('greet', { name: 'Client' })}</p>

      <div>
        <p>{t('apples', { count })}</p>
        <div>
          <button onClick={() => setCount(Math.max(0, count - 1))}>-</button>
          <button onClick={() => setCount(count + 1)}>+</button>
        </div>
      </div>

      <select value={locale} onChange={(event) => handleLocaleChange(event.target.value)}>
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="fr">Français</option>
      </select>
    </div>
  )
}
