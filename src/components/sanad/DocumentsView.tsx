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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FileText, Plus, MoreVertical, FileSignature, Calendar, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  DOC_STATUS_LABELS,
  DOC_TYPE_LABELS,
  daysUntil,
  formatDate,
  type LegalDocument,
  type LegalCase,
} from '@/lib/sanad/types'

interface Props {
  documents: LegalDocument[]
  cases: LegalCase[]
  onChange: () => void
}

const STATUSES = ['draft', 'sent', 'active', 'expiring', 'expired']

export function DocumentsView({ documents, cases, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  const sorted = [...documents].sort((a, b) => {
    // Expiring docs first, then by status
    const aExp = a.expiryDate ? daysUntil(a.expiryDate) : 999
    const bExp = b.expiryDate ? daysUntil(b.expiryDate) : 999
    return aExp - bExp
  })

  const filtered = filter === 'all' ? sorted : sorted.filter((d) => d.status === filter)

  const counts: Record<string, number> = { all: documents.length }
  STATUSES.forEach((s) => { counts[s] = documents.filter((d) => d.status === s).length })

  const updateStatus = async (doc: LegalDocument, status: string) => {
    await fetch(`/api/documents/${doc.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    toast.success(`${doc.title} → ${DOC_STATUS_LABELS[status]?.label}`)
    onChange()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Documents</h2>
          <p className="text-sm text-muted-foreground">
            Track every document across its full lifecycle — Draft → Sent → Active → Expired.
          </p>
        </div>
        <AddDocDialog
          open={open}
          onOpenChange={setOpen}
          cases={cases}
          onSaved={() => { onChange(); setOpen(false) }}
        />
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {(['all', ...STATUSES] as const).map((s) => (
          <Button
            key={s}
            variant={filter === s ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(s)}
            className="h-7 text-xs capitalize"
          >
            {s === 'all' ? `All (${counts.all})` : `${DOC_STATUS_LABELS[s]?.label} (${counts[s]})`}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((d) => {
          const days = d.expiryDate ? daysUntil(d.expiryDate) : null
          const c = cases.find((c) => c.id === d.caseId)
          return (
            <Card key={d.id} className="hover:border-primary/40 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{d.parties}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <p className="text-[10px] text-muted-foreground px-2 py-1">Set status</p>
                      {STATUSES.map((s) => (
                        <DropdownMenuItem key={s} onClick={() => updateStatus(d, s)} disabled={d.status === s}>
                          {DOC_STATUS_LABELS[s]?.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${DOC_STATUS_LABELS[d.status]?.color}`}>
                    {DOC_STATUS_LABELS[d.status]?.label}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
                    {DOC_TYPE_LABELS[d.docType] || d.docType}
                  </Badge>
                </div>

                {c && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileSignature className="h-3 w-3" />
                    <span className="truncate">{c.title}</span>
                  </div>
                )}

                {d.signedDate && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <FileSignature className="h-3 w-3" /> Signed
                    </span>
                    <span>{formatDate(d.signedDate)}</span>
                  </div>
                )}

                {d.expiryDate && (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Expires
                    </span>
                    <span className={`font-medium ${
                      days! < 0 ? 'text-rose-600 dark:text-rose-400' :
                      days! <= 30 ? 'text-amber-600 dark:text-amber-400' :
                      'text-muted-foreground'
                    }`}>
                      {formatDate(d.expiryDate)}
                      {days! < 0 ? ` (${Math.abs(days!)}d overdue)` : days! <= 90 ? ` (${days}d)` : ''}
                    </span>
                  </div>
                )}

                {d.notes && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">{d.notes}</p>
                )}

                {/* Lifecycle visualization */}
                <div className="flex items-center gap-1 pt-1">
                  {['draft', 'sent', 'active', 'expired'].map((stage, i) => {
                    const stageIdx = STATUSES.indexOf(d.status)
                    const myIdx = STATUSES.indexOf(stage)
                    const isActive = myIdx === stageIdx
                    const isPast = myIdx < stageIdx && (d.status === 'active' || d.status === 'expired' || (d.status === 'sent' && stage === 'draft'))
                    return (
                      <div key={stage} className="flex items-center flex-1">
                        <div className={`h-1.5 flex-1 rounded-full ${isActive ? 'bg-primary' : isPast ? 'bg-primary/40' : 'bg-muted'}`} />
                        {i < 3 && <ArrowRight className="h-2.5 w-2.5 text-muted-foreground/40 mx-0.5" />}
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
            No documents in this status.
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function AddDocDialog({
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

  const submit = async () => {
    if (!form.title || !form.parties) {
      toast.error('Title and parties are required')
      return
    }
    await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        signedDate: form.signedDate ? new Date(form.signedDate).toISOString() : null,
        expiryDate: form.expiryDate ? new Date(form.expiryDate).toISOString() : null,
        caseId: form.caseId || null,
      }),
    })
    toast.success('Document added — auto-tasks created if applicable')
    setForm({ title: '', docType: 'nda', status: 'draft', parties: '', signedDate: '', expiryDate: '', caseId: '', notes: '' })
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Add document
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add document</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="d-title">Title</Label>
            <Input id="d-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Mutual NDA — TechCo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-type">Type</Label>
              <Select value={form.docType} onValueChange={(v) => setForm({ ...form, docType: v })}>
                <SelectTrigger id="d-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-status">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger id="d-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s} value={s}>{DOC_STATUS_LABELS[s]?.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-parties">Parties</Label>
            <Input id="d-parties" value={form.parties} onChange={(e) => setForm({ ...form, parties: e.target.value })} placeholder="e.g. Sanad Legal ↔ TechCo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="d-signed">Signed date</Label>
              <Input id="d-signed" type="date" value={form.signedDate} onChange={(e) => setForm({ ...form, signedDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="d-expiry">Expiry date</Label>
              <Input id="d-expiry" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-case">Link to case (optional)</Label>
            <Select value={form.caseId} onValueChange={(v) => setForm({ ...form, caseId: v })}>
              <SelectTrigger id="d-case"><SelectValue placeholder="None" /></SelectTrigger>
              <SelectContent>
                {cases.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="d-notes">Notes</Label>
            <Textarea id="d-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          <p className="text-[11px] text-muted-foreground bg-muted/40 rounded px-2 py-1.5">
            Sending an NDA auto-creates a &ldquo;Follow up on signature&rdquo; task in 3 days. Expiring contracts auto-create renewal reminders 30 days before expiry.
          </p>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={submit}>Add document</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
