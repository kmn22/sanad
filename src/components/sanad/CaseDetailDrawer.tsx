'use client'

import { useEffect, useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Gavel,
  User,
  Calendar,
  CalendarClock,
  FileText,
  Clock,
  MessageSquare,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Briefcase,
  Phone,
  Mail,
  Users,
  StickyNote,
  ArrowDownLeft,
  ArrowUpRight,
  Sparkles,
  Bot,
  ShieldAlert,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import {
  formatDate,
  formatDuration,
  formatSAR,
  daysUntil,
  PRIORITY_COLORS,
  DOC_STATUS_COLORS,
  type Client,
  type Task,
  type TimeEntry,
  type Communication,
  type Invoice,
  type LegalDocument,
} from '@/lib/sanad/types'

interface Props {
  caseId: string | null
  onClose: () => void
  onChange: () => void
}

/** Full case detail payload returned by GET /api/cases/[id]/detail */
interface CaseDetail {
  id: string
  title: string
  clientId: string | null
  clientName: string
  caseType: string
  stage: string
  priority: string
  dueDate: string | null
  hearingDate: string | null
  value: number | null
  caseNumber: string | null
  court: string | null
  opposingParty: string | null
  notes: string | null
  client: Client | null
  timeEntries: (TimeEntry & { invoice?: { id: string; number: string } | null })[]
  communications: (Communication & { client?: { name: string } | null })[]
  invoices: Invoice[]
  tasks: Task[]
  documents: LegalDocument[]
  stats: {
    billableSec: number
    billableSAR: number
    uninvoicedSAR: number
    invoicedSAR: number
    totalCommunications: number
    totalInvoices: number
    openTasks: number
  }
}

// ---- Display color maps ----

const STAGE_COLORS: Record<string, string> = {
  drafting: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  client_review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
  filed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  closed: 'bg-muted text-muted-foreground',
}

const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  overdue: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  cancelled: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200',
}

