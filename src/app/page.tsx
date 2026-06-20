'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, RefreshCw, Languages } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { useLang } from '@/lib/sanad/i18n'
import { DashboardView } from '@/components/sanad/DashboardView'
import { ComplianceView } from '@/components/sanad/ComplianceView'
import { CasesView } from '@/components/sanad/CasesView'
import { DeepWorkView } from '@/components/sanad/DeepWorkView'
import { TasksView } from '@/components/sanad/TasksView'
import { DocumentsView } from '@/components/sanad/DocumentsView'
import type { DashboardData } from '@/lib/sanad/types'

type View = 'dashboard' | 'compliance' | 'cases' | 'deepwork' | 'tasks' | 'documents'

const NAV_ICONS: Record<View, React.ComponentType<{ className?: string }>> = {
  dashboard: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  compliance: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  cases: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3 3h18" />
      <path d="M5 3v18" />
      <path d="M19 3v18" />
      <path d="M5 8h14" />
      <path d="M5 13h14" />
      <path d="M5 18h14" />
    </svg>
  ),
  deepwork: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2" />
      <path d="M5 3 2 6" />
      <path d="m22 6-3-3" />
      <path d="M6.38 18.7 5 22" />
      <path d="m19 22-1.38-3.3" />
    </svg>
  ),
  tasks: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </svg>
  ),
  documents: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  ),
}

const NAV_KEYS: View[] = ['dashboard', 'compliance', 'cases', 'deepwork', 'tasks', 'documents']

export default function Home() {
  const { lang, t, toggle: toggleLang } = useLang()
  const [view, setView] = useState<View>('dashboard')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/dashboard')
      const json = await res.json()
      setData(json)
    } catch (e) {
      console.error('Failed to load dashboard', e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh, refreshKey])
  const onChange = () => setRefreshKey((k) => k + 1)

  const now = new Date()
  const timeLocale = lang === 'ar' ? 'ar-SA' : 'en-GB'
  const timeStr = now.toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString(timeLocale, { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <SonnerToaster position="top-right" richColors closeButton />

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-semibold text-base">
                  س
                </div>
                <div className="leading-tight">
                  <p className="text-sm font-semibold tracking-tight">{t('brand.name')}</p>
                  <p className="text-[10px] text-muted-foreground hidden sm:block">{t('brand.tagline')}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-muted-foreground tabular-nums">
                {timeStr} • {dateStr}
              </span>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setRefreshKey((k) => k + 1)} title={t('common.refresh')}>
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2"
                onClick={toggleLang}
                title="Language / اللغة"
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
                أ
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile nav (horizontal scroll) */}
      <nav className="lg:hidden border-b border-border bg-background sticky top-14 z-30">
        <div className="flex items-center gap-1 px-4 overflow-x-auto scroll-thin">
          {NAV_KEYS.map((v) => {
            const Icon = NAV_ICONS[v]
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  view === v ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t(`nav.${v}`)}
              </button>
            )
          })}
        </div>
      </nav>

      <div className="flex flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Sidebar nav (desktop) */}
        <aside className="hidden lg:block w-56 shrink-0">
          <nav className="sticky top-20 space-y-1">
            {NAV_KEYS.map((v) => {
              const Icon = NAV_ICONS[v]
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

            <div className="pt-4 mt-4 border-t border-border">
              <p className="text-[10px] text-muted-foreground px-3 leading-relaxed">
                {t('common.pwa_note')}
                <br /><br />
                {t('common.cache_note')}
              </p>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {loading && !data ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-muted rounded-lg" />)}
              </div>
              <div className="h-64 bg-muted rounded-lg" />
            </div>
          ) : data ? (
            <>
              {view === 'dashboard' && <DashboardView data={data} onNavigate={(v) => setView(v as View)} />}
              {view === 'compliance' && <ComplianceView items={data.compliance.all} onChange={onChange} />}
              {view === 'cases' && <CasesView cases={data.cases.all} onChange={onChange} />}
              {view === 'deepwork' && (
                <DeepWorkView cases={data.cases.all} timeEntries={data.timeEntries} onChange={onChange} />
              )}
              {view === 'tasks' && <TasksView tasks={data.tasks.all} cases={data.cases.all} onChange={onChange} />}
              {view === 'documents' && <DocumentsView documents={data.documents.all} cases={data.cases.all} onChange={onChange} />}
            </>
          ) : (
            <div className="text-center py-12 text-sm text-muted-foreground">
              {t('dash.failed_load')} <Button variant="link" onClick={() => setRefreshKey(k => k + 1)}>{t('dash.retry')}</Button>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>{t('common.footer_left')}</p>
            <p className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t('common.footer_right')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
