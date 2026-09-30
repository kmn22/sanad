'use client'

import React from 'react'
import { Moon, Sun, RefreshCw, Languages, GraduationCap, Briefcase, Search, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLang } from '@/lib/sanad/i18n'
import { useTheme } from 'next-themes'
import { signOut, useSession } from 'next-auth/react'
import { NotificationCenter } from '@/components/sanad/NotificationCenter'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

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
  const { data: session } = useSession()
  const { lang, t, toggle: toggleLang } = useLang()
  const { theme, setTheme } = useTheme()

  const userName = session?.user?.name || (persona === 'lawyer' ? 'المحامي الممارس' : 'طالب قانون')
  const userEmail = session?.user?.email || (persona === 'lawyer' ? 'lawyer@sanad.sa' : 'student@sanad.sa')
  const initialLetter = userName.trim().charAt(0) || (persona === 'lawyer' ? 'م' : 'ط')

  const now = new Date()
  const timeLocale = lang === 'ar' ? 'ar-SA' : 'en-GB'
  const timeStr = now.toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString(timeLocale, { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-bold text-base shadow-sm ring-1 ring-emerald-400/30">
              <span className="translate-y-[-1px]">س</span>
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-background" />
            </div>
            <div className="leading-tight text-start">
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                  {t('brand.name')}
                </p>
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-full font-semibold bg-primary/15 text-primary border border-primary/20">
                  {persona === 'lawyer' ? 'PRO' : 'STUDENT'}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground hidden sm:block">
                {persona === 'lawyer' ? t('brand.tagline') : t('student.morning')}
              </p>
            </div>
          </div>

          {/* Center search omnibar on desktop */}
          <button
            onClick={() => setPaletteOpen(true)}
            className="hidden md:flex items-center gap-2 h-8 px-3 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground text-xs border border-border/80 transition-all cursor-pointer w-48 lg:w-64 justify-between group shadow-2xs"
            title="بحث سريع (⌘K)"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-primary transition-transform group-hover:scale-110" />
              <span className="text-xs">{lang === 'ar' ? 'بحث في القضايا والمستندات...' : 'Search cases, docs...'}</span>
            </div>
            <kbd className="text-[10px] bg-background px-1.5 py-0.5 rounded border border-border/80 font-mono shadow-2xs">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-2">
            {/* Sovereign status badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{lang === 'ar' ? 'محلي مشفّر' : 'Local Sovereign'}</span>
            </div>

            <span className="hidden lg:inline text-xs text-muted-foreground tabular-nums">
              {mounted ? `${timeStr} • ${dateStr}` : null}
            </span>

            {/* Persona Switcher Pill */}
            <div className="flex items-center bg-muted/70 rounded-full p-0.5 border border-border/60">
              <button
                onClick={() => switchPersona('lawyer')}
                className={`h-7 px-2.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  persona === 'lawyer'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Briefcase className="h-3 w-3" />
                <span className="hidden sm:inline">محامي</span>
              </button>
              <button
                onClick={() => switchPersona('student')}
                className={`h-7 px-2.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  persona === 'student'
                    ? 'bg-background text-foreground shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <GraduationCap className="h-3 w-3" />
                <span className="hidden sm:inline">طالب</span>
              </button>
            </div>

            {/* Mobile search trigger */}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 md:hidden"
              onClick={() => setPaletteOpen(true)}
              title="بحث سريع (⌘K)"
            >
              <Search className="h-3.5 w-3.5" />
            </Button>

            <NotificationCenter />

            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={onRefresh}
              title={t('common.refresh')}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
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
                {theme === 'dark' ? <Sun className="h-3.5 w-3.5 text-amber-400" /> : <Moon className="h-3.5 w-3.5" />}
              </Button>
            )}

            <DropdownMenu dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <DropdownMenuTrigger asChild>
                <button
                  className="relative h-8 w-8 rounded-full bg-gradient-to-tr from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 text-primary grid place-items-center text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer border border-primary/20 shadow-2xs"
                  title="الملف الشخصي"
                >
                  {initialLetter}
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-background" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-panel">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                    <div className="pt-1.5 flex items-center gap-1.5">
                      <span className="inline-block text-[10px] bg-primary/15 text-primary px-2 py-0.5 rounded-full font-medium border border-primary/20">
                        {persona === 'lawyer' ? 'محامٍ ممارس (مرخص)' : 'طالب قانون'}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => switchPersona(persona === 'lawyer' ? 'student' : 'lawyer')}
                  className="cursor-pointer gap-2"
                >
                  {persona === 'lawyer' ? <GraduationCap className="h-4 w-4 text-primary" /> : <Briefcase className="h-4 w-4 text-primary" />}
                  <span>{persona === 'lawyer' ? 'التبديل إلى وضع الطالب' : 'التبديل إلى وضع المحامي'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-500/10 cursor-pointer gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
