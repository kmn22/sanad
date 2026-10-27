'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FileText, AlertCircle, CalendarRange, Kanban, Scale } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import {
  formatDate,
  formatSAR,
  type LegalCase,
  type Client,
} from '@/lib/sanad/types'
import { CaseDetailDrawer } from './CaseDetailDrawer'
import { DraftingHub } from './DraftingHub'
import { ConflictCheckModal } from './ConflictCheckModal'
import { StatTile } from '@/components/portal/PortalShell'
import { ShieldAlert } from 'lucide-react'
import { STAGES } from './cases/constants'
import { KanbanColumn } from './cases/KanbanColumn'
import { CaseCard } from './cases/CaseCard'
import { AddCaseDialog } from './cases/AddCaseDialog'

interface Props {
  cases: LegalCase[]
  clients?: Client[]
  onChange: () => void
}

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
      const response = await fetch(`/api/cases/${caseItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || t('common.failed'))
      toast.success(t('cases.moved', { stage: t(`stage.${newStage}`) }))
      onChange()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.failed'))
    }
  }

  const deleteCase = async (id: string) => {
    try {
      const response = await fetch(`/api/cases/${id}`, { method: 'DELETE' })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(result.error || t('common.failed'))
      toast.success(t('common.deleted'))
      onChange()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('common.failed'))
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label={lang === 'ar' ? 'قضايا نشطة' : 'Active cases'} value={activeCount} icon={Scale} />
        <StatTile label={lang === 'ar' ? 'عاجلة' : 'Urgent'} value={cases.filter((item) => item.stage !== 'closed' && item.priority === 'urgent').length} icon={AlertCircle} tone={cases.some((item) => item.stage !== 'closed' && item.priority === 'urgent') ? 'bad' : 'good'} />
        <StatTile label={lang === 'ar' ? 'جلسات قادمة' : 'Upcoming hearings'} value={cases.filter((item) => item.stage !== 'closed' && item.hearingDate && new Date(item.hearingDate) >= new Date()).length} icon={CalendarRange} />
        <StatTile label={lang === 'ar' ? 'القيمة التقديرية' : 'Estimated value'} value={formatSAR(cases.reduce((total, item) => total + (item.value || 0), 0), lang)} icon={FileText} />
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

