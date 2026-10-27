'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
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
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import type { LegalCase } from '@/lib/sanad/types'
import { STATUSES, DOC_TYPES } from './types'

export function AddDocDialog({
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
  const [form, setForm] = useState({
    title: '',
    docType: 'nda',
    status: 'draft',
    parties: '',
    signedDate: '',
    expiryDate: '',
    caseId: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (saving) return
    if (!form.title.trim() || !form.parties.trim()) {
      toast.error(t('docs.req_fields'))
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          title: form.title.trim(),
          parties: form.parties.trim(),
          signedDate: form.signedDate ? new Date(form.signedDate).toISOString() : null,
          expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
          caseId: form.caseId || null,
        }),
      })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result.error || t('common.failed'))
      toast.success(t('docs.added'))
      setForm({ title: '', docType: 'nda', status: 'draft', parties: '', signedDate: '', expiryDate: '', caseId: '', notes: '' })
      onSaved()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.failed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mx-1.5 h-4 w-4" /> {t('docs.add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('docs.add')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="d-title">{t('docs.f_title')}</Label>
            <Input id="d-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={t('docs.f_title_ph')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-type">{t('docs.f_type')}</Label>
              <Select value={form.docType} onValueChange={(v) => setForm({ ...form, docType: v })}>
                <SelectTrigger id="d-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map((dt) => <SelectItem key={dt} value={dt}>{t(`dtype.${dt}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-status">{t('docs.f_status')}</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger id="d-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{t(`dstatus.${s}`)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-parties">{t('docs.f_parties')}</Label>
            <Input id="d-parties" value={form.parties} onChange={(e) => setForm({ ...form, parties: e.target.value })} placeholder={t('docs.f_parties_ph')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-signed">{t('docs.f_signed')}</Label>
              <Input id="d-signed" type="date" value={form.signedDate} onChange={(e) => setForm({ ...form, signedDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-expiry">{t('docs.f_expiry')}</Label>
              <Input id="d-expiry" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-case">{t('docs.f_case')}</Label>
            <Select value={form.caseId} onValueChange={(v) => setForm({ ...form, caseId: v })}>
              <SelectTrigger id="d-case"><SelectValue placeholder={t('tasks.none')} /></SelectTrigger>
              <SelectContent>
                {cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-notes">{t('docs.f_notes')}</Label>
            <Textarea id="d-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          <p className="text-[11px] text-muted-foreground bg-muted/40 rounded px-2 py-1.5">{t('docs.autonote')}</p>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline" disabled={saving}>{t('comp.cancel')}</Button></DialogClose>
          <Button onClick={submit} disabled={saving}>{t('docs.create')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
