'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Gavel, Plus, GripVertical, Users } from 'lucide-react'
import { toast } from 'sonner'
import {
  CASE_STAGE_LABELS,
  PRIORITY_LABELS,
  formatDate,
  formatSAR,
  daysUntil,
  type LegalCase,
} from '@/lib/sanad/types'

interface Props {
  cases: LegalCase[]
  onChange: () => void
}

const STAGES: string[] = ['drafting', 'client_review', 'filed', 'closed']

export function CasesView({ cases, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const onDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string)
  const onDragEnd = async (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const newStage = over.id as string
    const caseItem = cases.find((c) => c.id === active.id)
    if (!caseItem || caseItem.stage === newStage) return

    // Optimistic: optimistically update via parent refetch
    try {
      await fetch(`/api/cases/${caseItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      toast.success(`Moved to ${CASE_STAGE_LABELS[newStage]?.label}`)
      onChange()
    } catch {
      toast.error('Failed to move case')
    }
  }

  const byStage = (stage: string) => cases.filter((c) => c.stage === stage)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Case Board</h2>
          <p className="text-sm text-muted-foreground">
            Drag cases across stages. {cases.filter(c => c.stage !== 'closed').length} active.
          </p>
        </div>
        <AddCaseDialog open={open} onOpenChange={setOpen} onSaved={() => { onChange(); setOpen(false) }} />
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STAGES.map((stage) => (
            <KanbanColumn key={stage} stage={stage} cases={byStage(stage)} />
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <CaseCard
              c={cases.find((c) => c.id === activeId)!}
              dragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function KanbanColumn({ stage, cases }: { stage: string; cases: LegalCase[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const meta = CASE_STAGE_LABELS[stage]
  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-t-4 ${meta?.accent} border-x border-b border-border bg-muted/30 transition-colors ${isOver ? 'bg-primary/5 border-primary/30' : ''}`}
    >
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{meta?.label}</span>
          <span className="text-xs text-muted-foreground bg-background rounded-full px-1.5 py-0.5">{cases.length}</span>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-260px)] min-h-[400px] p-2 scroll-thin">
        <div className="space-y-2">
          {cases.map((c) => (
            <DraggableCase key={c.id} c={c} />
          ))}
          {cases.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-8">
              Drop cases here
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function DraggableCase({ c }: { c: LegalCase }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: c.id })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={isDragging ? 'opacity-30' : ''}>
      <CaseCard c={c} />
    </div>
  )
}

function CaseCard({ c, dragging }: { c: LegalCase; dragging?: boolean }) {
  const days = c.dueDate ? daysUntil(c.dueDate) : null
  const overdue = days !== null && days < 0
  return (
    <Card className={`group cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all ${dragging ? 'shadow-lg rotate-1' : ''}`}>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight flex-1">{c.title}</p>
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 mt-0.5" />
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Users className="h-3 w-3" /> {c.clientName}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PRIORITY_LABELS[c.priority]?.color}`}>
            {PRIORITY_LABELS[c.priority]?.label}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
            {c.caseType}
          </Badge>
        </div>
        {c.dueDate && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted-foreground">Due {formatDate(c.dueDate)}</span>
            {overdue ? (
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">{Math.abs(days!)}d overdue</span>
            ) : days! <= 7 ? (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{days}d left</span>
            ) : null}
          </div>
        )}
        {c.value && c.value > 0 && (
          <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 pt-1">
            {formatSAR(c.value)}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function AddCaseDialog({
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
    clientName: '',
    caseType: 'contract',
    stage: 'drafting',
    priority: 'normal',
    dueDate: '',
    value: '',
    notes: '',
  })

  const submit = async () => {
    if (!form.title || !form.clientName) {
      toast.error('Title and client are required')
      return
    }
    await fetch('/api/cases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        value: form.value ? parseFloat(form.value) : null,
      }),
    })
    toast.success('Case added to board')
    setForm({ title: '', clientName: '', caseType: 'contract', stage: 'drafting', priority: 'normal', dueDate: '', value: '', notes: '' })
    onSaved()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 h-4 w-4" /> New case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create new case</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="case-title">Case title</Label>
            <Input id="case-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. NDA Review — TechCo" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="case-client">Client</Label>
              <Input id="case-client" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="case-type">Type</Label>
              <Select value={form.caseType} onValueChange={(v) => setForm({ ...form, caseType: v })}>
                <SelectTrigger id="case-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="litigation">Litigation</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="ip">IP / Trademark</SelectItem>
                  <SelectItem value="corporate">Corporate / M&A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="case-stage">Stage</Label>
              <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                <SelectTrigger id="case-stage"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map((s) => <SelectItem key={s} value={s}>{CASE_STAGE_LABELS[s]?.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="case-prio">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger id="case-prio"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRIORITY_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="case-due">Due date</Label>
              <Input id="case-due" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="case-value">Value (SAR)</Label>
              <Input id="case-value" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="case-notes">Notes</Label>
            <Textarea id="case-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={submit}>Create case</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
