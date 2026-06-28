'use client'

import React from 'react'
import { Moon, Sun, RefreshCw, Languages, GraduationCap, Briefcase, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLang } from '@/lib/sanad/i18n'
import { useTheme } from 'next-themes'

interface TopNavProps {
  persona: 'lawyer' | 'student'
  switchPersona: (p: 'lawyer' | 'student') => void
  loading: boolean
  onRefresh: () => void
  setPaletteOpen: React.Dispatch<React.SetStateAction<boolean>>
  mounted: boolean
}

export function TopNav({
  persona,
  switchPersona,
  loading,
  onRefresh,
  setPaletteOpen,
  mounted,
}: TopNavProps) {
  const { lang, t, toggle: toggleLang } = useLang()
  const { theme, setTheme } = useTheme()

  const now = new Date()
  const timeLocale = lang === 'ar' ? 'ar-SA' : 'en-GB'
  const timeStr = now.toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString(timeLocale, { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-semibold text-base">
              س
            </div>
            <div className="leading-tight text-start">
              <p className="text-sm font-semibold tracking-tight">{t('brand.name')}</p>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                {persona === 'lawyer' ? t('brand.tagline') : t('student.morning')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground tabular-nums">
              {mounted ? `${timeStr} • ${dateStr}` : null}
            </span>

            <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
              <button
                onClick={() => switchPersona('lawyer')}
                className={`h-7 px-2 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  persona === 'lawyer'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Briefcase className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">محامي</span>
              </button>
              <button
                onClick={() => switchPersona('student')}
                className={`h-7 px-2 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  persona === 'student'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <GraduationCap className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">طالب</span>
              </button>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setPaletteOpen(true)}
              title="بحث سريع (⌘K)"
            >
              <Search className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onRefresh}
              title={t('common.refresh')}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 px-2"
              onClick={toggleLang}
              title="Language"
            >
              <Languages className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">{lang === 'ar' ? 'EN' : 'ع'}</span>
            </Button>
            {mounted && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                title={t('common.theme')}
              >
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </Button>
            )}
            <div className="h-7 w-7 rounded-full bg-primary/15 text-primary grid place-items-center text-xs font-medium">
              {persona === 'lawyer' ? 'أ' : 'ط'}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
