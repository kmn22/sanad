'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Receipt, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { formatDate, formatDuration, formatSAR, type TimeEntry } from '@/lib/sanad/types'
import { entryAmount } from '@/lib/sanad/billing-calc'
import { EmptyState } from './primitives'

export interface TimeTabProps {
  timeEntries: (TimeEntry & { invoice?: { id: string; number: string } | null })[]
  caseId?: string
  clientId?: string | null
  caseTitle?: string
  onInvoiceCreated?: () => void
}

export function TimeTab({
  timeEntries,
  caseId,
  clientId,
  caseTitle,
  onInvoiceCreated,
}: TimeTabProps) {
  const { lang, t } = useLang()
  const [generating, setGenerating] = useState(false)

  const unbilledEntries = useMemo(
    () => timeEntries.filter((e) => e.billable && !e.invoice),
    [timeEntries]
  )
  const unbilledSec = useMemo(
    () => unbilledEntries.reduce((acc, e) => acc + (e.durationSec || 0), 0),
    [unbilledEntries]
  )
  const unbilledSAR = useMemo(
    () => unbilledEntries.reduce((acc, e) => acc + entryAmount(e), 0),
    [unbilledEntries]
  )

  const handleGenerateInvoice = async () => {
    if (unbilledEntries.length === 0) return
    setGenerating(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeEntryIds: unbilledEntries.map((e) => e.id),
          caseId,
          clientId,
          notes:
            lang === 'ar'
              ? `أتعاب ساعات عمل مسجلة لقضية: ${caseTitle || ''}`.trim()
              : `Billable hours for case: ${caseTitle || ''}`.trim(),
          dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to generate invoice')
      }

      const inv = await res.json()
      toast.success(
        lang === 'ar'
          ? `تم إنشاء الفاتورة ${inv.number} بنجاح وربط ${unbilledEntries.length} جلسة`
          : `Invoice ${inv.number} generated & ${unbilledEntries.length} sessions linked`
      )
      onInvoiceCreated?.()
    } catch {
      toast.error(
        lang === 'ar' ? 'فشل إصدار الفاتورة، يرجى المحاولة لاحقاً' : 'Failed to generate invoice'
      )
    } finally {
      setGenerating(false)
    }
  }

  if (timeEntries.length === 0) {
    return <EmptyState icon={Clock} label={t('case.no_time')} />
  }

  return (
    <div className="p-3 space-y-3">
      {unbilledEntries.length > 0 && (
        <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold text-foreground">
                {lang === 'ar' ? 'ساعات عمل مستحقة غير مفوترة' : 'Unbilled Billable Hours'}
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {lang === 'ar'
                ? `${unbilledEntries.length} جلسات (${formatDuration(unbilledSec, lang)}) بإجمالي `
                : `${unbilledEntries.length} sessions (${formatDuration(unbilledSec, lang)}) totaling `}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatSAR(unbilledSAR, lang)}
              </span>
            </p>
          </div>
          <Button
            size="sm"
            onClick={handleGenerateInvoice}
            disabled={generating}
            className="shrink-0 gap-1.5 shadow-sm text-xs"
          >
            {generating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Receipt className="size-3.5" />
            )}
            {lang === 'ar' ? 'إصدار فاتورة بالأتعاب فوراً' : 'Generate Invoice Now'}
          </Button>
        </div>
      )}

      <ul className="space-y-2">
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
    </div>
  )
}
