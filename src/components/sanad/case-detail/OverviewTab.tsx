'use client'

import { Separator } from '@/components/ui/separator'
import { Gavel, User, Calendar, CalendarClock, Receipt, Scale, Briefcase } from 'lucide-react'
import { useLang } from '@/lib/sanad/i18n'
import { formatDate, formatDuration, formatSAR, daysUntil } from '@/lib/sanad/types'
import { type CaseDetail } from './types'
import { InfoRow, StatCard } from './primitives'

// =====================================================================
// Tabs
// =====================================================================

export function OverviewTab({ data }: { data: CaseDetail }) {
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