const COMM_TYPE_META: Record<string, { Icon: LucideIcon; color: string }> = {
  call: { Icon: Phone, color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  email: { Icon: Mail, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  meeting: { Icon: Users, color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  sms: { Icon: MessageSquare, color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  note: { Icon: StickyNote, color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300' },
}

function getCommMeta(type: string) {
  return COMM_TYPE_META[type] ?? COMM_TYPE_META.note
}

const DIRECTION_META: Record<string, { Icon: LucideIcon; color: string }> = {
  incoming: { Icon: ArrowDownLeft, color: 'text-emerald-600 dark:text-emerald-400' },
  outgoing: { Icon: ArrowUpRight, color: 'text-amber-600 dark:text-amber-400' },
}

function getDirectionMeta(direction: string) {
  return DIRECTION_META[direction] ?? DIRECTION_META.outgoing
}

// ---- Helpers ----

/** Compute SAR amount for a single time entry. */
function entryAmount(e: TimeEntry): number {
  if (!e.hourlyRate) return 0
  return (e.hourlyRate * e.durationSec) / 3600
}

// =====================================================================
// Main drawer
// =====================================================================

export function CaseDetailDrawer({ caseId, onClose, onChange }: Props) {
  const { lang, t } = useLang()
  const [data, setData] = useState<CaseDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Drawer slides in from the "start" side: right in RTL (Arabic), left in LTR (English).
  const side: 'left' | 'right' = lang === 'ar' ? 'right' : 'left'

  // Fetch case detail whenever caseId changes. We keep the cancelled-flag
  // pattern to avoid setState-after-unmount warnings.
  useEffect(() => {
    if (!caseId) {
      setLoading(false)
      setError(null)
      return // keep stale data so the close animation is smooth
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    fetch(`/api/cases/${caseId}/detail`)
      .then(async (r) => {
        if (!r.ok) throw new Error(r.status === 404 ? 'Case not found' : 'Failed to load case')
        return r.json() as Promise<CaseDetail>
      })
      .then((d) => {
        if (cancelled) return
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        if (cancelled) return
        setError(e instanceof Error ? e.message : 'Failed to load case')
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [caseId])

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  // Toggle a task's done state with optimistic update + revert-on-error.
  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    setData((prev) =>
      prev
        ? {
            ...prev,
            tasks: prev.tasks.map((tk) => (tk.id === task.id ? { ...tk, status: newStatus } : tk)),
            stats: {
              ...prev.stats,
              openTasks: Math.max(0, prev.stats.openTasks + (newStatus === 'done' ? -1 : 1)),
            },
          }
        : prev,
    )
    try {
      const r = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!r.ok) throw new Error('Failed to update task')
      toast.success(newStatus === 'done' ? t('tasks.completed') : t('tasks.reopened'))
      onChange()
    } catch {
      // Revert optimistic update
      setData((prev) =>
        prev
          ? {
              ...prev,
              tasks: prev.tasks.map((tk) => (tk.id === task.id ? { ...tk, status: task.status } : tk)),
              stats: {
                ...prev.stats,
                openTasks: Math.max(0, prev.stats.openTasks + (newStatus === 'done' ? 1 : -1)),
              },
            }
          : prev,
      )
      toast.error('Failed to update task')
    }
  }

  const showBody = data && !error

  return (
    <Sheet open={caseId !== null} onOpenChange={handleOpenChange}>
      <SheetContent
        side={side}
        className="w-full sm:max-w-2xl gap-0 p-0 flex flex-col"
      >
        {/* ---------- Header ---------- */}
        <SheetHeader className="p-5 border-b border-border gap-2 space-y-0">
          <SheetDescription className="sr-only">{t('case.detail')}</SheetDescription>

          {data && !loading ? (
            <>
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Gavel className="size-3.5" />
                {t('case.detail')}
              </p>
              <SheetTitle className="text-xl font-bold leading-tight text-start">
                {data.title}
              </SheetTitle>
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${STAGE_COLORS[data.stage] ?? STAGE_COLORS.closed}`}
                >
                  {t(`stage.${data.stage}`)}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${
                    PRIORITY_COLORS[data.priority]?.color ?? PRIORITY_COLORS.normal.color
                  }`}
                >
                  {t(`prio.${data.priority}`)}
                </Badge>
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
                  {t(`ctype.${data.caseType}`)}
                </Badge>
              </div>
            </>
          ) : loading ? (
            <>
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Gavel className="size-3.5" />
                {t('case.detail')}
              </p>
              <SheetTitle className="text-xl font-bold leading-tight text-start">
                <Skeleton className="h-6 w-3/4" />
              </SheetTitle>
              <div className="flex gap-1.5 pt-0.5">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-20" />
              </div>
            </>
          ) : error ? (
            <>
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Gavel className="size-3.5" />
                {t('case.detail')}
              </p>
              <SheetTitle className="text-base font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertTriangle className="size-4" />
                {error}
              </SheetTitle>
            </>
          ) : (
            <SheetTitle className="text-base font-semibold">{t('case.detail')}</SheetTitle>
          )}
        </SheetHeader>

        {/* ---------- Body ---------- */}
        {showBody && data ? (
          <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0 gap-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="border-b border-border px-2 shrink-0">
              <TabsList className="bg-transparent h-auto p-1 w-full justify-start overflow-x-auto rounded-none">
                <TabsTrigger value="overview" className="flex-none">
                  {t('case.overview')}
                </TabsTrigger>
                <TabsTrigger value="tasks" className="flex-none gap-1.5">
                  {t('case.tasks')}
                  {data.stats.openTasks > 0 && (
                    <span className="inline-flex items-center justify-center min-w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] px-1 leading-none">
                      {data.stats.openTasks.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="documents" className="flex-none gap-1.5">
                  {t('case.documents')}
                  {data.documents.length > 0 && (
                    <CountChip n={data.documents.length} lang={lang} />
                  )}
                </TabsTrigger>
                <TabsTrigger value="time" className="flex-none gap-1.5">
                  {t('case.time_entries')}
                  {data.timeEntries.length > 0 && (
                    <CountChip n={data.timeEntries.length} lang={lang} />
                  )}
                </TabsTrigger>
                <TabsTrigger value="comms" className="flex-none gap-1.5">
                  {t('case.communications')}
                  {data.communications.length > 0 && (
                    <CountChip n={data.communications.length} lang={lang} />
                  )}
                </TabsTrigger>
                <TabsTrigger value="invoices" className="flex-none gap-1.5">
                  {t('case.invoices')}
                  {data.invoices.length > 0 && (
                    <CountChip n={data.invoices.length} lang={lang} />
                  )}
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex-none gap-1.5">
                  <Sparkles className="size-3.5 text-amber-500" />
                  {t('case.ai_insights')}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="flex-1 min-h-0 outline-none">
              <ScrollArea className="h-full">
                <OverviewTab data={data} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tasks" className="flex-1 min-h-0 outline-none">
              <ScrollArea className="h-full">
                <TasksTab tasks={data.tasks} onToggle={toggleTask} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="documents" className="flex-1 min-h-0 outline-none">
              <ScrollArea className="h-full">
                <DocumentsTab documents={data.documents} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="time" className="flex-1 min-h-0 outline-none">
              <ScrollArea className="h-full">
                <TimeTab timeEntries={data.timeEntries} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="comms" className="flex-1 min-h-0 outline-none">
              <ScrollArea className="h-full">
                <CommsTab communications={data.communications} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="invoices" className="flex-1 min-h-0 outline-none">
              <ScrollArea className="h-full">
                <InvoicesTab invoices={data.invoices} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="ai" className="flex-1 min-h-0 outline-none">
              <ScrollArea className="h-full">
                <AiInsightsTab data={data} />
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          loading && (
            <div className="flex-1 p-5 space-y-3 overflow-hidden">
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
              <Skeleton className="h-28 w-full rounded-lg" />
            </div>
          )
        )}

        {/* ---------- Footer ---------- */}
        <SheetFooter className="border-t border-border p-3 flex-row justify-end gap-2 mt-auto">
          <Button variant="outline" size="sm" onClick={onClose}>
            {t('case.close')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ---- Small presentational helpers ----

function CountChip({ n, lang }: { n: number; lang: 'ar' | 'en' }) {
  return (
    <span className="inline-flex items-center justify-center min-w-4 h-4 rounded-full bg-muted text-muted-foreground text-[10px] px-1 leading-none">
      {n.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
    </span>
  )
}

function EmptyState({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-muted-foreground">
      <Icon className="size-7 mb-2 opacity-40" />
      <p>{label}</p>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="flex items-start gap-2.5 min-w-0">
      <div className="mt-0.5 shrink-0 rounded-md bg-muted/60 p-1.5">
        <Icon className="size-3.5 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate" title={value}>
          {value}
        </p>
        {hint && <p className="text-[10px] text-muted-foreground mt-0.5">{hint}</p>}
      </div>
    </div>
  )
}

// =====================================================================
// Tabs
// =====================================================================

function OverviewTab({ data }: { data: CaseDetail }) {
  const { lang, t } = useLang()
  const num = (n: number) => n.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')

  const hearingDays = data.hearingDate ? daysUntil(data.hearingDate) : null
  const dueDays = data.dueDate ? daysUntil(data.dueDate) : null

  return (
    <div className="p-4 space-y-4">
      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InfoRow
          icon={User}
          label={t('case.client')}
          value={data.client?.name || data.clientName || '—'}
          hint={data.client?.company || undefined}
        />
        <InfoRow
          icon={Gavel}
          label={t('case.court')}
          value={data.court || '—'}
        />
        <InfoRow
          icon={Scale}
          label={t('case.case_number')}
          value={data.caseNumber || '—'}
        />
        <InfoRow
          icon={Briefcase}
          label={t('case.opposing_party')}
          value={data.opposingParty || '—'}
        />
        <InfoRow
          icon={CalendarClock}
          label={t('case.hearing_date')}
          value={formatDate(data.hearingDate, lang)}
          hint={
            hearingDays !== null
              ? hearingDays < 0
                ? t('dash.d_overdue', { n: Math.abs(hearingDays) })
                : t('dash.d_left', { n: hearingDays })
              : undefined
          }
        />
        <InfoRow
          icon={Calendar}
          label={t('case.due_date')}
          value={formatDate(data.dueDate, lang)}
          hint={
            dueDays !== null
              ? dueDays < 0
                ? t('dash.d_overdue', { n: Math.abs(dueDays) })
                : t('dash.d_left', { n: dueDays })
              : undefined
          }
        />
        <InfoRow
          icon={Receipt}
          label={t('case.value')}
          value={data.value != null && data.value > 0 ? formatSAR(data.value, lang) : '—'}
        />
      </div>

      {/* Notes */}
      {data.notes && data.notes.trim().length > 0 && (
        <>
          <Separator />
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {t('case.overview')}
            </p>
            <p className="text-sm text-start whitespace-pre-wrap leading-relaxed text-foreground/90">
              {data.notes}
            </p>
          </div>
        </>
      )}

      {/* Stats summary */}
      <Separator />
      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {t('case.billable_total')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            label={t('case.billable_total')}
            value={formatSAR(data.stats.billableSAR, lang)}
            sub={formatDuration(data.stats.billableSec, lang)}
            tone="default"
          />
          <StatCard
            label={t('case.invoiced')}
            value={formatSAR(data.stats.invoicedSAR, lang)}
            tone="emerald"
          />
          <StatCard
            label={t('case.uninvoiced')}
            value={formatSAR(data.stats.uninvoicedSAR, lang)}
            tone="amber"
          />
          <StatCard
            label={t('case.tasks')}
            value={num(data.stats.openTasks)}
            sub={t('dash.open_tasks')}
            tone="default"
          />
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  tone = 'default',
}: {
  label: string
  value: string
  sub?: string
  tone?: 'default' | 'emerald' | 'amber'
}) {
  const toneClass =
    tone === 'emerald'
      ? 'text-emerald-700 dark:text-emerald-300'
      : tone === 'amber'
        ? 'text-amber-700 dark:text-amber-300'
        : 'text-foreground'
  return (
    <Card className="bg-muted/30 border-border">
      <CardContent className="p-2.5 space-y-0.5">
        <p className="text-[10px] text-muted-foreground truncate">{label}</p>
        <p className={`text-sm font-semibold ${toneClass}`}>{value}</p>
        {sub && <p className="text-[10px] text-muted-foreground truncate">{sub}</p>}
      </CardContent>
    </Card>
  )
}

function TasksTab({ tasks, onToggle }: { tasks: Task[]; onToggle: (task: Task) => void }) {
  const { lang, t } = useLang()

  if (tasks.length === 0) {
    return <EmptyState icon={CheckCircle2} label={t('case.no_tasks')} />
  }

  // Sort: open first, then by due date asc; done last
  const sorted = [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1
    if (a.status !== 'done' && b.status === 'done') return -1
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <ul className="p-3 space-y-2">
      {sorted.map((task) => {
        const done = task.status === 'done'
        const days = task.dueDate ? daysUntil(task.dueDate) : null
        const overdue = !done && days !== null && days < 0
        return (
          <li key={task.id}>
            <Card className={`${done ? 'opacity-60' : ''} hover:border-primary/30 transition-colors`}>
              <CardContent className="p-3 flex items-start gap-2.5">
                <Checkbox
                  checked={done}
                  onCheckedChange={() => onToggle(task)}
                  className="mt-0.5"
                  aria-label={task.title}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-sm font-medium leading-tight text-start ${
                      done ? 'line-through text-muted-foreground' : ''
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 ${
                        PRIORITY_COLORS[task.priority]?.color ?? PRIORITY_COLORS.normal.color
                      }`}
                    >
                      {t(`prio.${task.priority}`)}
                    </Badge>
                    {task.dueDate && (
                      <span
                        className={`text-[10px] flex items-center gap-1 ${
                          overdue
                            ? 'text-rose-600 dark:text-rose-400 font-medium'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Calendar className="size-2.5" />
                        {formatDate(task.dueDate, lang)}
                        {overdue &&
                          ` (${t('dash.d_overdue', { n: Math.abs(days!) })})`}
                        {!overdue && days! <= 3 &&
                          ` (${t('dash.d_left', { n: days! })})`}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}

function DocumentsTab({ documents }: { documents: LegalDocument[] }) {
  const { lang, t } = useLang()

  if (documents.length === 0) {
    return <EmptyState icon={FileText} label={t('case.no_documents')} />
  }

  // Sort by expiry proximity (closest first)
  const sorted = [...documents].sort((a, b) => {
    const aExp = a.expiryDate ? daysUntil(a.expiryDate) : 9999
    const bExp = b.expiryDate ? daysUntil(b.expiryDate) : 9999
    return aExp - bExp
  })

  return (
    <ul className="p-3 space-y-2">
      {sorted.map((doc) => {
        const days = doc.expiryDate ? daysUntil(doc.expiryDate) : null
        const expired = days !== null && days < 0
        const expiringSoon = days !== null && days >= 0 && days <= 30
        return (
          <li key={doc.id}>
            <Card className="hover:border-primary/30 transition-colors">
              <CardContent className="p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight flex-1 min-w-0">
                    <FileText className="size-3.5 inline-block me-1 -mt-0.5 text-muted-foreground" />
                    {doc.title}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${
                      DOC_STATUS_COLORS[doc.status] ?? DOC_STATUS_COLORS.draft
                    }`}
                  >
                    {t(`dstatus.${doc.status}`)}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
                    {t(`dtype.${doc.docType}`)}
                  </Badge>
                  {doc.signedDate && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="size-2.5" />
                      {formatDate(doc.signedDate, lang)}
                    </span>
                  )}
                  {doc.expiryDate && (
                    <span
                      className={`flex items-center gap-1 ${
                        expired
                          ? 'text-rose-600 dark:text-rose-400 font-medium'
                          : expiringSoon
                            ? 'text-amber-600 dark:text-amber-400 font-medium'
                            : ''
                      }`}
                    >
                      <CalendarClock className="size-2.5" />
                      {formatDate(doc.expiryDate, lang)}
                      {expired && ` (${t('dash.d_overdue', { n: Math.abs(days!) })})`}
                      {!expired && expiringSoon && ` (${t('dash.d_left', { n: days! })})`}
                    </span>
                  )}
                </div>
                {doc.parties && (
                  <p className="text-[10px] text-muted-foreground truncate">{doc.parties}</p>
                )}
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}

function TimeTab({
  timeEntries,
}: {
  timeEntries: (TimeEntry & { invoice?: { id: string; number: string } | null })[]
}) {
  const { lang, t } = useLang()

  if (timeEntries.length === 0) {
    return <EmptyState icon={Clock} label={t('case.no_time')} />
  }

  return (
    <ul className="p-3 space-y-2">
      {timeEntries.map((e) => {
        const amount = entryAmount(e)
        return (
          <li key={e.id}>
            <Card className="hover:border-primary/30 transition-colors">
              <CardContent className="p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-tight flex-1 min-w-0 text-start">
                    {e.description}
                  </p>
                  {e.billable ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 shrink-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"
                    >
                      {t('session.billable')}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] px-1.5 py-0 shrink-0 bg-muted text-muted-foreground"
                    >
                      {e.sessionType}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-2.5" />
                      {formatDate(e.date, lang)}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-foreground/80">
                      <Clock className="size-2.5" />
                      {formatDuration(e.durationSec, lang)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {e.billable && amount > 0 && (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        {formatSAR(amount, lang)}
                      </span>
                    )}
                    {e.invoice && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                        <Receipt className="size-2.5" />
                        {e.invoice.number}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}

function CommsTab({
  communications,
}: {
  communications: (Communication & { client?: { name: string } | null })[]
}) {
  const { lang, t } = useLang()

  if (communications.length === 0) {
    return <EmptyState icon={MessageSquare} label={t('case.no_comms')} />
  }

  return (
    <ul className="p-3 space-y-2">
      {communications.map((c) => {
        const meta = getCommMeta(c.type)
        const dirMeta = getDirectionMeta(c.direction)
        const Icon = meta.Icon
        return (
          <li key={c.id}>
            <Card className="hover:border-primary/30 transition-colors">
              <CardContent className="p-3 space-y-1.5">
                <div className="flex items-start gap-2.5">
                  <div
                    className={`shrink-0 rounded-md p-1.5 ${meta.color}`}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight flex-1 min-w-0 text-start">
                        {c.subject}
                      </p>
                      <dirMeta.Icon
                        className={`size-3.5 shrink-0 mt-0.5 ${dirMeta.color}`}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                      <span>{t(`comms.types.${c.type}`)}</span>
                      <span aria-hidden>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-2.5" />
                        {formatDate(c.date, lang)}
                      </span>
                      {c.client?.name && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="flex items-center gap-1">
                            <User className="size-2.5" />
                            {c.client.name}
                          </span>
                        </>
                      )}
                      {c.durationMin != null && c.durationMin > 0 && (
                        <>
                          <span aria-hidden>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-2.5" />
                            {c.durationMin.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')}
                            {lang === 'ar' ? 'د' : 'm'}
                          </span>
                        </>
                      )}
                    </div>
                    {c.body && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 text-start">
                        {c.body}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}

function InvoicesTab({ invoices }: { invoices: Invoice[] }) {
  const { lang, t } = useLang()

  if (invoices.length === 0) {
    return <EmptyState icon={Receipt} label={t('case.no_invoices')} />
  }

  const sorted = [...invoices].sort(
    (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
  )

  return (
    <ul className="p-3 space-y-2">
      {sorted.map((inv) => {
        const days = inv.dueDate ? daysUntil(inv.dueDate) : null
        const overdue = inv.status !== 'paid' && inv.status !== 'cancelled' && days !== null && days < 0
        return (
          <li key={inv.id}>
            <Card className="hover:border-primary/30 transition-colors">
              <CardContent className="p-3 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-tight flex items-center gap-1.5">
                      <Receipt className="size-3.5 text-muted-foreground" />
                      {inv.number}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDate(inv.issueDate, lang)}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 shrink-0 ${
                      INVOICE_STATUS_COLORS[inv.status] ?? INVOICE_STATUS_COLORS.draft
                    }`}
                  >
                    {t(`istatus.${inv.status}`)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-sm font-semibold">
                    {formatSAR(inv.total, lang)}
                  </span>
                  {inv.dueDate && (
                    <span
                      className={`text-[10px] flex items-center gap-1 ${
                        overdue
                          ? 'text-rose-600 dark:text-rose-400 font-medium'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <CalendarClock className="size-2.5" />
                      {formatDate(inv.dueDate, lang)}
                      {overdue && ` (${t('dash.d_overdue', { n: Math.abs(days!) })})`}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          </li>
        )
      })}
    </ul>
  )
}

function AiInsightsTab({ data }: { data: CaseDetail }) {
  const { lang, t } = useLang()
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)

  const analyze = async () => {
    setLoading(true)
    try {
      const caseContext = `
        Case Title: ${data.title}
        Type: ${data.caseType}
        Stage: ${data.stage}
        Notes: ${data.notes || 'None'}
        Opposing Party: ${data.opposingParty || 'None'}
        Value: ${data.value || 0}
      `
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: caseContext, type: 'document' })
      })
      const json = await res.json()
      if (json.analysis) {
        setAnalysis(json.analysis)
      } else {
        toast.error('AI Analysis failed.')
      }
    } catch (e) {
      toast.error('AI Analysis failed.')
    }
    setLoading(false)
  }

  return (
    <div className="p-4 space-y-4">
      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="size-16 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
            <Bot className="size-8 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('ai.analyze_case')}</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            قم بتحليل تفاصيل هذه القضية باستخدام الذكاء الاصطناعي لاستخراج ملخص تنفيذي، تحليل للمخاطر المحتملة، وتوصيات للخطوات القادمة.
          </p>
          <Button onClick={analyze} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
            <Sparkles className="size-4" />
            {t('ai.analyze_case')}
          </Button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
          <div className="animate-spin text-amber-500">
            <Sparkles className="size-8" />
          </div>
          <p className="text-sm font-medium animate-pulse">{t('ai.analyzing')}</p>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="space-y-2">
            <h4 className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
              <Bot className="size-4 text-amber-500" />
              {t('ai.summary')}
            </h4>
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="p-4 text-sm leading-relaxed text-foreground/90">
                {analysis.summary}
              </CardContent>
            </Card>
          </div>

          {analysis.risks && analysis.risks.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
                <ShieldAlert className="size-4 text-rose-500" />
                {t('ai.risks')}
              </h4>
              <div className="space-y-2">
                {analysis.risks.map((risk: any, i: number) => (
                  <Card key={i} className="border-rose-500/20">
                    <CardContent className="p-3 flex gap-3">
                      <div className="mt-0.5 shrink-0">
                        {risk.severity === 'high' ? (
                          <Badge className="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 hover:bg-rose-100">{t('ai.severity_high')}</Badge>
                        ) : risk.severity === 'medium' ? (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100">{t('ai.severity_medium')}</Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 hover:bg-emerald-100">{t('ai.severity_low')}</Badge>
                        )}
                      </div>
                      <p className="text-sm">{risk.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold tracking-wide uppercase text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-4 text-emerald-500" />
                {t('ai.recommendations')}
              </h4>
              <Card>
                <CardContent className="p-4">
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm items-start">
                        <span className="text-emerald-500 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
