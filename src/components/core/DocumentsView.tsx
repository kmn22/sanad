'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/core/i18n'
import { daysUntil, type LegalDocument } from '@/lib/core/types'
import { AddDocDialog } from './documents/AddDocDialog'
import { AiDraftDialog } from './documents/AiDraftDialog'
import { ContractSummaryDialog } from './documents/ContractSummaryDialog'
import { DocumentCard } from './documents/DocumentCard'
import { STATUSES, type DocumentsViewProps } from './documents/types'

export function DocumentsView({ documents, cases, onChange }: DocumentsViewProps) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const sorted = [...documents].sort((a, b) => {
    const aExp = a.expiryDate ? daysUntil(a.expiryDate) : 999
    const bExp = b.expiryDate ? daysUntil(b.expiryDate) : 999
    return aExp - bExp
  })

  const filtered = sorted.filter((d) => {
    const matchesFilter = filter === 'all' || d.status === filter
    const matchesSearch = !searchQuery.trim() || 
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.parties && d.parties.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (d.notes && d.notes.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesFilter && matchesSearch
  })

  const counts: Record<string, number> = { all: documents.length }
  STATUSES.forEach((s) => { counts[s] = documents.filter((d) => d.status === s).length })

  const updateStatus = async (doc: LegalDocument, status: string) => {
    try {
      const res = await fetch(`/api/documents/${doc.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result.error || t('common.failed'))
      toast.success(`${doc.title} → ${t(`dstatus.${status}`)}`)
      onChange()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.failed'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t('docs.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('docs.subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ContractSummaryDialog />
          <AiDraftDialog cases={cases} onSaved={() => onChange()} />
          <AddDocDialog open={open} onOpenChange={setOpen} cases={cases} onSaved={() => { onChange(); setOpen(false) }} />
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(['all', ...STATUSES] as const).map((s) => (
            <Button
              key={s}
              variant={filter === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(s)}
              className="h-7 text-xs rounded-full px-3"
            >
              {s === 'all' ? t('comp.all', { n: counts.all }) : `${t(`dstatus.${s}`)} (${counts[s]})`}
            </Button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={lang === 'ar' ? 'بحث في المستندات والأطراف...' : 'Search documents...'}
            className="h-8 text-xs rounded-full pe-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => (
          <DocumentCard
            key={d.id}
            document={d}
            cases={cases}
            onUpdateStatus={updateStatus}
            onRefresh={onChange}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            {t('docs.empty')}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
