'use client'

import { useEffect, useState, useCallback } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun, RefreshCw, Languages, GraduationCap, Briefcase, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { useLang } from '@/lib/sanad/i18n'
import { DashboardView } from '@/components/sanad/DashboardView'
import { ComplianceView } from '@/components/sanad/ComplianceView'
import { CasesView } from '@/components/sanad/CasesView'
import { DeepWorkView } from '@/components/sanad/DeepWorkView'
import { TasksView } from '@/components/sanad/TasksView'
import { DocumentsView } from '@/components/sanad/DocumentsView'
import { ClientsView } from '@/components/sanad/ClientsView'
import { InvoicesView } from '@/components/sanad/InvoicesView'
import { CommunicationsView } from '@/components/sanad/CommunicationsView'
import { CalendarView } from '@/components/sanad/CalendarView'
import { StudentView } from '@/components/sanad/StudentView'
import { TodayFocusView } from '@/components/sanad/TodayFocusView'
import { CommandPalette } from '@/components/sanad/CommandPalette'
import type { DashboardData, StudentDashboardData } from '@/lib/sanad/types'

type View = 'today' | 'dashboard' | 'compliance' | 'cases' | 'deepwork' | 'tasks' | 'documents' | 'clients' | 'invoices' | 'communications' | 'calendar'
type Persona = 'lawyer' | 'student'

const PERSONA_STORAGE_KEY = 'sanad.persona'

const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  today: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
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
  clients: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  invoices: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z" />
      <path d="M14 2v6h6" />
      <path d="M12 18v-3" />
      <path d="M8 18v-3" />
      <path d="M16 18v-3" />
    </svg>
  ),
  communications: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  calendar: (props) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </svg>
  ),
}

const NAV_KEYS: string[] = ['today', 'dashboard', 'clients', 'cases', 'communications', 'documents', 'invoices', 'compliance', 'tasks', 'deepwork', 'calendar']

