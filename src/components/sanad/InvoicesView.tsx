'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { ViewHeader, EmptyState, FilterPills, DeleteConfirmDialog } from '@/components/sanad/shared'
import { apiRequest, apiDelete } from '@/lib/api-client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Plus,
  FileText,
  DollarSign,
  Clock,
  CheckCircle2,
  Trash2,
  MoreVertical,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import {
  formatSAR,
  formatDate,
  formatDuration,
  daysUntil,
  type Invoice,
  type Client,
  type LegalCase,
  type TimeEntry,
} from '@/lib/sanad/types'

interface Props {
  invoices: Invoice[]
  clients: Client[]
  cases: LegalCase[]
  timeEntries: TimeEntry[]
  stats: {
    outstandingInvoices: number
    outstandingSAR: number
    paidThisMonthSAR: number
    uninvoicedSec: number
    uninvoicedSAR: number
  }
  onChange: () => void
}

const STATUS_FILTERS = ['all', 'draft', 'sent', 'paid', 'overdue'] as const

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  overdue: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  cancelled: 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-200',
}

const VAT_RATE = 0.15

function entryAmount(e: TimeEntry): number {
  if (!e.hourlyRate) return 0
  return (e.hourlyRate * e.durationSec) / 3600
}

function defaultDueDate(): string {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toISOString().slice(0, 10)
}

