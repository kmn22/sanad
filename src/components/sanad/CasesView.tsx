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
import { Plus, Search, Filter, MoreVertical, LayoutGrid, List, FileText, Download, Upload, CheckCircle2, Circle, Clock, AlertCircle, Edit, Trash2, CalendarRange, Kanban, Link, GripVertical, Users, Scale } from 'lucide-react'
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
import { DraftingHub } from './DraftingHub'
import { ConflictCheckModal } from './ConflictCheckModal'
import { ShieldAlert } from 'lucide-react'

interface Props {
  cases: LegalCase[]
  clients?: Client[]
  onChange: () => void
}

const STAGES: string[] = ['drafting', 'client_review', 'pleading', 'filed', 'closed']
const CASE_TYPES = [
  'commercial',
  'labor',
  'administrative',
  'litigation',
  'corporate',
  'enforcement',
  'family',
  'contract',
  'consultation',
  'ip',
]
const PRIORITIES = ['low', 'normal', 'high', 'urgent']

export function CasesView({ cases, clients = [], onChange }: Props) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(false)
  const [draftingOpen, setDraftingOpen] = useState(false)
  const [draftingCase, setDraftingCase] = useState<LegalCase | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null)
  const [editingCase, setEditingCase] = useState<LegalCase | null>(null)
  const [view, setView] = useState<'kanban' | 'timeline'>('kanban')
  const [caseSearch, setCaseSearch] = useState('')
  const [conflictModalOpen, setConflictModalOpen] = useState(false)

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

  const filteredCases = cases.filter((c) => {
    if (!caseSearch.trim()) return true
    const q = caseSearch.toLowerCase()
    return (
      c.title.toLowerCase().includes(q) ||
      (c.client?.name && c.client.name.toLowerCase().includes(q)) ||
      (c.clientName && c.clientName.toLowerCase().includes(q)) ||
      (c.caseNumber && c.caseNumber.toLowerCase().includes(q)) ||
      (c.notes && c.notes.toLowerCase().includes(q))
    )
  })

  const byStage = (stage: string) => filteredCases.filter((c) => c.stage === stage)
  const activeCount = cases.filter(c => c.stage !== 'closed').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">{t('cases.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('cases.subtitle', { n: activeCount })}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick search input */}
          <div className="relative w-44 sm:w-56">
            <Input
              value={caseSearch}
              onChange={(e) => setCaseSearch(e.target.value)}
              placeholder={lang === 'ar' ? 'بحث في القضايا والعملاء...' : 'Search cases...'}
              className="h-8 text-xs rounded-full pe-7"
            />
            {caseSearch && (
              <button
                onClick={() => setCaseSearch('')}
                className="absolute end-2 top-2 text-muted-foreground hover:text-foreground text-xs"
              >
                ×
              </button>
            )}
          </div>

          <div className="bg-muted p-0.5 rounded-full flex items-center border border-border/60">
            <Button 
              variant={view === 'kanban' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-7 px-2.5 rounded-full text-xs" 
              onClick={() => setView('kanban')}
            >
              <Kanban className="size-3.5 me-1" />
              <span>{lang === 'ar' ? 'كانبان' : 'Board'}</span>
            </Button>
            <Button 
              variant={view === 'timeline' ? 'secondary' : 'ghost'} 
              size="sm" 
              className="h-7 px-2.5 rounded-full text-xs" 
              onClick={() => setView('timeline')}
            >
              <CalendarRange className="size-3.5 me-1" />
              <span>{lang === 'ar' ? 'الجدول' : 'Timeline'}</span>
            </Button>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setConflictModalOpen(true)}
            className="h-8 text-xs gap-1.5 border-border/80 text-foreground hover:bg-muted rounded-full cursor-pointer"
          >
            <ShieldAlert className="h-3.5 w-3.5 text-primary" />
            <span>{lang === 'ar' ? 'فحص تضارب المصالح' : 'Conflict Check'}</span>
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDraftingOpen(true)}
            className="h-8 text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/5 rounded-full cursor-pointer"
          >
            <Scale className="h-3.5 w-3.5" />
            <span>{lang === 'ar' ? 'إعداد مذكرة' : 'Draft Pleading'}</span>
          </Button>
          <AddCaseDialog open={open} onOpenChange={setOpen} clients={clients} onSaved={() => { onChange(); setOpen(false) }} />
        </div>
      </div>

      <ConflictCheckModal
        open={conflictModalOpen}
        onOpenChange={setConflictModalOpen}
        clients={clients}
        cases={cases}
      />

      <DraftingHub
        open={draftingOpen || !!draftingCase}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setDraftingOpen(false)
            setDraftingCase(null)
          }
        }}
        cases={cases}
        initialTemplateId="defense"
        initialCaseId={draftingCase?.id}
        onDocumentSaved={onChange}
      />

      {view === 'kanban' ? (
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
                onCaseDraftPleading={(c) => setDraftingCase(c)}
              />
            ))}
          </div>
          <DragOverlay>
            {activeId ? (
              <CaseCard c={cases.find((c) => c.id === activeId)!} dragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="min-w-[800px] overflow-x-auto">
              <div className="grid grid-cols-12 gap-0 border-b border-border bg-muted/50 p-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="col-span-4 pl-2">{t('cases.title')}</div>
                <div className="col-span-8 relative flex items-center text-[10px]">
                  <div className="absolute left-0">اليوم</div>
                  <div className="absolute left-1/4">+ 15 يوم</div>
                  <div className="absolute left-2/4">+ 30 يوم</div>
                  <div className="absolute left-3/4">+ 45 يوم</div>
                  <div className="absolute right-0">+ 60 يوم</div>
                </div>
              </div>
              <div className="p-4 space-y-4">
                {cases.filter(c => c.stage !== 'closed').map(c => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  
                  // Start is assumed to be today or creation date (we use today for simplicity in this view)
                  const end = c.dueDate ? new Date(c.dueDate) : c.hearingDate ? new Date(c.hearingDate) : null;
                  
                  // Calculate days from today
                  const totalDays = end ? Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24)) : 14; // default 14 days if no date
                  
                  // Map 60 days to 100% width
                  const widthPercent = Math.min(100, Math.max(5, (totalDays / 60) * 100));
                  const isOverdue = totalDays < 0;

                  return (
                    <div key={c.id} className="grid grid-cols-12 gap-4 items-center group">
                      <div className="col-span-4 pl-2">
                        <p className="text-sm font-medium truncate cursor-pointer hover:underline" onClick={() => setSelectedCaseId(c.id)}>{c.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">{t(`stage.${c.stage}`)}</Badge>
                          <span className="text-[10px] text-muted-foreground">{c.clientName}</span>
                        </div>
                      </div>
                      <div className="col-span-8 relative h-8 flex items-center border-l border-border pl-2">
                        {/* Background grid lines */}
                        <div className="absolute inset-y-0 left-0 w-px bg-border/50" />
                        <div className="absolute inset-y-0 left-1/4 w-px bg-border/50" />
                        <div className="absolute inset-y-0 left-2/4 w-px bg-border/50" />
                        <div className="absolute inset-y-0 left-3/4 w-px bg-border/50" />
                        
                        {/* Gantt Bar */}
                        <div 
                          className={`h-5 rounded-full relative shadow-sm transition-all group-hover:brightness-110 flex items-center px-2 text-[10px] text-white overflow-hidden whitespace-nowrap ${isOverdue ? 'bg-rose-500' : 'bg-primary'}`}
                          style={{ width: `${widthPercent}%`, minWidth: '40px' }}
                        >
                          {end ? formatDate(end.toISOString(), lang) : t('tasks.none')}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
  onCaseDraftPleading,
}: {
  stage: string
  cases: LegalCase[]
  onCaseClick: (id: string) => void
  onCaseEdit: (c: LegalCase) => void
  onCaseDelete: (id: string) => void
  onCaseDraftPleading?: (c: LegalCase) => void
}) {
  const { t } = useLang()
  const { setNodeRef, isOver } = useDroppable({ id: stage })
  const accent = CASE_STAGE_ACCENTS[stage]
  return (
    <div
      ref={setNodeRef}
      className={`rounded-2xl border-t-[3px] ${accent} border-x border-b border-border/80 bg-muted/20 transition-all shadow-2xs ${
        isOver ? 'bg-primary/10 border-primary/40 ring-2 ring-primary/20' : ''
      }`}
    >
      <div className="px-3.5 py-3 flex items-center justify-between border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold tracking-tight">{t(`stage.${stage}`)}</span>
          <span className="text-[10px] font-semibold text-muted-foreground bg-background/80 rounded-full px-2 py-0.5 border border-border/60">
            {cases.length}
          </span>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-270px)] min-h-[420px] p-2.5 scroll-thin">
        <div className="space-y-2.5">
          {cases.map((c) => (
            <DraggableCase
              key={c.id}
              c={c}
              onClick={() => onCaseClick(c.id)}
              onEdit={() => onCaseEdit(c)}
              onDelete={() => onCaseDelete(c.id)}
              onDraftPleading={() => onCaseDraftPleading?.(c)}
            />
          ))}
          {cases.length === 0 && (
            <div className="text-center text-xs text-muted-foreground/60 py-12 border border-dashed border-border/60 rounded-xl m-1">
              {t('cases.drop_here')}
            </div>
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
  onDraftPleading,
}: {
  c: LegalCase
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
  onDraftPleading?: () => void
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: c.id })
  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className={isDragging ? 'opacity-30' : ''}>
      <CaseCard c={c} onClick={onClick} onEdit={onEdit} onDelete={onDelete} onDraftPleading={onDraftPleading} />
    </div>
  )
}

