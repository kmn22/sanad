'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, FileText, CheckCircle2 } from 'lucide-react'
import { useLang } from '@/lib/sanad/i18n'
import { formatDate, daysUntil, DOC_STATUS_COLORS, type LegalDocument } from '@/lib/sanad/types'
import { EmptyState } from './primitives'

export function DocumentsTab({ documents }: { documents: LegalDocument[] }) {
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
