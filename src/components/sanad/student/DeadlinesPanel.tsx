'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, ListTodo, Calendar, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import {
  PRIORITY_COLORS,
  daysUntil,
  formatDate,
  type AcademicDeadline,
  type Course,
} from '@/lib/sanad/types'

interface Props {
  deadlines: (AcademicDeadline & { course: Course | null })[]
  courses: Course[]
  onChange: () => void
}

const TYPES = ['assignment', 'exam', 'mooting', 'presentation', 'registration']
const PRIORITIES = ['low', 'normal', 'high', 'urgent']

export function DeadlinesPanel({ deadlines, courses, onChange }: Props) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'week' | 'month' | 'overdue'>('all')

  const now = new Date()
  const sorted = [...deadlines].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const filtered = sorted.filter((d) => {
    if (d.status === 'done') return filter === 'all'
    const days = daysUntil(d.dueDate)
    if (filter === 'overdue') return days < 0
    if (filter === 'week') return days >= 0 && days <= 7
    if (filter === 'month') return days >= 0 && days <= 30
    return true
  })

  const counts = {
    all: sorted.filter(d => d.status !== 'done').length,
    week: sorted.filter(d => d.status !== 'done' && daysUntil(d.dueDate) >= 0 && daysUntil(d.dueDate) <= 7).length,
    month: sorted.filter(d => d.status !== 'done' && daysUntil(d.dueDate) >= 0 && daysUntil(d.dueDate) <= 30).length,
    overdue: sorted.filter(d => d.status !== 'done' && daysUntil(d.dueDate) < 0).length,
  }

  const toggleDone = async (d: AcademicDeadline) => {
    const newStatus = d.status === 'done' ? 'todo' : 'done'
    try {
      const res = await fetch(`/api/deadlines/${d.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update deadline')
      toast.success(newStatus === 'done' ? t('deadlines.mark_done') : t('deadlines.mark_todo'))
      onChange()
    } catch {
      toast.error(t('common.failed'))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t('deadlines.subtitle')}</p>
        <AddDeadlineDialog open={open} onOpenChange={setOpen} courses={courses} onSaved={() => { onChange(); setOpen(false) }} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {([
          ['all', t('deadlines.all', { n: counts.all })],
          ['week', t('deadlines.week', { n: counts.week })],
          ['month', t('deadlines.month', { n: counts.month })],
          ['overdue', t('deadlines.overdue', { n: counts.overdue })],
        ] as const).map(([key, label]) => (
          <Button key={key} variant={filter === key ? 'default' : 'outline'} size="sm" onClick={() => setFilter(key)} className="h-7 text-xs">
            {label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-280px)] min-h-[400px] scroll-thin">
            <ul className="divide-y divide-border">
              {filtered.map((d) => {
                const days = daysUntil(d.dueDate)
                const overdue = days < 0 && d.status !== 'done'
                const done = d.status === 'done'
                return (
                  <li key={d.id} className="flex items-start gap-3 p-3 hover:bg-muted/40 transition-colors">
                    <Checkbox checked={done} onCheckedChange={() => toggleDone(d)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium ${done ? 'line-through text-muted-foreground' : ''}`}>{d.title}</p>
                        {d.course && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0" style={{ background: `${d.course.color}15`, color: d.course.color, borderColor: `${d.course.color}40` }}>
                            {d.course.title}
                          </Badge>
                        )}
                      </div>
                      {d.notes && <p className={`text-xs text-muted-foreground mt-0.5 ${done ? 'line-through' : ''}`}>{d.notes}</p>}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
                          {t(`dtype.${d.type}`)}
                        </Badge>
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[d.priority]?.color}`}>
                          {t(`prio.${d.priority}`)}
                        </Badge>
                        {d.weight && (
                          <span className="text-[10px] text-muted-foreground">{t('deadlines.weight', { n: d.weight })}</span>
                        )}
                        <span className={`text-[10px] flex items-center gap-1 ${overdue ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-muted-foreground'}`}>
                          <Calendar className="h-2.5 w-2.5" />
                          {formatDate(d.dueDate, lang)}
                          {overdue && ` (${t('dash.d_overdue', { n: Math.abs(days) })})`}
                          {!overdue && !done && days <= 7 && ` (${t('dash.d_left', { n: days })})`}
                        </span>
                      </div>
                    </div>
                  </li>
                )
              })}
              {filtered.length === 0 && (
                <li className="p-12 text-center text-sm text-muted-foreground">
                  <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  {t('deadlines.empty')}
                </li>
              )}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function AddDeadlineDialog({ open, onOpenChange, courses, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; courses: Course[]; onSaved: () => void }) {
  const { t } = useLang()
  const [form, setForm] = useState({ title: '', type: 'assignment', courseId: '', dueDate: '', weight: '', priority: 'normal', notes: '' })

  const submit = async () => {
    if (!form.title || !form.dueDate) {
      toast.error(t('deadlines.f_title'))
      return
    }
    try {
      const res = await fetch('/api/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          courseId: form.courseId || null,
          dueDate: new Date(form.dueDate).toISOString(),
          weight: form.weight ? parseFloat(form.weight) : null,
          status: 'todo',
        }),
      })
      if (!res.ok) throw new Error('Failed to create deadline')
      toast.success(t('deadlines.create'))
      setForm({ title: '', type: 'assignment', courseId: '', dueDate: '', weight: '', priority: 'normal', notes: '' })
      onSaved()
    } catch {
      toast.error(t('common.failed'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mx-1.5 h-4 w-4" /> {t('deadlines.add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('deadlines.add')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="d-title">{t('deadlines.f_title')}</Label>
            <Input id="d-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: تسليم بحث العقود" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-type">{t('deadlines.f_type')}</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="d-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPES.map((tp) => <SelectItem key={tp} value={tp}>{t(`dtype.${tp}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-course">{t('deadlines.f_course')}</Label>
              <Select value={form.courseId} onValueChange={(v) => setForm({ ...form, courseId: v })}>
                <SelectTrigger id="d-course"><SelectValue placeholder={t('deadlines.f_none')} /></SelectTrigger>
                <SelectContent>
                  {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-due">{t('deadlines.f_due')}</Label>
              <Input id="d-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-weight">{t('deadlines.f_weight')}</Label>
              <Input id="d-weight" type="number" value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="25" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-prio">{t('deadlines.f_priority')}</Label>
            <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
              <SelectTrigger id="d-prio"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{t(`prio.${p}`)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-notes">{t('deadlines.f_notes')}</Label>
            <Textarea id="d-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('comp.cancel')}</Button></DialogClose>
          <Button onClick={submit}>{t('deadlines.create')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