export function InvoicesView({ invoices, clients, cases, timeEntries, stats, onChange }: Props) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const num = (n: number) => (lang === 'ar' ? n.toLocaleString('ar-EG') : n.toString())

  const sorted = useMemo(
    () =>
      [...invoices].sort(
        (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
      ),
    [invoices]
  )

  const filtered = filter === 'all' ? sorted : sorted.filter((i) => i.status === filter)

  const counts: Record<string, number> = { all: sorted.length }
  STATUS_FILTERS.forEach((s) => {
    if (s !== 'all') counts[s] = sorted.filter((i) => i.status === s).length
  })

  const patchStatus = async (inv: Invoice, status: 'sent' | 'paid') => {
    try {
      await apiRequest({
        url: `/api/invoices/${inv.id}`,
        method: 'PATCH',
        body: { status },
        successMessage: status === 'paid' ? t('invoices.marked_paid') : t('invoices.marked_sent'),
      })
      onChange()
    } catch {
      toast.error(t('invoices.delete'))
    }
  }

  const handleDelete = (inv: Invoice) => {
    apiDelete(`/api/invoices/${inv.id}`, {
      successMessage: t('invoices.deleted'),
      errorMessage: t('invoices.delete'),
      onChange,
    })
  }

  return (
    <div className="space-y-6">
      <ViewHeader
        title={t('invoices.title')}
        subtitle={t('invoices.subtitle')}
        action={
          <CreateInvoiceDialog
            open={open}
            onOpenChange={setOpen}
            clients={clients}
            cases={cases}
            timeEntries={timeEntries}
            onSaved={() => {
              onChange()
              setOpen(false)
            }}
          />
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label={t('invoices.outstanding')}
          value={num(stats.outstandingInvoices)}
          sub={formatSAR(stats.outstandingSAR, lang)}
          tone="amber"
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatTile
          label={t('invoices.paid_month')}
          value={formatSAR(stats.paidThisMonthSAR, lang)}
          tone="emerald"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />
        <StatTile
          label={t('invoices.uninvoiced')}
          value={formatSAR(stats.uninvoicedSAR, lang)}
          sub={formatDuration(stats.uninvoicedSec, lang)}
          tone="rose"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatTile
          label={t('invoices.title')}
          value={num(sorted.length)}
          tone="slate"
          icon={<FileText className="h-4 w-4" />}
        />
      </div>

      {/* Filter pills */}
      <FilterPills
        filters={STATUS_FILTERS.map((s) => ({
          key: s,
          label: s === 'all'
            ? t('comp.all', { n: counts.all })
            : `${t(`istatus.${s}`)} (${num(counts[s])})`,
        }))}
        active={filter}
        onChange={setFilter}
      />

      {/* Empty state */}
      {filtered.length === 0 ? (
        <EmptyState icon={FileText} message={t('invoices.empty')} />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="ps-4">{t('invoices.number')}</TableHead>
                    <TableHead>{t('invoices.client')}</TableHead>
                    <TableHead>{t('invoices.case')}</TableHead>
                    <TableHead>{t('invoices.issue_date')}</TableHead>
                    <TableHead>{t('invoices.due_date')}</TableHead>
                    <TableHead className="text-end">{t('invoices.total')}</TableHead>
                    <TableHead className="text-end">{t('invoices.balance')}</TableHead>
                    <TableHead className="pe-3 w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((inv) => (
                    <InvoiceRow
                      key={inv.id}
                      inv={inv}
                      onPatch={patchStatus}
                      onDelete={handleDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Mobile card grid */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filtered.map((inv) => (
              <InvoiceCard
                key={inv.id}
                inv={inv}
                onPatch={patchStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function StatTile({
  label,
  value,
  sub,
  tone,
  icon,
}: {
  label: string
  value: string | number
  sub?: string
  tone: 'amber' | 'emerald' | 'rose' | 'slate'
  icon: React.ReactNode
}) {
  const toneClasses: Record<string, string> = {
    amber: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-300',
    emerald:
      'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300',
    rose: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300',
    slate:
      'bg-slate-50 dark:bg-slate-950/30 border-slate-200 dark:border-slate-900 text-slate-700 dark:text-slate-300',
  }
  return (
    <div className={`rounded-lg border p-3 ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs">{label}</span>
        {icon}
      </div>
      <p className="text-xl font-semibold tracking-tight">{value}</p>
      {sub && <p className="text-[11px] opacity-80 mt-0.5">{sub}</p>}
    </div>
  )
}

function InvoiceRow({
  inv,
  onPatch,
  onDelete,
}: {
  inv: Invoice
  onPatch: (i: Invoice, s: 'sent' | 'paid') => void
  onDelete: (i: Invoice) => void
}) {
  const { lang, t } = useLang()
  const dueDays = inv.dueDate ? daysUntil(inv.dueDate) : null
  const balance = Math.max(0, inv.total - inv.paidAmount)
  const isPartial = inv.paidAmount > 0 && inv.paidAmount < inv.total
  const showCountdown =
    inv.dueDate && inv.status !== 'paid' && inv.status !== 'cancelled' && dueDays !== null

  return (
    <TableRow className="group">
      <TableCell className="ps-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-medium" dir="ltr">
            {inv.number}
          </span>
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[inv.status] ?? 'bg-muted'}`}
          >
            {t(`istatus.${inv.status}`)}
          </Badge>
        </div>
      </TableCell>
      <TableCell className="text-xs">
        <span className="truncate">{inv.client?.name ?? '—'}</span>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground max-w-[180px]">
        <span className="truncate block">{inv.case?.title ?? '—'}</span>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
        {formatDate(inv.issueDate, lang)}
      </TableCell>
      <TableCell className="text-xs whitespace-nowrap">
        {inv.dueDate ? (
          <div className="flex flex-col">
            <span className="text-muted-foreground">{formatDate(inv.dueDate, lang)}</span>
            {showCountdown && (
              <span
                className={`text-[10px] ${
                  dueDays! < 0
                    ? 'text-rose-600 dark:text-rose-400 font-medium'
                    : dueDays! <= 7
                      ? 'text-amber-600 dark:text-amber-400 font-medium'
                      : 'text-muted-foreground'
                }`}
              >
                {dueDays! < 0
                  ? t('invoices.overdue_by', { n: Math.abs(dueDays!) })
                  : t('invoices.due_in_days', { n: dueDays! })}
              </span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="text-end text-xs font-medium whitespace-nowrap">
        {formatSAR(inv.total, lang)}
      </TableCell>
      <TableCell className="text-end text-xs whitespace-nowrap">
        {isPartial ? (
          <span className="text-amber-600 dark:text-amber-400 font-medium">
            {formatSAR(balance, lang)}
          </span>
        ) : inv.status === 'paid' ? (
          <span className="text-emerald-600 dark:text-emerald-400">✓</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="pe-3">
        <InvoiceActions inv={inv} onPatch={onPatch} onDelete={onDelete} />
      </TableCell>
    </TableRow>
  )
}

function InvoiceCard({
  inv,
  onPatch,
  onDelete,
}: {
  inv: Invoice
  onPatch: (i: Invoice, s: 'sent' | 'paid') => void
  onDelete: (i: Invoice) => void
}) {
  const { lang, t } = useLang()
  const dueDays = inv.dueDate ? daysUntil(inv.dueDate) : null
  const balance = Math.max(0, inv.total - inv.paidAmount)
  const isPartial = inv.paidAmount > 0 && inv.paidAmount < inv.total
  const showCountdown =
    inv.dueDate && inv.status !== 'paid' && inv.status !== 'cancelled' && dueDays !== null

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardContent className="p-3 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-medium" dir="ltr">
                {inv.number}
              </span>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${STATUS_COLORS[inv.status] ?? 'bg-muted'}`}
              >
                {t(`istatus.${inv.status}`)}
              </Badge>
            </div>
            <p className="text-xs mt-1 truncate">{inv.client?.name ?? '—'}</p>
            {inv.case && (
              <p className="text-[11px] text-muted-foreground truncate">{inv.case.title}</p>
            )}
          </div>
          <InvoiceActions inv={inv} onPatch={onPatch} onDelete={onDelete} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-1">
          <div>
            <p className="text-[10px] text-muted-foreground">{t('invoices.issue_date')}</p>
            <p className="text-muted-foreground">{formatDate(inv.issueDate, lang)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">{t('invoices.due_date')}</p>
            {inv.dueDate ? (
              <div>
                <p className="text-muted-foreground">{formatDate(inv.dueDate, lang)}</p>
                {showCountdown && (
                  <p
                    className={`text-[10px] ${
                      dueDays! < 0
                        ? 'text-rose-600 dark:text-rose-400 font-medium'
                        : dueDays! <= 7
                          ? 'text-amber-600 dark:text-amber-400 font-medium'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {dueDays! < 0
                      ? t('invoices.overdue_by', { n: Math.abs(dueDays!) })
                      : t('invoices.due_in_days', { n: dueDays! })}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{t('invoices.total')}</span>
          <span className="font-semibold">{formatSAR(inv.total, lang)}</span>
        </div>
        {isPartial && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t('invoices.balance')}</span>
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {formatSAR(balance, lang)}
            </span>
          </div>
        )}
        {inv.paidAt && inv.status === 'paid' && (
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
            {t('invoices.paid_on', { date: formatDate(inv.paidAt, lang) })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function InvoiceActions({
  inv,
  onPatch,
  onDelete,
}: {
  inv: Invoice
  onPatch: (i: Invoice, s: 'sent' | 'paid') => void
  onDelete: (i: Invoice) => void
}) {
  const { t } = useLang()
  const canMarkSent = inv.status === 'draft'
  const canMarkPaid = inv.status === 'sent' || inv.status === 'overdue'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
          <MoreVertical className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {canMarkSent && (
          <DropdownMenuItem onClick={() => onPatch(inv, 'sent')}>
            <FileText className="h-3.5 w-3.5 mx-1" />
            {t('invoices.mark_sent')}
          </DropdownMenuItem>
        )}
        {canMarkPaid && (
          <DropdownMenuItem onClick={() => onPatch(inv, 'paid')}>
            <CheckCircle2 className="h-3.5 w-3.5 mx-1" />
            {t('invoices.mark_paid')}
          </DropdownMenuItem>
        )}
        {(canMarkSent || canMarkPaid) && <DropdownMenuSeparator />}
        <DeleteConfirmDialog
          trigger={
            <DropdownMenuItem
              className="text-rose-600 dark:text-rose-400 focus:text-rose-700 focus:bg-rose-50 dark:focus:bg-rose-950/40"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2 className="h-3.5 w-3.5 mx-1" />
              {t('invoices.delete')}
            </DropdownMenuItem>
          }
          title={t('invoices.delete')}
          description={t('invoices.delete_confirm')}
          cancelLabel={t('common.cancel')}
          confirmLabel={t('invoices.delete')}
          onConfirm={() => onDelete(inv)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CreateInvoiceDialog({
  open,
  onOpenChange,
  clients,
  cases,
  timeEntries,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  clients: Client[]
  cases: LegalCase[]
  timeEntries: TimeEntry[]
  onSaved: () => void
}) {
  const { lang, t } = useLang()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [clientId, setClientId] = useState('')
  const [caseId, setCaseId] = useState('')
  const [dueDate, setDueDate] = useState<string>(defaultDueDate)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedEntries = timeEntries.filter((e) => selected.has(e.id))
  const subtotal = selectedEntries.reduce((sum, e) => sum + entryAmount(e), 0)
  const vat = subtotal * VAT_RATE
  const total = subtotal + vat
  const totalHours = selectedEntries.reduce((sum, e) => sum + e.durationSec, 0)

  const num = (n: number) => (lang === 'ar' ? n.toLocaleString('ar-EG') : n.toString())

  const reset = () => {
    setSelected(new Set())
    setClientId('')
    setCaseId('')
    setDueDate(defaultDueDate())
    setNotes('')
  }

  const submit = async () => {
    if (selected.size === 0) {
      toast.error(t('invoices.select_time'))
      return
    }
    if (!clientId) {
      toast.error(t('invoices.select_client'))
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeEntryIds: Array.from(selected),
          clientId,
          caseId: caseId || undefined,
          dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
          notes: notes.trim() || undefined,
        }),
      })
      if (!res.ok) throw new Error('create failed')
      toast.success(t('invoices.created'))
      reset()
      onSaved()
    } catch {
      toast.error(t('invoices.created'))
    } finally {
      setSaving(false)
    }
  }

  const handleOpenChange = (v: boolean) => {
    onOpenChange(v)
    if (!v) {
      // Reset on close so next open is fresh
      setTimeout(reset, 200)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mx-1.5 h-4 w-4" /> {t('invoices.add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('invoices.add')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Time entries list */}
          <div className="space-y-2">
            <Label className="text-xs">{t('invoices.select_time')}</Label>

            {timeEntries.length === 0 ? (
              <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
                <Clock className="h-6 w-6 mx-auto mb-1.5 opacity-40" />
                {t('invoices.no_time_entries')}
              </div>
            ) : (
              <ScrollArea className="h-64 rounded-md border">
                <ul className="divide-y divide-border">
                  {timeEntries.map((e) => {
                    const amount = entryAmount(e)
                    const checked = selected.has(e.id)
                    return (
                      <li
                        key={e.id}
                        className={`flex items-start gap-3 p-2.5 cursor-pointer transition-colors ${
                          checked ? 'bg-primary/5' : 'hover:bg-muted/40'
                        }`}
                        onClick={() => toggle(e.id)}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggle(e.id)}
                          className="mt-0.5"
                          onClick={(e: React.MouseEvent) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {e.description || `(${e.sessionType})`}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5 whitespace-nowrap">
                              <Calendar className="h-2.5 w-2.5" />
                              {formatDate(e.date, lang)}
                            </span>
                            <span className="flex items-center gap-0.5 whitespace-nowrap">
                              <Clock className="h-2.5 w-2.5" />
                              {formatDuration(e.durationSec, lang)}
                            </span>
                            {e.case && (
                              <span className="truncate max-w-[160px]">{e.case.title}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-end shrink-0">
                          {e.hourlyRate ? (
                            <>
                              <p className="text-xs font-medium whitespace-nowrap">
                                {formatSAR(amount, lang)}
                              </p>
                              <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                                {t('invoices.rate')}: {formatSAR(e.hourlyRate, lang)}
                              </p>
                            </>
                          ) : (
                            <p className="text-[10px] text-muted-foreground">—</p>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </ScrollArea>
            )}
          </div>

          {/* Selected totals */}
          {selected.size > 0 && (
            <div className="rounded-md border bg-muted/30 p-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  {t('invoices.items')} ({num(selected.size)}) · {formatDuration(totalHours, lang)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('invoices.subtotal')}</span>
                <span>{formatSAR(subtotal, lang)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t('invoices.vat')}</span>
                <span>{formatSAR(vat, lang)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>{t('invoices.total')}</span>
                <span>{formatSAR(total, lang)}</span>
              </div>
            </div>
          )}

          {/* Client + case */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inv-client">
                {t('invoices.select_client')} <span className="text-rose-500">*</span>
              </Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger id="inv-client">
                  <SelectValue placeholder={t('invoices.select_client')} />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-case">{t('invoices.select_case')}</Label>
              <Select value={caseId} onValueChange={setCaseId}>
                <SelectTrigger id="inv-case">
                  <SelectValue placeholder={t('tasks.none')} />
                </SelectTrigger>
                <SelectContent>
                  {cases.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due date + notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inv-due">{t('invoices.due_date')}</Label>
              <Input
                id="inv-due"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-notes">{t('clients.f_notes')}</Label>
              <Textarea
                id="inv-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="—"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </DialogClose>
          <Button onClick={submit} disabled={saving || selected.size === 0 || !clientId}>
            {t('invoices.add')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