function CaseCard({
  c,
  dragging,
  onClick,
  onEdit,
  onDelete,
  onDraftPleading,
}: {
  c: LegalCase
  dragging?: boolean
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onDraftPleading?: () => void
}) {
  const { lang, t } = useLang()
  const days = c.dueDate ? daysUntil(c.dueDate) : null
  const overdue = days !== null && days < 0

  const copyPortalLink = async () => {
    let token = c.portalToken
    if (!token) {
      token = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15)
      await fetch(`/api/cases/${c.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portalToken: token })
      })
    }
    const url = `${window.location.origin}/portal/${token}`
    navigator.clipboard.writeText(url)
    toast.success('تم نسخ رابط بوابة العميل بنجاح')
  }

  return (
    <Card
      className={`group cursor-grab active:cursor-grabbing hover:border-primary/50 transition-all relative rounded-xl border border-border/70 bg-card shadow-2xs glass-card-hover ${
        dragging ? 'shadow-xl rotate-1 ring-2 ring-primary/30' : ''
      }`}
      onClick={(e) => {
        // Only trigger click if not clicking the action menu
        if (!(e.target as HTMLElement).closest('[data-action-menu]')) onClick?.()
      }}
    >
      <CardContent className="p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs sm:text-sm font-semibold leading-tight flex-1 text-foreground group-hover:text-primary transition-colors">
            {c.title}
          </p>
          {onEdit && onDelete && (
            <div data-action-menu className="opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-panel">
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit className="h-3.5 w-3.5 me-2" />
                    {t('common.edit')}
                  </DropdownMenuItem>
                  {onDraftPleading && (
                    <DropdownMenuItem onClick={onDraftPleading}>
                      <Scale className="h-3.5 w-3.5 me-2 text-primary" />
                      {lang === 'ar' ? 'إعداد مذكرة قضائية' : 'Draft Pleading'}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={copyPortalLink}>
                    <Link className="h-3.5 w-3.5 me-2" />
                    {lang === 'ar' ? 'نسخ رابط العميل' : 'Copy Portal Link'}
                  </DropdownMenuItem>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-rose-600 focus:text-rose-600">
                        <Trash2 className="h-3.5 w-3.5 me-2" />
                        {t('common.delete')}
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-panel">
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
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">{t('dash.d_left', { n: days ?? 0 })}</span>
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
