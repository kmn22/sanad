'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  Plus,
  Phone,
  Mail,
  Users,
  MessageSquare,
  StickyNote,
  ArrowDownLeft,
  ArrowUpRight,
  Edit,
  Trash2,
  Clock,
  Calendar,
  User,
  Briefcase,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import {
  formatDate,
  type Communication,
  type Client,
  type LegalCase,
} from '@/lib/sanad/types'

interface Props {
  communications: Communication[]
  clients: Client[]
  cases: LegalCase[]
  onChange: () => void
}

// Sentinel value used inside Select components to represent "no selection".
// Radix Select items can't use empty-string values, so we swap at the boundary.
const NONE = '__none__'

const COMM_TYPES = ['call', 'email', 'meeting', 'sms', 'note'] as const
const COMM_FILTERS = ['all', 'call', 'email', 'meeting', 'sms', 'note'] as const
const DURABLE_TYPES = new Set(['call', 'meeting'])

type TypeMeta = { Icon: LucideIcon; color: string }

const TYPE_META: Record<string, TypeMeta> = {
  call: {
    Icon: Phone,
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  },
  email: {
    Icon: Mail,
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  },
  meeting: {
    Icon: Users,
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  },
  sms: {
    Icon: MessageSquare,
    color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  },
  note: {
    Icon: StickyNote,
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
  },
}

const DIRECTION_META: Record<string, { Icon: LucideIcon; color: string }> = {
  incoming: { Icon: ArrowDownLeft, color: 'text-emerald-600 dark:text-emerald-400' },
  outgoing: { Icon: ArrowUpRight, color: 'text-amber-600 dark:text-amber-400' },
}

function getTypeMeta(type: string): TypeMeta {
  return TYPE_META[type] ?? TYPE_META.note
}

function getDirectionMeta(direction: string) {
  return DIRECTION_META[direction] ?? DIRECTION_META.outgoing
}

