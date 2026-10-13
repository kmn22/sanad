'use client'

import { Badge } from '@/components/ui/badge'
import { TableRow, TableCell } from '@/components/ui/table'
import { useLang } from '@/lib/sanad/i18n'
import { formatSAR, formatDate, daysUntil, type Invoice } from '@/lib/sanad/types'
import { STATUS_COLORS } from './meta'
import { InvoiceActions } from './InvoiceActions'

export function InvoiceRow({
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
    <TableRow className="group">
      <TableCell className="ps-4">
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
      </TableCell>
      <TableCell className="text-xs">
        <span className="truncate">{inv.client?.name ?? '—'}</span>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground max-w-[180px]">
        <span className="truncate block">{inv.case?.title ?? '—'}</span>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(inv.issueDate, lang)}
      </TableCell>
      <TableCell className="text-xs whitespace-nowrap">
        {inv.dueDate ? (
          <div className="flex flex-col">
            <span className="text-muted-foreground">{formatDate(inv.dueDate, lang)}</span>
            {showCountdown && (
              <span
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
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-end text-xs font-medium whitespace-nowrap">
        {formatSAR(inv.total, lang)}
      </TableCell>
      <TableCell className="text-end text-xs whitespace-nowrap">
        {isPartial ? (
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            {formatSAR(balance, lang)}
          </span>
        ) : inv.status === 'paid' ? (
          <span className="text-emerald-600 dark:text-emerald-400">✓</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="pe-3">
        <InvoiceActions inv={inv} onPatch={onPatch} onDelete={onDelete} onView={onView} />
      </TableCell>
    </TableRow>
  )
}
