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
import { ScannerView } from '@/components/sanad/ScannerView'
import { CalendarView } from '@/components/sanad/CalendarView'
import { CommunicationsView } from '@/components/sanad/CommunicationsView'
import { StudentView } from '@/components/sanad/StudentView'
import { TodayFocusView } from '@/components/sanad/TodayFocusView'
import { CommandPalette } from '@/components/sanad/CommandPalette'
import { TopNav } from '@/components/sanad/TopNav'
import { MobileNav } from '@/components/sanad/MobileNav'
import { Sidebar } from '@/components/sanad/Sidebar'
import type { DashboardData, StudentDashboardData } from '@/lib/sanad/types'

type View = 'today' | 'dashboard' | 'compliance' | 'cases' | 'deepwork' | 'tasks' | 'documents' | 'clients' | 'invoices' | 'scanner' | 'calendar' | 'communications'
type Persona = 'lawyer' | 'student'

import { useQuery } from '@tanstack/react-query'
import { getLawyerDashboard } from '@/app/actions/dashboard'
import { getStudentDashboard } from '@/app/actions/studentDashboard'

const PERSONA_STORAGE_KEY = 'sanad.persona'

export default function Home() {
  const { lang, t, toggle: toggleLang } = useLang()
  const [persona, setPersona] = useState<Persona>('lawyer')
  const [view, setView] = useState<string>('today')
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)

  const { data: dashboardData, isLoading: isLoadingLawyer, refetch: refetchLawyer, isRefetching: isRefetchingLawyer } = useQuery<DashboardData>({
    queryKey: ['dashboard', 'lawyer'],
    queryFn: async () => {
      // Use Server Action instead of fetch
      return await getLawyerDashboard() as unknown as DashboardData
    },
    enabled: persona === 'lawyer',
  })

  const { data: studentDashboardData, isLoading: isLoadingStudent, refetch: refetchStudent, isRefetching: isRefetchingStudent } = useQuery<StudentDashboardData>({
    queryKey: ['dashboard', 'student'],
    queryFn: async () => {
      // Use Server Action instead of fetch
      return await getStudentDashboard() as unknown as StudentDashboardData
    },
    enabled: persona === 'student',
  })

  const data = dashboardData || null
  const studentData = studentDashboardData || null
  const loading = persona === 'lawyer' ? isLoadingLawyer || isRefetchingLawyer : isLoadingStudent || isRefetchingStudent

  const onRefresh = () => {
    if (persona === 'lawyer') refetchLawyer()
    else refetchStudent()
  }

  const onChange = onRefresh

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(PERSONA_STORAGE_KEY) : null
    if (saved === 'student' || saved === 'lawyer') setPersona(saved)
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(() => {})
      }
    } else {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister().then((success) => {
              if (success) {
                console.log('Unregistered active service worker in development mode')
                window.location.reload()
              }
            })
          }
        })
      }
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

      <TopNav
        persona={persona}
        switchPersona={switchPersona}
        loading={loading}
        onRefresh={onRefresh}
        setPaletteOpen={setPaletteOpen}
        mounted={mounted}
      />

      <MobileNav persona={persona} view={view} setView={setView} />

      <div className="flex flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar persona={persona} view={view} setView={setView} data={data} />

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
              {view === 'scanner' && <ScannerView />}
              {view === 'calendar' && <CalendarView onNavigate={(v) => setView(v)} />}
              {view === 'communications' && <CommunicationsView cases={data.cases.all} clients={data.clients} onChange={onChange} />}
            </>
          ) : (
            <div className="text-center py-12 text-sm text-muted-foreground">{t('dash.failed_load')} <Button variant="link" onClick={() => onChange()}>{t('dash.retry')}</Button></div>
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
