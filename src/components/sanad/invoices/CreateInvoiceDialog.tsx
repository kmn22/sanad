'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Plus, Clock, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { formatSAR, formatDate, formatDuration, type Client, type LegalCase, type TimeEntry } from '@/lib/sanad/types'
import { VAT_RATE, entryAmount } from '@/lib/sanad/billing-calc'
import { defaultDueDate } from './meta'

export function CreateInvoiceDialog({
  open,
  onOpenChange,
  clients,
  cases,
  timeEntries,
  initialSelectAll = false,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  clients: Client[]
  cases: LegalCase[]
  timeEntries: TimeEntry[]
  initialSelectAll?: boolean
  onSaved: () => void
}) {
  const { lang, t } = useLang()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [clientId, setClientId] = useState('')
  const [caseId, setCaseId] = useState('')
  const [dueDate, setDueDate] = useState<string>(defaultDueDate)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Auto-select when opened via "Bill Uninvoiced Hours" shortcut
  useEffect(() => {
    if (open && initialSelectAll && timeEntries.length > 0) {
      const allIds = new Set(timeEntries.map((e) => e.id))
      setSelected(allIds)
      const firstWithClient = timeEntries.find((e) => e.case?.clientId)
      if (firstWithClient?.case) {
        if (firstWithClient.case.clientId) setClientId(firstWithClient.case.clientId)
        if (firstWithClient.caseId) setCaseId(firstWithClient.caseId)
      }
    }
  }, [open, initialSelectAll, timeEntries])

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
        // Auto-detect client & case from time entry if not set
        const entry = timeEntries.find((e) => e.id === id)
        if (entry?.case) {
          if (!clientId && entry.case.clientId) setClientId(entry.case.clientId)
          if (!caseId && entry.caseId) setCaseId(entry.caseId)
        }
      }
      return next
    })
  }

  const selectAll = () => {
    const allIds = new Set(timeEntries.map((e) => e.id))
    setSelected(allIds)
    const firstWithClient = timeEntries.find((e) => e.case?.clientId)
    if (firstWithClient?.case) {
      if (!clientId && firstWithClient.case.clientId) setClientId(firstWithClient.case.clientId)
      if (!caseId && firstWithClient.caseId) setCaseId(firstWithClient.caseId)
    }
  }

  const clearAll = () => {
    setSelected(new Set())
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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || (lang === 'ar' ? 'فشل إنشاء الفاتورة' : 'Failed to create invoice'))
      }
      toast.success(t('invoices.created'))
      reset()
      onSaved()
    } catch (err: any) {
      toast.error(err.message || (lang === 'ar' ? 'حدث خطأ أثناء إنشاء الفاتورة' : 'Failed to create invoice'))
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
            <div className="flex items-center justify-between">
              <Label className="text-xs">{t('invoices.select_time')}</Label>
              {timeEntries.length > 0 && (
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[11px] text-primary hover:text-primary px-2"
                    onClick={selectAll}
                  >
                    {lang === 'ar' ? 'تحديد الكل' : 'Select All'}
                  </Button>
                  {selected.size > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[11px] text-muted-foreground px-2"
                      onClick={clearAll}
                    >
                      {lang === 'ar' ? 'إلغاء التحديد' : 'Clear'}
                    </Button>
                  )}
                </div>
              )}
            </div>

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
