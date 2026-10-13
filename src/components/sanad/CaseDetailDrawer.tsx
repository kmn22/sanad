'use client'

import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { Gavel, AlertTriangle, Sparkles, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { PRIORITY_COLORS, type Task } from '@/lib/sanad/types'
import CasePortalTab from '@/components/sanad/CasePortalTab'
import { type CaseDetail } from './case-detail/types'
import { STAGE_COLORS } from './case-detail/meta'
import { CountChip } from './case-detail/primitives'
import { OverviewTab } from './case-detail/OverviewTab'
import { TasksTab } from './case-detail/TasksTab'
import { DocumentsTab } from './case-detail/DocumentsTab'
import { TimeTab } from './case-detail/TimeTab'
import { CommsTab } from './case-detail/CommsTab'
import { InvoicesTab } from './case-detail/InvoicesTab'
import { AiInsightsTab } from './case-detail/AiInsightsTab'

interface Props {
  caseId: string | null
  onClose: () => void
  onChange: () => void
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
                <TabsTrigger value="portal" className="flex-none gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <ShieldAlert className="size-3.5" />
                  {lang === 'ar' ? 'بوابة الموكل' : 'Client Portal'}
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

            <TabsContent value="portal" className="flex-1 min-h-0 outline-none">
              <ScrollArea className="h-full">
                <CasePortalTab
                  caseId={data.id}
                  clientId={data.clientId}
                  clientName={data.clientName}
                  clientPhone={data.client?.phone}
                  caseTitle={data.title}
                />
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
                <TimeTab
                  timeEntries={data.timeEntries}
                  caseId={data.id}
                  clientId={data.clientId}
                  caseTitle={data.title}
                  onInvoiceCreated={() => {
                    onChange()
                  }}
                />
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
