'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, Scale, Gavel, Star, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { type CaseEntry } from '@/lib/sanad/types'

interface Props {
  cases: CaseEntry[]
  onChange: () => void
}

const SUBJECTS = ['civil', 'criminal', 'commercial', 'administrative', 'constitutional', 'procedural', 'family']

export function CasebookPanel({ cases, onChange }: Props) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const filtered = filter === 'all' ? cases : cases.filter((c) => c.subject === filter)
  const sorted = [...filtered].sort((a, b) => b.rating - a.rating)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <p className="text-sm font-semibold text-muted-foreground">{t('student.casebook_subtitle')}</p>
        <AddCaseDialog open={open} onOpenChange={setOpen} onSaved={() => { onChange(); setOpen(false) }} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')} className="h-7 text-xs">
          {t('tcat.general')} — الكل
        </Button>
        {SUBJECTS.map((s) => {
          const count = cases.filter((c) => c.subject === s).length
          if (count === 0) return null
          return (
            <Button key={s} variant={filter === s ? 'default' : 'outline'} size="sm" onClick={() => setFilter(s)} className="h-7 text-xs">
              {t(`tcat.${s}`)} ({count})
            </Button>
          )
        })}
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <Scale className="h-8 w-8 mx-auto mb-2 opacity-40" />
            {t('casebook.empty')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sorted.map((c) => (
            <CaseCard key={c.id} caseEntry={c} onChange={onChange} />
          ))}
        </div>
      )}
    </div>
  )
}

function CaseCard({ caseEntry, onChange }: { caseEntry: CaseEntry; onChange: () => void }) {
  const { t } = useLang()
  const [expanded, setExpanded] = useState(false)

  const cycleRating = async () => {
    const next = caseEntry.rating >= 5 ? 1 : caseEntry.rating + 1
    await fetch(`/api/casebook/${caseEntry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating: next }),
    })
    onChange()
  }

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold leading-tight">{caseEntry.caseName}</h4>
            {caseEntry.citation && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">{caseEntry.citation}</p>
            )}
          </div>
          <button onClick={cycleRating} className="shrink-0 flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-3 w-3 ${star <= caseEntry.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
              />
            ))}
          </button>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
            {t(`tcat.${caseEntry.subject}`)}
          </Badge>
          {caseEntry.court && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              <Gavel className="h-2.5 w-2.5 me-1" />
              {caseEntry.court}
            </Badge>
          )}
        </div>

        <div className="bg-primary/5 border-s-2 border-primary rounded px-3 py-2">
          <p className="text-[10px] text-muted-foreground mb-1">{t('casebook.f_principle')}</p>
          <p className="text-xs font-medium leading-relaxed">{caseEntry.principle}</p>
        </div>

        {expanded && caseEntry.summary && (
          <div className="space-y-2 pt-1">
            <div>
              <p className="text-[10px] text-muted-foreground mb-0.5">{t('casebook.f_summary')}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{caseEntry.summary}</p>
            </div>
            {caseEntry.significance && (
              <div>
                <p className="text-[10px] text-muted-foreground mb-0.5">{t('casebook.f_significance')}</p>
                <p className="text-xs text-muted-foreground leading-relaxed italic">{caseEntry.significance}</p>
              </div>
            )}
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[11px] text-muted-foreground p-0"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'إخفاء التفاصيل' : 'عرض التفاصيل'}
        </Button>
      </CardContent>
    </Card>
  )
}

function AddCaseDialog({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void }) {
  const { t } = useLang()
  const [form, setForm] = useState({
    caseName: '',
    citation: '',
    court: '',
    principle: '',
    subject: 'civil',
    summary: '',
    significance: '',
    rating: 3,
  })

  const submit = async () => {
    if (!form.caseName || !form.principle) {
      toast.error(t('casebook.f_name'))
      return
    }
    await fetch('/api/casebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        citation: form.citation || null,
        court: form.court || null,
        summary: form.summary || null,
        significance: form.significance || null,
      }),
    })
    toast.success(t('casebook.added'))
    setForm({ caseName: '', citation: '', court: '', principle: '', subject: 'civil', summary: '', significance: '', rating: 3 })
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mx-1.5 h-4 w-4" /> {t('casebook.add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('casebook.add')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="cb-name">{t('casebook.f_name')}</Label>
            <Input id="cb-name" value={form.caseName} onChange={(e) => setForm({ ...form, caseName: e.target.value })} placeholder="مثال: قضية الدوسري ضد شركة الأمل" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cb-cite">{t('casebook.f_citation')}</Label>
              <Input id="cb-cite" value={form.citation} onChange={(e) => setForm({ ...form, citation: e.target.value })} placeholder="1442/غ/1234" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cb-court">{t('casebook.f_court')}</Label>
              <Input id="cb-court" value={form.court} onChange={(e) => setForm({ ...form, court: e.target.value })} placeholder="محكمة الاستئناف بالرياض" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cb-subject">{t('casebook.f_subject')}</Label>
              <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                <SelectTrigger id="cb-subject"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{t(`tcat.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cb-rating">{t('casebook.f_rating')}</Label>
              <Select value={String(form.rating)} onValueChange={(v) => setForm({ ...form, rating: parseInt(v) })}>
                <SelectTrigger id="cb-rating"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n} نجوم</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cb-principle">{t('casebook.f_principle')}</Label>
            <Textarea id="cb-principle" value={form.principle} onChange={(e) => setForm({ ...form, principle: e.target.value })} rows={2} placeholder="المبدأ القانوني الذي تأسس في القضية" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cb-summary">{t('casebook.f_summary')}</Label>
            <Textarea id="cb-summary" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} rows={3} placeholder="ملخص الوقائع والحكم" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cb-sign">{t('casebook.f_significance')}</Label>
            <Textarea id="cb-sign" value={form.significance} onChange={(e) => setForm({ ...form, significance: e.target.value })} rows={2} placeholder="لماذا تهم هذه القضية؟" />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('comp.cancel')}</Button></DialogClose>
          <Button onClick={submit}>{t('casebook.create')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
