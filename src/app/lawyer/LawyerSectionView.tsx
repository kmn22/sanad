'use client'

import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useLang } from '@/lib/sanad/i18n'
import { useLawyerDashboard } from '@/components/portal/usePortalData'
import { TodayFocusView } from '@/components/sanad/TodayFocusView'
import { DashboardView } from '@/components/sanad/DashboardView'
import { lawyerHref, type LawyerSection } from './sections'

export const ViewLoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-8 bg-muted/60 rounded-lg w-1/4" />
    <div className="h-4 bg-muted/40 rounded-lg w-1/2" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
      <div className="h-28 bg-muted/40 rounded-xl" />
      <div className="h-28 bg-muted/40 rounded-xl" />
      <div className="h-28 bg-muted/40 rounded-xl" />
    </div>
    <div className="h-64 bg-muted/30 rounded-xl mt-6" />
  </div>
)

const CasesView = dynamic(() => import('@/components/sanad/CasesView').then((m) => m.CasesView), { loading: ViewLoadingSkeleton })
const InvoicesView = dynamic(() => import('@/components/sanad/InvoicesView').then((m) => m.InvoicesView), { loading: ViewLoadingSkeleton })
const ScannerView = dynamic(() => import('@/components/sanad/ScannerView').then((m) => m.ScannerView), { loading: ViewLoadingSkeleton })
const ResearchHubView = dynamic(() => import('@/components/sanad/ResearchHubView').then((m) => m.ResearchHubView), { loading: ViewLoadingSkeleton })
const DailyBriefView = dynamic(() => import('@/components/sanad/DailyBriefView').then((m) => m.DailyBriefView), { loading: ViewLoadingSkeleton })
const DocumentsView = dynamic(() => import('@/components/sanad/DocumentsView').then((m) => m.DocumentsView), { loading: ViewLoadingSkeleton })
const DeepWorkView = dynamic(() => import('@/components/sanad/DeepWorkView').then((m) => m.DeepWorkView), { loading: ViewLoadingSkeleton })
const TasksView = dynamic(() => import('@/components/sanad/TasksView').then((m) => m.TasksView), { loading: ViewLoadingSkeleton })
const ClientsView = dynamic(() => import('@/components/sanad/ClientsView').then((m) => m.ClientsView), { loading: ViewLoadingSkeleton })
const ComplianceView = dynamic(() => import('@/components/sanad/ComplianceView').then((m) => m.ComplianceView), { loading: ViewLoadingSkeleton })
const CalendarView = dynamic(() => import('@/components/sanad/CalendarView').then((m) => m.CalendarView), { loading: ViewLoadingSkeleton })
const CommunicationsView = dynamic(() => import('@/components/sanad/CommunicationsView').then((m) => m.CommunicationsView), { loading: ViewLoadingSkeleton })
const EcosystemMap = dynamic(() => import('@/components/sanad/EcosystemMap').then((m) => m.EcosystemMap), { loading: ViewLoadingSkeleton })

/** Renders one practice section. Shared by the Lawyer and Firm portals. */
export function LawyerSectionView({ section, hrefFor = lawyerHref }: { section: LawyerSection | 'today'; hrefFor?: (view: string) => string }) {
  const router = useRouter()
  const { t } = useLang()
  const { data, isLoading, refetch } = useLawyerDashboard()
  const go = (v: string) => router.push(hrefFor(v))
  const onChange = () => {
    refetch()
  }

  // Sections that don't depend on the dashboard payload render immediately.
  if (section === 'scanner') return <ScannerView />
  if (section === 'calendar') return <CalendarView onNavigate={go} />
  if (section === 'briefs') return <DailyBriefView onNavigateToResearch={() => go('research')} />
  if (section === 'research') return <ResearchHubView onNavigateToDrafting={() => go('documents')} />
  if (section === 'ecosystem') return <EcosystemMap onClose={() => go('today')} />

  if (isLoading && !data) return <ViewLoadingSkeleton />
  if (!data) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        {t('dash.failed_load')}{' '}
        <Button variant="link" onClick={onChange}>
          {t('dash.retry')}
        </Button>
      </div>
    )
  }

  switch (section) {
    case 'today':
      return <TodayFocusView data={data} onNavigate={go} onStartFocus={() => go('deepwork')} onRefresh={onChange} />
    case 'overview':
      return <DashboardView data={data} onNavigate={go} />
    case 'compliance':
      return <ComplianceView items={data.compliance.all} onChange={onChange} />
    case 'cases':
      return <CasesView cases={data.cases.all} clients={data.clients} onChange={onChange} />
    case 'deepwork':
      return <DeepWorkView cases={data.cases.all} timeEntries={data.timeEntries} onChange={onChange} />
    case 'tasks':
      return <TasksView tasks={data.tasks.all} cases={data.cases.all} onChange={onChange} />
    case 'documents':
      return <DocumentsView documents={data.documents.all} cases={data.cases.all} onChange={onChange} />
    case 'clients':
      return <ClientsView clients={data.clients} onChange={onChange} />
    case 'invoices':
      return (
        <InvoicesView
          invoices={data.invoices}
          clients={data.clients}
          cases={data.cases.all}
          timeEntries={data.timeEntries.filter((te: any) => te.billable && !te.invoiced)}
          stats={data.stats}
          onChange={onChange}
        />
      )
    case 'communications':
      return <CommunicationsView cases={data.cases.all} clients={data.clients} onChange={onChange} />
    default:
      return null
  }
}
