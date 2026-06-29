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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { CalendarClock, Plus, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import {
  COMPLIANCE_COLORS,
  daysUntil,
  formatDate,
  getDaysUntilBg,
  getDaysUntilColor,
  type ComplianceItem,
} from '@/lib/sanad/types'

interface Props {
  items: ComplianceItem[]
  onChange: () => void
}

const CATEGORIES = ['ikama', 'cr', 'contract', 'license', 'tax', 'gosi']

export function ComplianceView({ items, onChange }: Props) {
  const { lang, t } = useLang()
  const [filter, setFilter] = useState<string>('all')
  const [open, setOpen] = useState(false)

  const sorted = [...items].sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate))
  const filtered = filter === 'all' ? sorted : sorted.filter((c) => c.category === filter)

  const expired = sorted.filter((c) => daysUntil(c.expiryDate) < 0)
  const expiring30 = sorted.filter((c) => { const d = daysUntil(c.expiryDate); return d >= 0 && d <= 30 })
  const expiring90 = sorted.filter((c) => { const d = daysUntil(c.expiryDate); return d > 30 && d <= 90 })
  const safe = sorted.filter((c) => daysUntil(c.expiryDate) > 90)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t('comp.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('comp.subtitle')}</p>
        </div>
        <AddComplianceDialog open={open} onOpenChange={setOpen} onSaved={() => { onChange(); setOpen(false) }} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label={t('comp.expired')} value={expired.length} tone="rose" icon={<AlertCircle className="h-4 w-4" />} />
        <SummaryTile label={t('comp.30days')} value={expiring30.length} tone="amber" icon={<CalendarClock className="h-4 w-4" />} />
        <SummaryTile label={t('comp.90days')} value={expiring90.length} tone="orange" icon={<CalendarClock className="h-4 w-4" />} />
        <SummaryTile label={t('comp.safe')} value={safe.length} tone="emerald" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">{t('comp.filter')}</span>
        <Button variant={filter === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setFilter('all')} className="h-7 text-xs">
          {t('comp.all', { n: sorted.length })}
        </Button>
        {CATEGORIES.map((key) => {
          const count = sorted.filter((c) => c.category === key).length
          if (count === 0) return null
          return (
            <Button key={key} variant={filter === key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(key)} className="h-7 text-xs">
              {t(`cat.${key}`)} ({count})
            </Button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <ComplianceCard key={item.id} item={item} onChange={onChange} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">{t('comp.empty')}</CardContent>
        </Card>
      )}
    </div>
  )
}

function SummaryTile({
  label,
  value,
  tone,
  icon,
}: {
  label: string
  value: number
  tone: 'rose' | 'amber' | 'orange' | 'emerald'
  icon: React.ReactNode
}) {
  const toneClasses: Record<string, string> = {
    rose: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300',
    amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300',
    orange: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900 text-orange-700 dark:text-orange-300',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300',
  }
  return (
    <div className={`rounded-lg border p-3 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs">{label}</span>
        {icon}
      </div>
      <p className="text-2xl font-semibold">{value.toLocaleString('ar-EG')}</p>
    </div>
  )
}

function ComplianceCard({ item, onChange }: { item: ComplianceItem; onChange: () => void }) {
  const { lang, t } = useLang()
  const days = daysUntil(item.expiryDate)
  const pct = Math.max(3, Math.min(100, (Math.max(0, days) / 90) * 100))

  const renew = async () => {
    const newExpiry = new Date(item.expiryDate)
    newExpiry.setFullYear(newExpiry.getFullYear() + 1)
    try {
      const res = await fetch(`/api/compliance/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueDate: new Date().toISOString(),
          expiryDate: newExpiry.toISOString(),
          status: 'active',
        }),
      })
      if (!res.ok) throw new Error('Failed to renew')
      toast.success(t('comp.renewed'))
      onChange()
    } catch {
      toast.error(t('common.failed'))
    }
  }

  return (
    <Card className={`border-s-4 ${getDaysUntilBg(days, item.notifyDays)}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{item.entityName}</p>
            <p className="text-xs text-muted-foreground">{item.title}</p>
          </div>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${COMPLIANCE_COLORS[item.category] || 'bg-muted'}`}>
            {t(`cat.${item.category}`)}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t('comp.expiry')}</span>
            <span className="text-xs">{formatDate(item.expiryDate, lang)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t('comp.time_remaining')}</span>
            <span className={`text-sm font-semibold ${getDaysUntilColor(days, item.notifyDays)}`}>
              {days < 0 ? t('comp.days_overdue', { n: Math.abs(days) }) : t('comp.days_left', { n: days })}
            </span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>

        {item.notes && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">{item.notes}</p>
        )}

        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={renew}>
            {t('comp.mark_renewed')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function AddComplianceDialog({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: () => void
}) {
  const { t } = useLang()
  const [form, setForm] = useState({
    title: '',
    category: 'ikama',
    entityName: '',
    issueDate: '',
    expiryDate: '',
    notes: '',
    notifyDays: 30,
  })

  const submit = async () => {
    if (!form.title || !form.entityName || !form.expiryDate) {
      toast.error(t('comp.req_fields'))
      return
    }
    try {
      const res = await fetch('/api/compliance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          issueDate: form.issueDate ? new Date(form.issueDate).toISOString() : new Date().toISOString(),
          expiryDate: new Date(form.expiryDate).toISOString(),
          status: 'active',
        }),
      })
      if (!res.ok) throw new Error('Failed to create compliance item')
      toast.success(t('comp.renewed'))
      setForm({ title: '', category: 'ikama', entityName: '', issueDate: '', expiryDate: '', notes: '', notifyDays: 30 })
      onSaved()
    } catch {
      toast.error(t('common.failed'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mx-1.5 h-4 w-4" /> {t('comp.add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('comp.add_item')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="c-title">{t('comp.f_title')}</Label>
            <Input id="c-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('comp.f_title_ph')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-cat">{t('comp.f_category')}</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger id="c-cat"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((k) => <SelectItem key={k} value={k}>{t(`cat.${k}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-entity">{t('comp.f_entity')}</Label>
              <Input id="c-entity" value={form.entityName} onChange={(e) => setForm({ ...form, entityName: e.target.value })} placeholder={t('comp.f_entity_ph')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-issue">{t('comp.f_issue')}</Label>
              <Input id="c-issue" type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-expiry">{t('comp.f_expiry')}</Label>
              <Input id="c-expiry" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-notes">{t('comp.f_notes')}</Label>
            <Textarea id="c-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={t('comp.f_notes_ph')} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('comp.cancel')}</Button></DialogClose>
          <Button onClick={submit}>{t('comp.save')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
