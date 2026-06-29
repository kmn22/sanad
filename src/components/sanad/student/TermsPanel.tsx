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
import { Plus, Library, Search, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { type LegalTerm } from '@/lib/sanad/types'

interface Props {
  terms: LegalTerm[]
  onChange: () => void
}

const CATEGORIES = ['general', 'civil', 'criminal', 'commercial', 'administrative', 'constitutional', 'procedural', 'family']
const MASTERY_LEVELS = ['learning', 'familiar', 'mastered']

export function TermsPanel({ terms, onChange }: Props) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<string>('all')

  const filtered = terms.filter((term) => {
    if (filter !== 'all' && term.category !== filter) return false
    if (query && !term.term.includes(query) && !term.definition.includes(query)) return false
    return true
  })

  // Sort by mastery: mastered first, then familiar, then learning
  const sorted = [...filtered].sort((a, b) => {
    const order = { mastered: 0, familiar: 1, learning: 2 }
    return (order[a.mastery as keyof typeof order] || 3) - (order[b.mastery as keyof typeof order] || 3)
  })

  const cycleMastery = async (term: LegalTerm) => {
    const next = term.mastery === 'learning' ? 'familiar' : term.mastery === 'familiar' ? 'mastered' : 'learning'
    try {
      const res = await fetch(`/api/terms/${term.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mastery: next }),
      })
      if (!res.ok) throw new Error('Failed to update mastery')
      onChange()
    } catch {
      toast.error(t('common.failed'))
    }
  }

  const masteryColor = (m: string) =>
    m === 'mastered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
    m === 'familiar' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
    'bg-muted text-muted-foreground'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t('terms.subtitle')}</p>
        <AddTermDialog open={open} onOpenChange={setOpen} onSaved={() => { onChange(); setOpen(false) }} />
      </div>

      <div className="flex gap-2 flex-col sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground start-3" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('terms.search')}
            className="ps-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('tcat.general')} — الكل</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{t(`tcat.${c}`)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-300px)] min-h-[400px] scroll-thin">
            {sorted.length === 0 ? (
              <div className="p-12 text-center text-sm text-muted-foreground">
                <Library className="h-8 w-8 mx-auto mb-2 opacity-40" />
                {query ? t('terms.no_results') : t('terms.empty')}
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {sorted.map((term) => (
                  <li key={term.id} className="p-4 hover:bg-muted/40 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <h4 className="text-base font-semibold">{term.term}</h4>
                      <button onClick={() => cycleMastery(term)}>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 cursor-pointer hover:opacity-80 ${masteryColor(term.mastery)}`}>
                          {t(`student.${term.mastery}`)}
                        </Badge>
                      </button>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed mb-2">{term.definition}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
                        {t(`tcat.${term.category}`)}
                      </Badge>
                      {term.origin && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-2.5 w-2.5" />
                          {term.origin}
                        </span>
                      )}
                    </div>
                    {term.example && (
                      <p className="text-xs text-muted-foreground italic mt-2 bg-muted/30 rounded px-2 py-1.5">
                        «{term.example}»
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function AddTermDialog({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void }) {
  const { t } = useLang()
  const [form, setForm] = useState({ term: '', definition: '', category: 'general', origin: '', example: '', mastery: 'learning' })

  const submit = async () => {
    if (!form.term || !form.definition) {
      toast.error(t('terms.f_term'))
      return
    }
    try {
      const res = await fetch('/api/terms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          origin: form.origin || null,
          example: form.example || null,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || 'فشل الإضافة')
        return
      }
      toast.success(t('terms.added'))
      setForm({ term: '', definition: '', category: 'general', origin: '', example: '', mastery: 'learning' })
      onSaved()
    } catch {
      toast.error('فشل الإضافة')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mx-1.5 h-4 w-4" /> {t('terms.add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('terms.add')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="t-term">{t('terms.f_term')}</Label>
            <Input id="t-term" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} placeholder="مثال: الالتزام" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-def">{t('terms.f_definition')}</Label>
            <Textarea id="t-def" value={form.definition} onChange={(e) => setForm({ ...form, definition: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-cat">{t('terms.f_category')}</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger id="t-cat"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{t(`tcat.${c}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-mastery">{t('terms.f_mastery')}</Label>
              <Select value={form.mastery} onValueChange={(v) => setForm({ ...form, mastery: v })}>
                <SelectTrigger id="t-mastery"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MASTERY_LEVELS.map((m) => <SelectItem key={m} value={m}>{t(`student.${m}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-origin">{t('terms.f_origin')}</Label>
            <Input id="t-origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} placeholder="مثال: القانون المدني السعودي" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-example">{t('terms.f_example')}</Label>
            <Textarea id="t-example" value={form.example} onChange={(e) => setForm({ ...form, example: e.target.value })} rows={2} placeholder="مثال على الاستخدام..." />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('comp.cancel')}</Button></DialogClose>
          <Button onClick={submit}>{t('terms.create')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
