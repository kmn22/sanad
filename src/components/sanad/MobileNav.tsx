'use client'

import React from 'react'
import { NAV_KEYS, NAV_ICONS } from '@/lib/sanad/constants'
import { useLang } from '@/lib/sanad/i18n'

import { GraduationCap, BookOpen, CalendarClock, Library, Scale, Brain } from 'lucide-react'

interface MobileNavProps {
  persona: 'lawyer' | 'student'
  view: string
  setView: (v: string) => void
}

const STUDENT_NAV = [
  { key: 'overview', icon: GraduationCap, labelKey: 'student.morning' },
  { key: 'courses', icon: BookOpen, labelKey: 'student.courses' },
  { key: 'deadlines', icon: CalendarClock, labelKey: 'student.deadlines' },
  { key: 'terms', icon: Library, labelKey: 'student.terms_bank' },
  { key: 'casebook', icon: Scale, labelKey: 'student.casebook' },
  { key: 'review', icon: Brain, labelKey: 'review.title' },
] as const

export function MobileNav({ persona, view, setView }: MobileNavProps) {
  const { t } = useLang()

  if (persona === 'student') {
    return (
      <nav className="lg:hidden border-b border-border/80 bg-background/90 backdrop-blur-md sticky top-14 z-30">
        <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto scroll-thin">
          {STUDENT_NAV.map((item) => {
            const Icon = item.icon
            const active = view === item.key
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{t(item.labelKey)}</span>
              </button>
            )
          })}
        </div>
      </nav>
    )
  }

  return (
    <nav className="lg:hidden border-b border-border/80 bg-background/90 backdrop-blur-md sticky top-14 z-30">
      <div className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto scroll-thin">
        {NAV_KEYS.map((v) => {
          const Icon = NAV_ICONS[v]
          if (!Icon) return null
          const active = view === v
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{t(`nav.${v}`)}</span>
              {v === 'documents' && (
                <span className={`text-[9px] px-1 rounded-full ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'}`}>
                  AI
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
