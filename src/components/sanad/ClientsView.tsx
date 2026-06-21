'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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
  Search,
  Phone,
  Mail,
  MapPin,
  Building2,
  User,
  Edit,
  Trash2,
  Briefcase,
  FileText,
  MessageSquare,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import type { Client } from '@/lib/sanad/types'

interface Props {
  clients: Client[]
  onChange: () => void
}

const CLIENT_TYPES = ['individual', 'corporate']

export function ClientsView({ clients, onChange }: Props) {
  const { lang, t } = useLang()
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)

  const q = query.trim().toLowerCase()
  const filtered = q
    ? clients.filter((c) =>
        [c.name, c.phone, c.email, c.nationalId]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(q))
      )
    : clients

  const openAdd = () => {
    setEditing(null)
    setDialogOpen(true)
  }

  const openEdit = (client: Client) => {
    setEditing(client)
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

  const handleDelete = async (client: Client) => {
    try {
      const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('delete failed')
      toast.success(t('clients.deleted'))
      onChange()
    } catch {
      toast.error(t('clients.delete'))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t('clients.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('clients.subtitle')}</p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="mx-1.5 h-4 w-4" /> {t('clients.add')}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 -translate-y-1/2 start-3 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('clients.search')}
          className="ps-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
            {clients.length === 0 ? t('clients.empty') : t('clients.no_results')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <ClientCard key={c.id} client={c} onEdit={openEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <ClientFormDialog
        key={editing?.id ?? 'new'}
        open={dialogOpen}
        onOpenChange={handleDialogChange}
        client={editing}
        onSaved={handleSaved}
      />
    </div>
  )
}

function ClientCard({
  client,
  onEdit,
  onDelete,
}: {
  client: Client
  onEdit: (c: Client) => void
  onDelete: (c: Client) => void
}) {
  const { lang, t } = useLang()
  const isCorporate = client.type === 'corporate'
  const counts = client._count ?? { cases: 0, invoices: 0, communications: 0 }
  const num = (n: number) => (lang === 'ar' ? n.toLocaleString('ar-EG') : n.toString())

  return (
    <Card className="hover:border-primary/40 transition-colors group">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold truncate">{client.name}</p>
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 ${
                  isCorporate
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200'
                }`}
              >
                {isCorporate ? (
                  <Building2 className="h-2.5 w-2.5" />
                ) : (
                  <User className="h-2.5 w-2.5" />
                )}
                {isCorporate ? t('clients.corporate') : t('clients.individual')}
              </Badge>
            </div>
            {isCorporate && client.company && (
              <p className="text-xs text-muted-foreground truncate mt-0.5 flex items-center gap-1">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{client.company}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onEdit(client)}
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
                  <AlertDialogDescription>
                    {t('clients.delete_confirm')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-rose-600 hover:bg-rose-700 text-white dark:bg-rose-700 dark:hover:bg-rose-600"
                    onClick={() => onDelete(client)}
                  >
                    {t('common.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
            <span
              dir="ltr"
              className={`truncate text-start ${client.phone ? '' : 'text-muted-foreground/70 italic'}`}
            >
              {client.phone ?? t('clients.no_phone')}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
            <span
              dir="ltr"
              className={`truncate text-start ${client.email ? '' : 'text-muted-foreground/70 italic'}`}
            >
              {client.email ?? t('clients.no_email')}
            </span>
          </div>
          {client.nationalId && (
            <div className="flex items-center gap-1.5">
              <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
              <span dir="ltr" className="truncate text-start">
                {client.nationalId}
              </span>
            </div>
          )}
          {client.address && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
              <span className="truncate">{client.address}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
            <Briefcase className="h-2.5 w-2.5" />
            {num(counts.cases)} {t('clients.cases_count')}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
            <FileText className="h-2.5 w-2.5" />
            {num(counts.invoices)} {t('clients.invoices_count')}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
            <MessageSquare className="h-2.5 w-2.5" />
            {num(counts.communications)} {t('clients.comms_count')}
          </Badge>
        </div>

        {client.notes && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5 line-clamp-2">
            {client.notes}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface FormState {
  name: string
  type: string
  phone: string
  email: string
  nationalId: string
  address: string
  company: string
  notes: string
}

function ClientFormDialog({
  open,
  onOpenChange,
  client,
  onSaved,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  client: Client | null
  onSaved: () => void
}) {
  const { t } = useLang()
  const isEdit = !!client
  const [form, setForm] = useState<FormState>({
    name: client?.name ?? '',
    type: client?.type ?? 'individual',
    phone: client?.phone ?? '',
    email: client?.email ?? '',
    nationalId: client?.nationalId ?? '',
    address: client?.address ?? '',
    company: client?.company ?? '',
    notes: client?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error(t('clients.f_name'))
      return
    }
    setSaving(true)
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        nationalId: form.nationalId.trim() || null,
        address: form.address.trim() || null,
        company: form.company.trim() || null,
        notes: form.notes.trim() || null,
      }
      const res = isEdit
        ? await fetch(`/api/clients/${client!.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/clients', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
      if (!res.ok) throw new Error('save failed')
      toast.success(isEdit ? t('clients.updated') : t('clients.added'))
      onSaved()
    } catch {
      toast.error(isEdit ? t('clients.updated') : t('clients.added'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? t('clients.edit') : t('clients.add')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <Label htmlFor="c-name">
                {t('clients.f_name')} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="c-name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder={t('clients.f_name')}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-type">{t('clients.f_type')}</Label>
              <Select value={form.type} onValueChange={(v) => set('type', v)}>
                <SelectTrigger id="c-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLIENT_TYPES.map((tp) => (
                    <SelectItem key={tp} value={tp}>
                      {tp === 'corporate' ? t('clients.corporate') : t('clients.individual')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-phone">{t('clients.f_phone')}</Label>
              <Input
                id="c-phone"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value)}
                placeholder={t('clients.f_phone')}
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email">{t('clients.f_email')}</Label>
              <Input
                id="c-email"
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder={t('clients.f_email')}
                dir="ltr"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-natid">{t('clients.f_national_id')}</Label>
              <Input
                id="c-natid"
                value={form.nationalId}
                onChange={(e) => set('nationalId', e.target.value)}
                placeholder={t('clients.f_national_id')}
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-company">{t('clients.f_company')}</Label>
              <Input
                id="c-company"
                value={form.company}
                onChange={(e) => set('company', e.target.value)}
                placeholder={t('clients.f_company')}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-address">{t('clients.f_address')}</Label>
            <Input
              id="c-address"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder={t('clients.f_address')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="c-notes">{t('clients.f_notes')}</Label>
            <Textarea
              id="c-notes"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              rows={2}
              placeholder={t('clients.f_notes')}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t('common.cancel')}</Button>
          </DialogClose>
          <Button onClick={submit} disabled={saving}>
            {isEdit ? t('clients.save') : t('clients.create')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
