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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Plus, GripVertical, Users, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import {
  CASE_STAGE_ACCENTS,
  PRIORITY_COLORS,
  formatDate,
  formatSAR,
  daysUntil,
  type LegalCase,
  type Client,
} from '@/lib/sanad/types'
import { CaseDetailDrawer } from './CaseDetailDrawer'

interface Props {
  cases: LegalCase[]
  clients?: Client[]
  onChange: () => void
}

const STAGES: string[] = ['drafting', 'client_review', 'filed', 'closed']
const CASE_TYPES = ['litigation', 'contract', 'consultation', 'ip', 'corporate']
const PRIORITIES = ['low', 'normal', 'high', 'urgent']

export function CasesView({ cases, clients = [], onChange }: Props) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const onDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string)
  const onDragEnd = async (e: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = e
    if (!over) return
    const newStage = over.id as string
    const caseItem = cases.find((c) => c.id === active.id)
    if (!caseItem || caseItem.stage === newStage) return

    try {
      await fetch(`/api/cases/${caseItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      toast.success(t('cases.moved', { stage: t(`stage.${newStage}`) }))
      onChange()
    } catch {
      toast.error('Failed to move case')
    }
  }

  const deleteCase = async (id: string) => {
    try {
      await fetch(`/api/cases/${id}`, { method: 'DELETE' })
      toast.success(t('common.deleted'))
      onChange()
    } catch {
      toast.error(t('common.failed'))
    }
  }

  const byStage = (stage: string) => cases.filter((c) => c.stage === stage)
  const activeCount = cases.filter(c => c.stage !== 'closed').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t('cases.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('cases.subtitle', { n: activeCount })}</p>
        </div>
        <AddCaseDialog open={open} onOpenChange={setOpen} clients={clients} onSaved={() => { onChange(); setOpen(false) }} />
      </div>

      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              cases={byStage(stage)}
              onCaseClick={(id) => setSelectedCaseId(id)}
              onCaseEdit={(c) => setEditingCase(c)}
              onCaseDelete={(id) => deleteCase(id)}
            />
          ))}
        </div>
        <DragOverlay>
          {activeId ? (
            <CaseCard c={cases.find((c) => c.id === activeId)!} dragging />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Case detail drawer */}
      <CaseDetailDrawer
        caseId={selectedCaseId}
        onClose={() => setSelectedCaseId(null)}
        onChange={onChange}
      />

      {/* Edit dialog */}
      {editingCase && (
        <AddCaseDialog
          open={true}
          onOpenChange={(o) => { if (!o) setEditingCase(null) }}
          clients={clients}
          editingCase={editingCase}
          onSaved={() => { onChange(); setEditingCase(null) }}
        />
      )}
    </div>
  )
}

function KanbanColumn({
  stage,
  cases,
  onCaseClick,
  onCaseEdit,
  onCaseDelete,
}: {
  stage: string
  cases: LegalCase[]
  onCaseClick: (id: string) => void
  onCaseEdit: (c: LegalCase) => void
  onCaseDelete: (id: string) => void
}) {
  const { t } = useLang()
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const accent = CASE_STAGE_ACCENTS[stage]
  return (
    <div
      ref={setNodeRef}
      className={`rounded-lg border-t-4 ${accent} border-x border-b border-border bg-muted/30 transition-colors ${isOver ? 'bg-primary/5 border-primary/30' : ''}`}
    >
      <div className="px-3 py-2.5 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{t(`stage.${stage}`)}</span>
          <span className="text-xs text-muted-foreground bg-background rounded-full px-1.5 py-0.5">{cases.length}</span>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-260px)] min-h-[400px] p-2 scroll-thin">
        <div className="space-y-2">
          {cases.map((c) => (
            <DraggableCase
              key={c.id}
              c={c}
              onClick={() => onCaseClick(c.id)}
              onEdit={() => onCaseEdit(c)}
              onDelete={() => onCaseDelete(c.id)}
            />
          ))}
          {cases.length === 0 && (
            <div className="text-center text-xs text-muted-foreground py-8">{t('cases.drop_here')}</div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function DraggableCase({
  c,
  onClick,
  onEdit,
  onDelete,
}: {
  c: LegalCase
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: c.id })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={isDragging ? 'opacity-30' : ''}>
      <CaseCard c={c} onClick={onClick} onEdit={onEdit} onDelete={onDelete} />
    </div>
  )
}

function CaseCard({
  c,
  dragging,
  onClick,
  onEdit,
  onDelete,
}: {
  c: LegalCase
  dragging?: boolean
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
}) {
  const { lang, t } = useLang()
  const days = c.dueDate ? daysUntil(c.dueDate) : null
  const overdue = days !== null && days < 0
  return (
    <Card
      className={`group cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all relative ${dragging ? 'shadow-lg rotate-1' : ''}`}
      onClick={(e) => {
        // Only trigger click if not clicking the action menu
        if (!(e.target as HTMLElement).closest('[data-action-menu]')) onClick?.()
      }}
    >
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-tight flex-1">{c.title}</p>
          {onEdit && onDelete && (
            <div data-action-menu className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-3 w-3 me-2" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-rose-600">
                        <Trash2 className="h-3 w-3 me-2" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t('common.delete_confirm')}</AlertDialogTitle>
                        <AlertDialogDescription>{c.title}</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{t('comp.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={onDelete} className="bg-rose-600 hover:bg-rose-700">
                          {t('common.delete')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
          {!onEdit && <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground/70 mt-0.5" />}
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Users className="h-3 w-3" /> {c.client?.name || c.clientName}
        </p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[c.priority]?.color}`}>
            {t(`prio.${c.priority}`)}
          </Badge>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
            {t(`ctype.${c.caseType}`)}
          </Badge>
        </div>
        {c.dueDate && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted-foreground">{t('cases.due')} {formatDate(c.dueDate, lang)}</span>
            {overdue ? (
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">{t('dash.d_overdue', { n: Math.abs(days!) })}</span>
            ) : days! <= 7 ? (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{t('dash.d_left', { n: days })}</span>
            ) : null}
          </div>
        )}
        {c.value && c.value > 0 && (
          <p className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300 pt-1">{formatSAR(c.value, lang)}</p>
        )}
      </CardContent>
    </Card>
  )
}

function AddCaseDialog({
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
  const { t } = useLang()
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
  })

  const isEdit = !!editingCase

  const submit = async () => {
    if (!form.title) {
      toast.error(t('cases.req_fields'))
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

    if (isEdit && editingCase) {
      await fetch(`/api/cases/${editingCase.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      toast.success(t('common.updated'))
    } else {
      await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      toast.success(t('cases.added'))
    }
    onSaved()
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
          <div className="space-y-1.5">
            <Label htmlFor="case-notes">{t('cases.f_notes')}</Label>
            <Textarea id="case-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('comp.cancel')}</Button></DialogClose>
          <Button onClick={submit}>{isEdit ? t('common.edit') : t('cases.create')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
