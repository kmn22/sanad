'use client'

import React from 'react'
import { MoreVertical, FileSignature, Calendar, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLang } from '@/lib/sanad/i18n'
import {
  DOC_STATUS_COLORS,
  daysUntil,
  formatDate,
  type LegalDocument,
  type LegalCase,
} from '@/lib/sanad/types'
import { STATUSES } from './types'
import { DocumentVersionsDialog } from './DocumentVersionsDialog'

interface DocumentCardProps {
  document: LegalDocument
  cases: LegalCase[]
  onUpdateStatus: (doc: LegalDocument, status: string) => void
  onRefresh: () => void
}

export function DocumentCard({
  document: d,
  cases,
  onUpdateStatus,
  onRefresh,
}: DocumentCardProps) {
  const { lang, t } = useLang()
  const days = d.expiryDate ? daysUntil(d.expiryDate) : null
  const c = cases.find((c) => c.id === d.caseId)

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{d.title}</p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">{d.parties}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label={lang === 'ar' ? 'خيارات المستند' : 'Document actions'}
                className="h-7 w-7 p-0 shrink-0"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <p className="text-[10px] text-muted-foreground px-2 py-1">{t('docs.set_status')}</p>
              {STATUSES.map((s) => (
                <DropdownMenuItem key={s} onClick={() => onUpdateStatus(d, s)} disabled={d.status === s}>
                  {t(`dstatus.${s}`)}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${DOC_STATUS_COLORS[d.status]}`}>
            {t(`dstatus.${d.status}`)}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
            {t(`dtype.${d.docType}`)}
          </Badge>
        </div>

        {c && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <FileSignature className="h-3 w-3" />
            <span className="truncate">{c.title}</span>
          </div>
        )}

        {d.signedDate && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <FileSignature className="h-3 w-3" /> {t('docs.signed')}
            </span>
            <span>{formatDate(d.signedDate, lang)}</span>
          </div>
        )}

        {d.expiryDate && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {t('docs.expires')}
            </span>
            <span className={`font-medium ${
              days! < 0 ? 'text-rose-700 dark:text-rose-400' :
              days! <= 30 ? 'text-amber-800 dark:text-amber-400' :
              'text-muted-foreground'
            }`}>
              {formatDate(d.expiryDate, lang)}
              {days! < 0 ? ` (${t('docs.d_overdue', { n: Math.abs(days!) })})` : days! <= 90 ? ` (${t('dash.d_left', { n: days ?? 0 })})` : ''}
            </span>
          </div>
        )}

        {d.notes && <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">{d.notes}</p>}

        {/* Lifecycle visualization */}
        <div className="flex items-center gap-1 pt-1">
          {['draft', 'sent', 'active', 'expired'].map((stage, i) => {
            const stageIdx = STATUSES.indexOf(d.status as (typeof STATUSES)[number])
            const myIdx = STATUSES.indexOf(stage as (typeof STATUSES)[number])
            const isActive = myIdx === stageIdx
            const isPast = myIdx < stageIdx && (d.status === 'active' || d.status === 'expired' || (d.status === 'sent' && stage === 'draft'))
            return (
              <div key={stage} className="flex items-center flex-1">
                <div className={`h-1.5 flex-1 rounded-full ${isActive ? 'bg-primary' : isPast ? 'bg-primary/40' : 'bg-muted'}`} />
                {i < 3 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40 mx-0.5" />}
              </div>
            )
          })}
        </div>

        <div className="pt-2 border-t border-border/50 flex items-center justify-end">
          <DocumentVersionsDialog document={d} onUploaded={onRefresh} />
        </div>
      </CardContent>
    </Card>
  )
}
