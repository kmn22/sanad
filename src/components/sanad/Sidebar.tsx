'use client'

import React, { useState } from 'react'
import { NAV_KEYS, NAV_ICONS } from '@/lib/sanad/constants'
import { GraduationCap, BookOpen, CalendarClock, Library, Scale, Brain } from 'lucide-react'
import { useLang } from '@/lib/sanad/i18n'
import type { DashboardData, StudentDashboardData } from '@/lib/sanad/types'
import { toast } from 'sonner'

interface SidebarProps {
  persona: 'lawyer' | 'student'
  view: string
  setView: (v: string) => void
  data: DashboardData | null
  studentData?: StudentDashboardData | null
}

export function Sidebar({ persona, view, setView, data, studentData }: SidebarProps) {
  const { t } = useLang()
  const [backingUp, setBackingUp] = useState(false)

  const triggerBackup = async () => {
    if (backingUp) return
    setBackingUp(true)
    const toastId = toast.loading(t('common.backup_data') + '...')
    try {
      const res = await fetch('/api/backup', { method: 'POST' })
      const json = await res.json()
      if (res.ok && json.success) {
        toast.success(t('common.backup_data') + ' ✓', { id: toastId })
      } else {
        throw new Error(json.error || 'Backup failed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Backup failed', { id: toastId })
    } finally {
      setBackingUp(false)
    }
  }

  if (persona === 'student') {
    const studentNav = [
      { key: 'overview', icon: GraduationCap, labelKey: 'student.morning', count: null, color: '' },
      { key: 'courses', icon: BookOpen, labelKey: 'student.courses', count: studentData?.stats.courses, color: 'bg-primary/15 text-primary' },
      { key: 'deadlines', icon: CalendarClock, labelKey: 'student.deadlines', count: studentData?.stats.overdueDeadlines, color: 'bg-rose-500/15 text-rose-700 dark:text-rose-400' },
      { key: 'terms', icon: Library, labelKey: 'student.terms_bank', count: studentData?.stats.terms, color: 'bg-primary/15 text-primary' },
      { key: 'casebook', icon: Scale, labelKey: 'student.casebook', count: studentData?.stats.cases, color: 'bg-primary/15 text-primary' },
      { key: 'review', icon: Brain, labelKey: 'review.title', count: null, color: '' },
    ] as const

    return (
      <aside className="hidden lg:block w-56 shrink-0">
        <nav className="sticky top-20 space-y-1">
          {studentNav.map((item) => {
            const Icon = item.icon
            const active = view === item.key
            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t(item.labelKey)}
                {item.count && item.count > 0 ? (
                  <span className={`ms-auto text-[10px] rounded-full px-1.5 py-0.5 font-semibold ${item.color}`}>
                    {item.count}
                  </span>
                ) : null}
              </button>
            )
          })}
          <div className="pt-4 mt-4 border-t border-border space-y-2">
            <button
              onClick={triggerBackup}
              disabled={backingUp}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors disabled:opacity-50"
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

  // Grouped Lawyer Navigation
  const LAWYER_SECTIONS = [
    {
      titleKey: 'operations',
      titleAr: 'العمليات والتركيز',
      titleEn: 'Operations & Focus',
      items: [
        { key: 'today', icon: NAV_ICONS.today, badge: null },
        { key: 'dashboard', icon: NAV_ICONS.dashboard, badge: null },
        { key: 'deepwork', icon: NAV_ICONS.deepwork, badge: null },
      ],
    },
    {
      titleKey: 'practice',
      titleAr: 'العمل القانوني',
      titleEn: 'Legal Practice',
      items: [
        {
          key: 'cases',
          icon: NAV_ICONS.cases,
          badge: data && data.stats.urgentCases > 0 ? { text: `${data.stats.urgentCases} عاجل`, tone: 'rose' } : null,
        },
        {
          key: 'documents',
          icon: NAV_ICONS.documents,
          badge: { text: 'صياغة AI', tone: 'emerald' },
        },
        {
          key: 'research',
          icon: NAV_ICONS.research,
          badge: { text: 'مركز الأبحاث', tone: 'blue' },
        },
        {
          key: 'briefs',
          icon: NAV_ICONS.briefs,
          badge: { text: 'النشرة', tone: 'emerald' },
        },
        {
          key: 'tasks',
          icon: NAV_ICONS.tasks,
          badge: data && data.stats.openTasks > 0 ? { text: `${data.stats.openTasks}`, tone: 'primary' } : null,
        },
        { key: 'clients', icon: NAV_ICONS.clients, badge: null },
      ],
    },
    {
      titleKey: 'tools',
      titleAr: 'المالية والأدوات',
      titleEn: 'Tools & Finance',
      items: [
        {
          key: 'compliance',
          icon: NAV_ICONS.compliance,
          badge: data && data.stats.expiringCompliance > 0 ? { text: `${data.stats.expiringCompliance}`, tone: 'amber' } : null,
        },
        { key: 'invoices', icon: NAV_ICONS.invoices, badge: null },
        { key: 'scanner', icon: NAV_ICONS.scanner, badge: null },
        { key: 'calendar', icon: NAV_ICONS.calendar, badge: null },
        { key: 'communications', icon: NAV_ICONS.communications, badge: null },
      ],
    },
  ]

  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <nav className="sticky top-20 space-y-5 pb-6">
        {LAWYER_SECTIONS.map((section, sIdx) => (
          <div key={section.titleKey} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-wider mb-1.5">
              {section.titleAr}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon
              if (!Icon) return null
              const active = view === item.key

              return (
                <button
                  key={item.key}
                  onClick={() => setView(item.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all group cursor-pointer ${
                    active
                      ? 'bg-primary/15 text-primary font-semibold shadow-2xs border-e-2 border-primary'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                  <span className="truncate">{t(`nav.${item.key}`)}</span>
                  
                  {item.badge && (
                    <span
                      className={`ms-auto text-[10px] rounded-full px-2 py-0.5 font-medium whitespace-nowrap ${
                        item.badge.tone === 'rose'
                          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                          : item.badge.tone === 'amber'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                          : item.badge.tone === 'emerald'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-semibold'
                          : 'bg-primary/15 text-primary'
                      }`}
                    >
                      {item.badge.text}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}

        {/* Local Sovereign & Backup Card */}
        <div className="pt-3 border-t border-border/80">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                نظام محلي آمن
              </span>
              <kbd className="text-[9px] bg-background px-1.5 py-0.5 rounded border border-border/80 text-muted-foreground font-mono">
                ⌘K
              </kbd>
            </div>

            <button
              onClick={triggerBackup}
              disabled={backingUp}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all disabled:opacity-50 cursor-pointer border border-emerald-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={backingUp ? 'animate-spin' : ''}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
              </svg>
              <span>{backingUp ? 'جاري النسخ...' : t('common.backup_data')}</span>
            </button>
            <p className="text-[9px] text-muted-foreground/80 leading-normal text-center">
              بياناتك مشفرة ومحفوظة بالكامل على جهازك
            </p>
          </div>
        </div>
      </nav>
    </aside>
  )
}