export default function Home() {
  const { lang, t, toggle: toggleLang } = useLang()
  const [persona, setPersona] = useState<Persona>('lawyer')
  const [view, setView] = useState<string>('today')
  const [data, setData] = useState<DashboardData | null>(null)
  const [studentData, setStudentData] = useState<StudentDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(PERSONA_STORAGE_KEY) : null
    if (saved === 'student' || saved === 'lawyer') setPersona(saved)
  }, [])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen((o) => !o)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    if (!data) return
    const overdue = (data.stats?.overdueTasks || 0) + (data.stats?.outstandingInvoices || 0)
    const baseTitle = 'سند — لوحة العمليات اليومية'
    document.title = overdue > 0 ? `(${overdue}) ${baseTitle}` : baseTitle
  }, [data])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      if (persona === 'lawyer') {
        const res = await fetch('/api/dashboard')
        const json = await res.json()
        setData(json)
      } else {
        const res = await fetch('/api/student/dashboard')
        const json = await res.json()
        setStudentData(json)
      }
    } catch (e) {
      console.error('Failed to load dashboard', e)
    } finally {
      setLoading(false)
    }
  }, [persona])

  useEffect(() => { refresh() }, [refresh, refreshKey])
  const onChange = () => setRefreshKey((k) => k + 1)

  const switchPersona = (p: Persona) => {
    setPersona(p)
    localStorage.setItem(PERSONA_STORAGE_KEY, p)
    setView('today')
  }

  const now = new Date()
  const timeLocale = lang === 'ar' ? 'ar-SA' : 'en-GB'
  const timeStr = now.toLocaleTimeString(timeLocale, { hour: '2-digit', minute: '2-digit' })
  const dateStr = now.toLocaleDateString(timeLocale, { weekday: 'short', day: 'numeric', month: 'short' })

  return (
    <div className="min-h-screen flex flex-col bg-background" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <SonnerToaster position="top-right" richColors closeButton />

      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground grid place-items-center font-semibold text-base">س</div>
              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-tight">{t('brand.name')}</p>
                <p className="text-[10px] text-muted-foreground hidden sm:block">
                  {persona === 'lawyer' ? t('brand.tagline') : t('student.morning')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-muted-foreground tabular-nums">{timeStr} • {dateStr}</span>

              <div className="flex items-center gap-0.5 bg-muted rounded-md p-0.5">
                <button onClick={() => switchPersona('lawyer')} className={`h-7 px-2 rounded text-xs font-medium transition-colors flex items-center gap-1 ${persona === 'lawyer' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Briefcase className="h-3.5 w-3.5" /><span className="hidden sm:inline">محامي</span>
                </button>
                <button onClick={() => switchPersona('student')} className={`h-7 px-2 rounded text-xs font-medium transition-colors flex items-center gap-1 ${persona === 'student' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                  <GraduationCap className="h-3.5 w-3.5" /><span className="hidden sm:inline">طالب</span>
                </button>
              </div>

              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setPaletteOpen(true)} title="بحث سريع (⌘K)">
                <Search className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setRefreshKey((k) => k + 1)} title={t('common.refresh')}>
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 gap-1 px-2" onClick={toggleLang} title="Language">
                <Languages className="h-3.5 w-3.5" /><span className="text-xs font-medium">{lang === 'ar' ? 'EN' : 'ع'}</span>
              </Button>
              {mounted && (
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} title={t('common.theme')}>
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                </Button>
              )}
              <div className="h-7 w-7 rounded-full bg-primary/15 text-primary grid place-items-center text-xs font-medium">{persona === 'lawyer' ? 'أ' : 'ط'}</div>
            </div>
          </div>
        </div>
      </header>

      {persona === 'lawyer' && (
        <nav className="lg:hidden border-b border-border bg-background sticky top-14 z-30">
          <div className="flex items-center gap-1 px-4 overflow-x-auto scroll-thin">
            {NAV_KEYS.map((v) => {
              const Icon = NAV_ICONS[v]
              if (!Icon) return null
              return (
                <button key={v} onClick={() => setView(v)} className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${view === v ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                  <Icon className="h-3.5 w-3.5" />{t(`nav.${v}`)}
                </button>
              )
            })}
          </div>
        </nav>
      )}

      <div className="flex flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {persona === 'lawyer' && (
          <aside className="hidden lg:block w-56 shrink-0">
            <nav className="sticky top-20 space-y-1">
              {NAV_KEYS.map((v) => {
                const Icon = NAV_ICONS[v]
                if (!Icon) return null
                return (
                  <button key={v} onClick={() => setView(v)} className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${view === v ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                    <Icon className="h-4 w-4" />{t(`nav.${v}`)}
                    {v === 'tasks' && data && data.stats.openTasks > 0 && <span className="ms-auto text-[10px] bg-primary/15 text-primary rounded-full px-1.5 py-0.5 font-semibold">{data.stats.openTasks}</span>}
                    {v === 'compliance' && data && data.stats.expiringCompliance > 0 && <span className="ms-auto text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 rounded-full px-1.5 py-0.5 font-semibold">{data.stats.expiringCompliance}</span>}
                  </button>
                )
              })}
              <div className="pt-4 mt-4 border-t border-border">
                <p className="text-[10px] text-muted-foreground px-3 leading-relaxed">{t('common.pwa_note')}</p>
                <p className="text-[10px] text-muted-foreground px-3 leading-relaxed mt-2">⌘K للبحث السريع</p>
              </div>
            </nav>
          </aside>
        )}

        <main className="flex-1 min-w-0">
          {loading && (!data || (persona === 'student' && !studentData)) ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-muted rounded-lg" />)}</div>
              <div className="h-64 bg-muted rounded-lg" />
            </div>
          ) : persona === 'student' && studentData ? (
            <StudentView data={studentData} onChange={onChange} />
          ) : data ? (
            <>
              {view === 'today' && <TodayFocusView data={data} onNavigate={(v) => setView(v)} onStartFocus={() => setView('deepwork')} />}
              {view === 'dashboard' && <DashboardView data={data} onNavigate={(v) => setView(v)} />}
              {view === 'compliance' && <ComplianceView items={data.compliance.all} onChange={onChange} />}
              {view === 'cases' && <CasesView cases={data.cases.all} clients={data.clients} onChange={onChange} />}
              {view === 'deepwork' && <DeepWorkView cases={data.cases.all} timeEntries={data.timeEntries} onChange={onChange} />}
              {view === 'tasks' && <TasksView tasks={data.tasks.all} cases={data.cases.all} onChange={onChange} />}
              {view === 'documents' && <DocumentsView documents={data.documents.all} cases={data.cases.all} onChange={onChange} />}
              {view === 'clients' && <ClientsView clients={data.clients} onChange={onChange} />}
              {view === 'invoices' && <InvoicesView invoices={data.invoices} clients={data.clients} cases={data.cases.all} timeEntries={data.timeEntries.filter((te: any) => te.billable && !te.invoiced)} stats={data.stats} onChange={onChange} />}
              {view === 'communications' && <CommunicationsView communications={data.communications} clients={data.clients} cases={data.cases.all} onChange={onChange} />}
              {view === 'calendar' && <CalendarView onNavigate={(v) => setView(v)} />}
            </>
          ) : (
            <div className="text-center py-12 text-sm text-muted-foreground">{t('dash.failed_load')} <Button variant="link" onClick={() => setRefreshKey(k => k + 1)}>{t('dash.retry')}</Button></div>
          )}
        </main>
      </div>

      <footer className="mt-auto border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>{t('common.footer_left')}</p>
            <p className="flex items-center gap-2"><span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />{t('common.footer_right')}</p>
          </div>
        </div>
      </footer>

      {mounted && <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} onNavigate={(v) => setView(v)} onCreate={() => {}} />}
    </div>
  )
}
