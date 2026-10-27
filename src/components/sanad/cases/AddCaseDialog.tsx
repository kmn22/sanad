'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { type LegalCase, type Client } from '@/lib/sanad/types'
import { PRIORITIES } from './constants'
import { STAGES } from './constants'
import { CASE_TYPES } from './constants'

export function AddCaseDialog({
  open,
  onOpenChange,
  onSaved,
  clients = [],
  editingCase,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onSaved: () => void
  clients?: Client[]
  editingCase?: LegalCase | null
}) {
  const { lang, t } = useLang()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: editingCase?.title || '',
    clientId: editingCase?.clientId || '',
    clientName: editingCase?.clientName || '',
    caseType: editingCase?.caseType || 'contract',
    stage: editingCase?.stage || 'drafting',
    priority: editingCase?.priority || 'normal',
    dueDate: editingCase?.dueDate ? new Date(editingCase.dueDate).toISOString().slice(0, 10) : '',
    hearingDate: editingCase?.hearingDate ? new Date(editingCase.hearingDate).toISOString().slice(0, 10) : '',
    value: editingCase?.value?.toString() || '',
    caseNumber: editingCase?.caseNumber || '',
    court: editingCase?.court || '',
    opposingParty: editingCase?.opposingParty || '',
    notes: editingCase?.notes || '',
    confidential: editingCase?.confidential ?? false,
  })

  const isEdit = !!editingCase

  const submit = async () => {
    if (saving) return
    setError('')
    if (!form.title.trim() || (!form.clientId && !form.clientName.trim())) {
      setError(t('cases.req_fields'))
      return
    }
    const payload = {
      ...form,
      clientId: form.clientId || null,
      clientName: form.clientName || (clients.find((c) => c.id === form.clientId)?.name || ''),
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      hearingDate: form.hearingDate ? new Date(form.hearingDate).toISOString() : null,
      value: form.value ? parseFloat(form.value) : null,
    }

    setSaving(true)
    try {
      const response = await fetch(editingCase ? `/api/cases/${editingCase.id}` : '/api/cases', {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || t('common.failed'))
      toast.success(isEdit ? t('common.updated') : t('cases.added'))
      onSaved()
    } catch (error) {
      setError(error instanceof Error ? error.message : t('common.failed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {!isEdit && (
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="mx-1.5 h-4 w-4" /> {t('cases.new')}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('common.edit') : t('cases.new')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="case-title">{t('cases.f_title')}</Label>
            <Input id="case-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="case-client">{t('cases.f_client')}</Label>
              {clients.length > 0 ? (
                <Select
                  value={form.clientId}
                  onValueChange={(v) => {
                    const c = clients.find((x) => x.id === v)
                    setForm({ ...form, clientId: v, clientName: c?.name || '' })
                  }}
                >
                  <SelectTrigger id="case-client"><SelectValue placeholder={t('deadlines.f_none')} /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : (
                <Input id="case-client" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value, clientId: '' })} />
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="case-type">{t('cases.f_type')}</Label>
              <Select value={form.caseType} onValueChange={(v) => setForm({ ...form, caseType: v })}>
                <SelectTrigger id="case-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CASE_TYPES.map((ct) => <SelectItem key={ct} value={ct}>{t(`ctype.${ct}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="case-stage">{t('cases.f_stage')}</Label>
              <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                <SelectTrigger id="case-stage"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => <SelectItem key={s} value={s}>{t(`stage.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="case-prio">{t('cases.f_priority')}</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger id="case-prio"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => <SelectItem key={p} value={p}>{t(`prio.${p}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="case-due">{t('cases.f_due')}</Label>
              <Input id="case-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="case-hearing">{t('case.hearing_date')}</Label>
              <Input id="case-hearing" type="date" value={form.hearingDate} onChange={(e) => setForm({ ...form, hearingDate: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="case-court">{t('case.court')}</Label>
              <Input id="case-court" value={form.court} onChange={(e) => setForm({ ...form, court: e.target.value })} placeholder="محكمة الاستئناف بالرياض" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="case-number">{t('case.case_number')}</Label>
              <Input id="case-number" value={form.caseNumber} onChange={(e) => setForm({ ...form, caseNumber: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="case-opposing">{t('case.opposing_party')}</Label>
              <Input id="case-opposing" value={form.opposingParty} onChange={(e) => setForm({ ...form, opposingParty: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="case-value">{t('cases.f_value')}</Label>
              <Input id="case-value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            </div>
          </div>
          <label className="flex items-start gap-3 rounded-xl border p-3" htmlFor="case-confidential">
            <input id="case-confidential" type="checkbox" className="mt-1" checked={form.confidential} onChange={(event) => setForm({ ...form, confidential: event.target.checked })} />
            <span className="text-sm">
              <span className="font-medium">{lang === 'ar' ? 'ملف سري' : 'Confidential matter'}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{lang === 'ar' ? 'متاح للمالك والإدارة والفريق المعيّن فقط.' : 'Only owners, administrators and assigned members can access this matter.'}</span>
            </span>
          </label>
          <div className="space-y-1.5">
            <Label htmlFor="case-notes">{t('cases.f_notes')}</Label>
            <Textarea id="case-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" disabled={saving}>{t('comp.cancel')}</Button></DialogClose>
          <Button onClick={submit} disabled={saving}>{isEdit ? t('common.edit') : t('cases.create')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
