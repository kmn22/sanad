'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, ListTodo, Sparkles, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import {
  PRIORITY_COLORS,
  daysUntil,
  formatDate,
  type Task,
  type LegalCase,
} from '@/lib/sanad/types'

interface Props {
  tasks: Task[]
  cases: LegalCase[]
  onChange: () => void
}

const PRIORITIES = ['low', 'normal', 'high', 'urgent']

export function TasksView({ tasks, cases, onChange }: Props) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'auto'>('all')

  const now = new Date()
  const sorted = [...tasks].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1
    if (a.status !== 'done' && b.status === 'done') return -1
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const filtered = sorted.filter((task) => {
    if (task.status === 'done') return filter === 'all'
    if (filter === 'today') return task.dueDate && new Date(task.dueDate).toDateString() === now.toDateString()
    if (filter === 'overdue') return task.dueDate && new Date(task.dueDate) < now
    if (filter === 'auto') return task.autoGen
    return true
  })

  const counts = {
    all: sorted.filter(t => t.status !== 'done').length,
    today: sorted.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate).toDateString() === now.toDateString()).length,
    overdue: sorted.filter(t => t.status !== 'done' && t.dueDate && new Date(t.dueDate) < now).length,
    auto: sorted.filter(t => t.status !== 'done' && t.autoGen).length,
  }

  const toggleDone = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done'
    await fetch(`/api/tasks/${task.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    toast.success(newStatus === 'done' ? t('tasks.completed') : t('tasks.reopened'))
    onChange()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t('tasks.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('tasks.subtitle')}</p>
        </div>
        <AddTaskDialog open={open} onOpenChange={setOpen} cases={cases} onSaved={() => { onChange(); setOpen(false) }} />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {([
          ['all', t('tasks.all', { n: counts.all })],
          ['today', t('tasks.today', { n: counts.today })],
          ['overdue', t('tasks.overdue', { n: counts.overdue })],
          ['auto', t('tasks.auto', { n: counts.auto })],
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
              {filtered.map((task) => {
                const days = task.dueDate ? daysUntil(task.dueDate) : null
                const overdue = days !== null && days < 0 && task.status !== 'done'
                const done = task.status === 'done'
                const c = cases.find((c) => c.id === task.caseId)
                return (
                  <li key={task.id} className="flex items-start gap-3 p-3 hover:bg-muted/40 transition-colors">
                    <Checkbox checked={done} onCheckedChange={() => toggleDone(task)} className="mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium ${done ? 'line-through text-muted-foreground' : ''}`}>{task.title}</p>
                        {task.autoGen && (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                            <Sparkles className="h-2.5 w-2.5 mx-0.5" />{t('tasks.auto_badge')}
                          </Badge>
                        )}
                        {c && <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted">{c.title}</Badge>}
                      </div>
                      {task.description && (
                        <p className={`text-xs text-muted-foreground mt-0.5 ${done ? 'line-through' : ''}`}>{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[task.priority]?.color}`}>
                          {t(`prio.${task.priority}`)}
                        </Badge>
                        {task.relatedDoc && (
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5" />
                            {t('tasks.from')} {task.relatedDoc}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className={`text-[10px] flex items-center gap-1 ${overdue ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-muted-foreground'}`}>
                            <Calendar className="h-2.5 w-2.5" />
                            {formatDate(task.dueDate, lang)}
                            {overdue && ` (${t('dash.d_overdue', { n: Math.abs(days!) })})`}
                            {!overdue && days! <= 3 && ` (${t('dash.d_left', { n: days ?? 0 })})`}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
              {filtered.length === 0 && (
                <li className="p-12 text-center text-sm text-muted-foreground">
                  <ListTodo className="h-8 w-8 mx-auto mb-2 opacity-40" />
                  {t('tasks.empty')}
                </li>
              )}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function AddTaskDialog({
  open,
  onOpenChange,
  cases,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  cases: LegalCase[]
  onSaved: () => void
}) {
  const { t } = useLang()
  const [form, setForm] = useState({ title: '', description: '', priority: 'normal', dueDate: '', caseId: '' })

  const submit = async () => {
    if (!form.title) {
      toast.error(t('tasks.title'))
      return
    }
    await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        caseId: form.caseId || null,
        status: 'todo',
        autoGen: false,
      }),
    })
    toast.success(t('tasks.added'))
    setForm({ title: '', description: '', priority: 'normal', dueDate: '', caseId: '' })
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mx-1.5 h-4 w-4" /> {t('tasks.new')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('tasks.new')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="t-title">{t('tasks.f_title')}</Label>
            <Input id="t-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('tasks.f_title_ph')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-desc">{t('tasks.f_desc')}</Label>
            <Input id="t-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="t-prio">{t('tasks.f_priority')}</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger id="t-prio"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{t(`prio.${p}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="t-due">{t('tasks.f_due')}</Label>
              <Input id="t-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-case">{t('tasks.f_case')}</Label>
            <Select value={form.caseId} onValueChange={(v) => setForm({ ...form, caseId: v })}>
              <SelectTrigger id="t-case"><SelectValue placeholder={t('tasks.none')} /></SelectTrigger>
              <SelectContent>
                {cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('comp.cancel')}</Button></DialogClose>
          <Button onClick={submit}>{t('tasks.create')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
