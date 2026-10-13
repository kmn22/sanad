'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, Receipt } from 'lucide-react'
import { useLang } from '@/lib/sanad/i18n'
import { formatDate, formatSAR, daysUntil, type Invoice } from '@/lib/sanad/types'
import { INVOICE_STATUS_COLORS } from './meta'
import { EmptyState } from './primitives'

export function InvoicesTab({ invoices }: { invoices: Invoice[] }) {
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
