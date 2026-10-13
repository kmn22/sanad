'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useLang } from '@/lib/sanad/i18n'
import { formatSAR, formatDate, daysUntil, type Invoice } from '@/lib/sanad/types'
import { STATUS_COLORS } from './meta'
import { InvoiceActions } from './InvoiceActions'

export function InvoiceCard({
  inv,
  onPatch,
  onDelete,
  onView,
}: {
  inv: Invoice
  onPatch: (i: Invoice, s: 'sent' | 'paid') => void
  onDelete: (i: Invoice) => void
  onView: (i: Invoice) => void
}) {
  const { lang, t } = useLang()
  const dueDays = inv.dueDate ? daysUntil(inv.dueDate) : null
  const balance = Math.max(0, inv.total - inv.paidAmount)
  const isPartial = inv.paidAmount > 0 && inv.paidAmount < inv.total
  const showCountdown =
    inv.dueDate && inv.status !== 'paid' && inv.status !== 'cancelled' && dueDays !== null

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardContent className="p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-mono text-xs font-semibold cursor-pointer hover:underline text-primary"
                dir="ltr"
                onClick={() => onView(inv)}
              >
                {inv.number}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[inv.status] ?? 'bg-muted'}`}
              >
                {t(`istatus.${inv.status}`)}
              </Badge>
            </div>
            <p className="text-xs mt-1 truncate">{inv.client?.name ?? '—'}</p>
            {inv.case && (
              <p className="text-[11px] text-muted-foreground truncate">{inv.case.title}</p>
            )}
          </div>
          <InvoiceActions inv={inv} onPatch={onPatch} onDelete={onDelete} onView={onView} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div>
            <p className="text-[10px] text-muted-foreground">{t('invoices.issue_date')}</p>
            <p className="text-muted-foreground">{formatDate(inv.issueDate, lang)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">{t('invoices.due_date')}</p>
            {inv.dueDate ? (
              <div>
                <p className="text-muted-foreground">{formatDate(inv.dueDate, lang)}</p>
                {showCountdown && (
                  <p
                    className={`text-[10px] ${
                      dueDays! < 0
                        ? 'text-rose-600 dark:text-rose-400 font-medium'
                        : dueDays! <= 7
                          ? 'text-amber-600 dark:text-amber-400 font-medium'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {dueDays! < 0
                      ? t('invoices.overdue_by', { n: Math.abs(dueDays!) })
                      : t('invoices.due_in_days', { n: dueDays! })}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t('invoices.total')}</span>
          <span className="font-semibold">{formatSAR(inv.total, lang)}</span>
        </div>
        {isPartial && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t('invoices.balance')}</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {formatSAR(balance, lang)}
            </span>
          </div>
        )}
        {inv.paidAt && inv.status === 'paid' && (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
            {t('invoices.paid_on', { date: formatDate(inv.paidAt, lang) })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
