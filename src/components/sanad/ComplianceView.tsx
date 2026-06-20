'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  COMPLIANCE_LABELS,
  daysUntil,
  formatDate,
  getDaysUntilBg,
  getDaysUntilColor,
  type ComplianceItem,
} from '@/lib/sanad/types'
import { useToast } from '@/hooks/use-toast'

interface Props {
  items: ComplianceItem[]
  onChange: () => void
}

export function ComplianceView({ items, onChange }: Props) {
  const { toast: uiToast } = useToast()
  const [filter, setFilter] = useState<string>('all')
  const [open, setOpen] = useState(false)

  const sorted = [...items].sort((a, b) => daysUntil(a.expiryDate) - daysUntil(b.expiryDate))

  const filtered = filter === 'all' ? sorted : sorted.filter((c) => c.category === filter)

  const expired = sorted.filter((c) => daysUntil(c.expiryDate) < 0)
  const expiring30 = sorted.filter((c) => {
    const d = daysUntil(c.expiryDate)
    return d >= 0 && d <= 30
  })
  const expiring90 = sorted.filter((c) => {
    const d = daysUntil(c.expiryDate)
    return d > 30 && d <= 90
  })
  const safe = sorted.filter((c) => daysUntil(c.expiryDate) > 90)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Compliance Tracker</h2>
          <p className="text-sm text-muted-foreground">
            Iqama, CR, contracts, GOSI, VAT — never miss a renewal deadline.
          </p>
        </div>
        <AddComplianceDialog open={open} onOpenChange={setOpen} onSaved={() => { onChange(); setOpen(false) }} />
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <SummaryTile label="Expired" value={expired.length} tone="rose" icon={<AlertCircle className="h-4 w-4" />} />
        <SummaryTile label="< 30 days" value={expiring30.length} tone="amber" icon={<CalendarClock className="h-4 w-4" />} />
        <SummaryTile label="30-90 days" value={expiring90.length} tone="orange" icon={<CalendarClock className="h-4 w-4" />} />
        <SummaryTile label="Safe" value={safe.length} tone="emerald" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-muted-foreground">Filter:</span>
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
          className="h-7 text-xs"
        >
          All ({sorted.length})
        </Button>
        {Object.entries(COMPLIANCE_LABELS).map(([key, val]) => {
          const count = sorted.filter((c) => c.category === key).length
          if (count === 0) return null
          return (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(key)}
              className="h-7 text-xs"
            >
              {val.label} ({count})
            </Button>
          )
        })}
      </div>

      {/* Grid of countdown cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <ComplianceCard key={item.id} item={item} onChange={onChange} />
        ))}
      </div>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No items in this category.
          </CardContent>
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
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  )
}

function ComplianceCard({ item, onChange }: { item: ComplianceItem; onChange: () => void }) {
  const days = daysUntil(item.expiryDate)
  const pct = Math.max(3, Math.min(100, (Math.max(0, days) / 90) * 100))

  const renew = async () => {
    const newExpiry = new Date(item.expiryDate)
    newExpiry.setFullYear(newExpiry.getFullYear() + 1)
    await fetch(`/api/compliance/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        issueDate: new Date().toISOString(),
        expiryDate: newExpiry.toISOString(),
        status: 'active',
      }),
    })
    toast.success('Renewed for another year')
    onChange()
  }

  return (
    <Card className={`border-l-4 ${getDaysUntilBg(days, item.notifyDays)}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{item.entityName}</p>
            <p className="text-xs text-muted-foreground">{item.title}</p>
          </div>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${COMPLIANCE_LABELS[item.category]?.color}`}>
            {COMPLIANCE_LABELS[item.category]?.label || item.category}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Expiry</span>
            <span className="text-xs">{formatDate(item.expiryDate)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Time remaining</span>
            <span className={`text-sm font-semibold ${getDaysUntilColor(days, item.notifyDays)}`}>
              {days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`}
            </span>
          </div>
          <Progress value={pct} className="h-1.5" />
        </div>

        {item.notes && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1.5">{item.notes}</p>
        )}

        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={renew}>
            Mark renewed
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
      toast.error('Title, entity, and expiry date are required')
      return
    }
    await fetch('/api/compliance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        issueDate: form.issueDate ? new Date(form.issueDate).toISOString() : new Date().toISOString(),
        expiryDate: new Date(form.expiryDate).toISOString(),
        status: 'active',
      }),
    })
    toast.success('Compliance item added')
    setForm({ title: '', category: 'ikama', entityName: '', issueDate: '', expiryDate: '', notes: '', notifyDays: 30 })
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> Add item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add compliance item</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="c-title">Title</Label>
            <Input id="c-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Iqama Renewal" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-cat">Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger id="c-cat"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(COMPLIANCE_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-entity">Entity / Employee</Label>
              <Input id="c-entity" value={form.entityName} onChange={(e) => setForm({ ...form, entityName: e.target.value })} placeholder="e.g. Mohammed Saeed" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-issue">Issue date</Label>
              <Input id="c-issue" type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-expiry">Expiry date</Label>
              <Input id="c-expiry" type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-notes">Notes</Label>
            <Textarea id="c-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes" rows={2} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={submit}>Save item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