/** Current local time as a value usable by <input type="datetime-local">. */
function nowLocalInput(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

/** Convert an ISO date string to a datetime-local input value. */
function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return nowLocalInput()
  const d = new Date(iso)
  if (isNaN(d.getTime())) return nowLocalInput()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

/** Format an ISO date as a short date+time string, locale-aware. */
function formatDateTime(dateStr: string, lang: 'ar' | 'en'): string {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return formatDate(dateStr, lang)
  const locale = lang === 'ar' ? 'ar-SA' : 'en-GB'
  return d.toLocaleString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function CommunicationsView({ communications, clients, cases, onChange }: Props) {
  const { lang, t } = useLang()
  const [filter, setFilter] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Communication | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const num = (n: number) => (lang === 'ar' ? n.toLocaleString('ar-EG') : n.toString())

  const sorted = useMemo(
    () =>
      [...communications].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [communications]
  )

  const counts: Record<string, number> = { all: sorted.length }
  COMM_FILTERS.forEach((f) => {
    if (f !== 'all') counts[f] = sorted.filter((c) => c.type === f).length
  })

  const filtered = filter === 'all' ? sorted : sorted.filter((c) => c.type === filter)

  const openAdd = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (c: Communication) => {
    setEditing(c)
    setDialogOpen(true)
  }

  const handleDialogChange = (v: boolean) => {
    setDialogOpen(v)
    if (!v) setEditing(null)
  }

  const handleSaved = () => {
    setDialogOpen(false)
    setEditing(null)
    onChange()
  }

  const handleDelete = async (c: Communication) => {
    try {
      const res = await fetch(`/api/communications/${c.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      toast.success(t('comms.deleted'))
      onChange()
    } catch {
      toast.error(t('comms.deleted'))
    }
  }

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t('comms.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('comms.subtitle')}</p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="mx-1.5 h-4 w-4" /> {t('comms.add')}
        </Button>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {COMM_FILTERS.map((f) => {
          const isAll = f === 'all'
          const meta = isAll ? null : getTypeMeta(f)
          const active = filter === f
          return (
            <Button
              key={f}
              variant={active ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="h-7 text-xs gap-1"
            >
              {meta && <meta.Icon className="h-3 w-3" />}
              <span>{isAll ? t('comms.filter_all') : t(`comms.types.${f}`)}</span>
              <span
                className={`text-[10px] tabular-nums ${
                  active ? 'opacity-80' : 'text-muted-foreground'
                }`}
              >
                ({num(counts[f] ?? 0)})
              </span>
            </Button>
          )
        })}
      </div>

      {/* Timeline / empty state */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
            {t('comms.empty')}
          </CardContent>
        </Card>
      ) : (
        <ol className="space-y-3">
          {filtered.map((c, i) => (
            <TimelineItem
              key={c.id}
              comm={c}
              isLast={i === filtered.length - 1}
              expanded={expanded.has(c.id)}
              onToggleExpand={() => toggleExpand(c.id)}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </ol>
      )}

      <CommunicationFormDialog
        key={editing?.id ?? 'new'}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        communication={editing}
        clients={clients}
        cases={cases}
        onSaved={handleSaved}
      />
    </div>
  )
}

function TimelineItem({
  comm,
  isLast,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
}: {
  comm: Communication
  isLast: boolean
  expanded: boolean
  onToggleExpand: () => void
  onEdit: (c: Communication) => void
  onDelete: (c: Communication) => void
}) {
  const { lang, t } = useLang()
  const typeMeta = getTypeMeta(comm.type)
  const dirMeta = getDirectionMeta(comm.direction)
  const TypeIcon = typeMeta.Icon
  const DirIcon = dirMeta.Icon
  const num = (n: number) => (lang === 'ar' ? n.toLocaleString('ar-EG') : n.toString())
  const showDuration = comm.durationMin != null && DURABLE_TYPES.has(comm.type)
  const canExpand = comm.body && comm.body.length > 80

  return (
    <li className="relative ps-10">
      {/* Vertical connector line between timeline dots */}
      {!isLast && (
        <span
          className="absolute start-4 top-10 h-[calc(100%-1rem)] w-px bg-border"
          aria-hidden
        />
      )}
      {/* Type icon dot */}
      <span
        className={`absolute start-0 top-2 h-8 w-8 rounded-full grid place-items-center ring-4 ring-background ${typeMeta.color}`}
      >
        <TypeIcon className="h-4 w-4" />
      </span>

      <Card className="hover:border-primary/40 transition-colors group">
        <CardContent className="p-3.5 space-y-2.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <DirIcon className={`h-3.5 w-3.5 shrink-0 ${dirMeta.color}`} />
                <p className="text-sm font-semibold truncate text-start">{comm.subject}</p>
              </div>
              <div className="flex items-center gap-2 mt-1 flex-wrap text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-0.5">
                  <TypeIcon className="h-3 w-3" />
                  {t(`comms.types.${comm.type}`)}
                </span>
                {comm.client && (
                  <span className="inline-flex items-center gap-0.5 min-w-0 max-w-[40%]">
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate">{comm.client.name}</span>
                  </span>
                )}
                {comm.case && (
                  <span className="inline-flex items-center gap-0.5 min-w-0 max-w-[45%]">
                    <Briefcase className="h-3 w-3 shrink-0" />
                    <span className="truncate">{comm.case.title}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Hover-revealed actions */}
            <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => onEdit(comm)}
                aria-label={t('common.edit')}
              >
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/40"
                    aria-label={t('common.delete')}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('common.delete')}</AlertDialogTitle>
                    <AlertDialogDescription>{t('comms.delete_confirm')}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-700 dark:hover:bg-rose-600"
                      onClick={() => onDelete(comm)}
                    >
                      {t('common.delete')}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          {/* Body (click to expand) */}
          {comm.body && (
            <div
              className={`text-xs text-muted-foreground whitespace-pre-wrap text-start ${
                expanded ? '' : 'line-clamp-2'
              } ${canExpand ? 'cursor-pointer' : ''}`}
              onClick={canExpand ? onToggleExpand : undefined}
            >
              {comm.body}
            </div>
          )}

          {/* Footer meta */}
          <Separator />
          <div className="flex items-center gap-3 flex-wrap text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Calendar className="h-3 w-3" />
              {formatDateTime(comm.date, lang)}
            </span>
            {showDuration && (
              <span className="inline-flex items-center gap-1 whitespace-nowrap">
                <Clock className="h-3 w-3" />
                {t('comms.duration_min', { n: num(comm.durationMin as number) })}
              </span>
            )}
            <span className="ms-auto inline-flex items-center gap-1 whitespace-nowrap">
              <DirIcon className={`h-3 w-3 ${dirMeta.color}`} />
              {comm.direction === 'incoming' ? t('comms.incoming') : t('comms.outgoing')}
            </span>
          </div>
        </CardContent>
      </Card>
    </li>
  )
}

interface FormState {
  type: string
  direction: string
  subject: string
  body: string
  clientId: string
  caseId: string
  date: string
  durationMin: string
}

function CommunicationFormDialog({
  open,
  onOpenChange,
  communication,
  clients,
  cases,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  communication?: Communication | null
  clients: Client[]
  cases: LegalCase[]
  onSaved: () => void
}) {
  const { t } = useLang()
  const isEdit = !!communication

  const [form, setForm] = useState<FormState>({
    type: communication?.type ?? 'call',
    direction: communication?.direction ?? 'outgoing',
    subject: communication?.subject ?? '',
    body: communication?.body ?? '',
    clientId: communication?.clientId ?? communication?.client?.id ?? '',
    caseId: communication?.caseId ?? communication?.case?.id ?? '',
    date: isoToLocalInput(communication?.date),
    durationMin:
      communication?.durationMin != null ? String(communication.durationMin) : '',
  })
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  // Cases available for the case selector — filtered to the selected client
  // (when one is picked) so users can't attach a comm to a case owned by a
  // different client.
  const filteredCases = form.clientId
    ? cases.filter((c) => c.clientId === form.clientId)
    : cases

  const handleClientChange = (v: string) => {
    const realV = v === NONE ? '' : v
    setForm((prev) => {
      const next = { ...prev, clientId: realV }
      // Drop the case if it no longer belongs to the new client.
      if (realV && prev.caseId) {
        const stillValid = cases.some(
          (c) => c.id === prev.caseId && c.clientId === realV
        )
        if (!stillValid) next.caseId = ''
      }
      // If we just cleared the client, keep the case as long as it has no
      // client restriction (clientId null on the case means "any").
      if (!realV && prev.caseId) {
        const stillValid = cases.some((c) => c.id === prev.caseId)
        if (!stillValid) next.caseId = ''
      }
      return next
    })
  }

  const handleCaseChange = (v: string) => {
    const realV = v === NONE ? '' : v
    set('caseId', realV)
  }

  const submit = async () => {
    if (!form.subject.trim()) {
      toast.error(t('comms.subject'))
      return
    }
    if (!form.body.trim()) {
      toast.error(t('comms.body'))
      return
    }
    setSaving(true)
    try {
      const isDurable = DURABLE_TYPES.has(form.type)
      const payload = {
        type: form.type,
        direction: form.direction,
        subject: form.subject.trim(),
        body: form.body.trim(),
        clientId: form.clientId || null,
        caseId: form.caseId || null,
        date: form.date ? new Date(form.date).toISOString() : new Date().toISOString(),
        durationMin:
          isDurable && form.durationMin !== ''
            ? Number(form.durationMin)
            : null,
      }
      const res = isEdit
        ? await fetch(`/api/communications/${communication!.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/communications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
      if (!res.ok) throw new Error('save failed')
      toast.success(isEdit ? t('comms.updated') : t('comms.added'))
      onSaved()
    } catch {
      toast.error(isEdit ? t('comms.updated') : t('comms.added'))
    } finally {
      setSaving(false)
    }
  }

  const isDurable = DURABLE_TYPES.has(form.type)
  const canSubmit = form.subject.trim().length > 0 && form.body.trim().length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('comms.edit') : t('comms.add')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Type + Direction */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-type">{t('comms.type')}</Label>
              <Select value={form.type} onValueChange={(v) => set('type', v)}>
                <SelectTrigger id="c-type" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMM_TYPES.map((tp) => {
                    const meta = getTypeMeta(tp)
                    return (
                      <SelectItem key={tp} value={tp}>
                        <meta.Icon className="h-3.5 w-3.5" />
                        {t(`comms.types.${tp}`)}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t('comms.direction')}</Label>
              <div className="flex gap-1.5 h-9 items-stretch">
                <Button
                  type="button"
                  variant={form.direction === 'incoming' ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 flex-1"
                  onClick={() => set('direction', 'incoming')}
                >
                  <ArrowDownLeft className="h-3.5 w-3.5" />
                  {t('comms.incoming')}
                </Button>
                <Button
                  type="button"
                  variant={form.direction === 'outgoing' ? 'default' : 'outline'}
                  size="sm"
                  className="h-9 flex-1"
                  onClick={() => set('direction', 'outgoing')}
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {t('comms.outgoing')}
                </Button>
              </div>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <Label htmlFor="c-subject">
              {t('comms.subject')} <span className="text-rose-500">*</span>
            </Label>
            <Input
              id="c-subject"
              value={form.subject}
              onChange={(e) => set('subject', e.target.value)}
              placeholder={t('comms.subject')}
              autoFocus
            />
          </div>

          {/* Body */}
          <div className="space-y-1.5">
            <Label htmlFor="c-body">
              {t('comms.body')} <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="c-body"
              value={form.body}
              onChange={(e) => set('body', e.target.value)}
              rows={3}
              placeholder={t('comms.body')}
            />
          </div>

          {/* Client + Case */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-client">{t('comms.client')}</Label>
              <Select
                value={form.clientId || NONE}
                onValueChange={handleClientChange}
              >
                <SelectTrigger id="c-client" className="w-full">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>—</SelectItem>
                  {clients.map((cl) => (
                    <SelectItem key={cl.id} value={cl.id}>
                      {cl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-case">{t('comms.case')}</Label>
              <Select
                value={form.caseId || NONE}
                onValueChange={handleCaseChange}
              >
                <SelectTrigger id="c-case" className="w-full">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>—</SelectItem>
                  {filteredCases.length === 0 ? (
                    <div className="px-2 py-1.5 text-xs text-muted-foreground italic">
                      —
                    </div>
                  ) : (
                    filteredCases.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-date">{t('comms.date')}</Label>
              <Input
                id="c-date"
                type="datetime-local"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                dir="ltr"
              />
            </div>
            {isDurable && (
              <div className="space-y-1.5">
                <Label htmlFor="c-duration">{t('comms.duration')}</Label>
                <Input
                  id="c-duration"
                  type="number"
                  min={0}
                  value={form.durationMin}
                  onChange={(e) => set('durationMin', e.target.value)}
                  placeholder="0"
                  dir="ltr"
                />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </DialogClose>
          <Button onClick={submit} disabled={saving || !canSubmit}>
            {isEdit ? t('common.save') : t('comms.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
