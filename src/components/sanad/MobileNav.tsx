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
      <nav className="lg:hidden border-b border-border bg-background sticky top-14 z-30">
        <div className="flex items-center gap-1 px-4 overflow-x-auto scroll-thin">
          {STUDENT_NAV.map((item) => {
            const Icon = item.icon
            const active = view === item.key
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(item.labelKey)}
              </button>
            )
          })}
        </div>
      </nav>
    )
  }

  return (
    <nav className="lg:hidden border-b border-border bg-background sticky top-14 z-30">
      <div className="flex items-center gap-1 px-4 overflow-x-auto scroll-thin">
        {NAV_KEYS.map((v) => {
          const Icon = NAV_ICONS[v]
          if (!Icon) return null
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                view === v
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t(`nav.${v}`)}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
