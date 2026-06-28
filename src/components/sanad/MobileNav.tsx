'use client'

import React from 'react'
import { NAV_KEYS, NAV_ICONS } from '@/lib/sanad/constants'
import { useLang } from '@/lib/sanad/i18n'

interface MobileNavProps {
  persona: 'lawyer' | 'student'
  view: string
  setView: (v: string) => void
}

export function MobileNav({ persona, view, setView }: MobileNavProps) {
  const { t } = useLang()

  if (persona !== 'lawyer') return null

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
