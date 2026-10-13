'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { ar, type TranslationKey } from './ar'
import { en } from './en'

export type { TranslationKey }

export type Lang = 'ar' | 'en'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
  t: (key: TranslationKey | (string & {}), vars?: Record<string, string | number>) => string
}

const Ctx = createContext<LangCtx | null>(null)

const STORAGE_KEY = 'sanad.lang'

// ---- Translation catalogs ----
const translations: Record<Lang, Record<string, string>> = { ar, en }

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Lazy initializer reads localStorage once on first client render — no effect needed
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'ar'
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'ar' || saved === 'en' ? saved : 'ar'
  })

  // Sync html lang + dir attributes
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, l)
  }

  const toggle = () => setLang(lang === 'ar' ? 'en' : 'ar')

  const t = (key: TranslationKey | (string & {}), vars?: Record<string, string | number>) => {
    let str = translations[lang][key] ?? translations.en[key] ?? key
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v))
      })
    }
    return str as string
  }

  return (
    <Ctx.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </Ctx.Provider>
  )
}

export function useLang() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
