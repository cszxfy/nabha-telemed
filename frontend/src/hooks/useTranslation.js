import { useState, useCallback } from 'react'
import en from '../i18n/en.json'
import hi from '../i18n/hi.json'
import pa from '../i18n/pa.json'

const BUNDLES = { en, hi, pa }

export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
]

export function useTranslation(defaultLang = 'en') {
  const [lang, setLang] = useState(defaultLang)

  const t = useCallback(
    (key) => BUNDLES[lang]?.[key] ?? BUNDLES['en']?.[key] ?? key,
    [lang]
  )

  return { t, lang, setLang }
}
