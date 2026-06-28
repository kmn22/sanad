'use client'

import React from 'react'
import { NAV_KEYS, NAV_ICONS } from '@/lib/sanad/constants'
import { useLang } from '@/lib/sanad/i18n'
import type { DashboardData } from '@/lib/sanad/types'

interface SidebarProps {
  persona: 'lawyer' | 'student'
  view: string
  setView: (v: string) => void
  data: DashboardData | null
}

export function Sidebar({ persona, view, setView, data }: SidebarProps) {
  const { t } = useLang()

  if (persona !== 'lawyer') return null

  return (
    <aside className="hidden lg:block w-56 shrink-0">
      <nav className="sticky top-20 space-y-1">
        {NAV_KEYS.map((v) => {
          const Icon = NAV_ICONS[v]
          if (!Icon) return null
          return (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                view === v
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t(`nav.${v}`)}
              {v === 'tasks' && data && data.stats.openTasks > 0 && (
                <span className="ms-auto text-[10px] bg-primary/15 text-primary rounded-full px-1.5 py-0.5 font-semibold">
                  {data.stats.openTasks}
                </span>
              )}
              {v === 'compliance' && data && data.stats.expiringCompliance > 0 && (
                <span className="ms-auto text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 rounded-full px-1.5 py-0.5 font-semibold">
                  {data.stats.expiringCompliance}
                </span>
              )}
            </button>
          )
        })}
        <div className="pt-4 mt-4 border-t border-border space-y-2">
          <button
            onClick={() => window.open('/api/backup', '_blank')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            {t('common.backup_data')}
          </button>
          
          <p className="text-[10px] text-muted-foreground px-3 leading-relaxed mt-2">
            {t('common.pwa_note')}
          </p>
          <p className="text-[10px] text-muted-foreground px-3 leading-relaxed">
            ⌘K للبحث السريع
          </p>
        </div>
      </nav>
    </aside>
  )
}
