'use client'

import { useDroppable } from '@dnd-kit/core'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useLang } from '@/lib/sanad/i18n'
import { CASE_STAGE_ACCENTS, type LegalCase } from '@/lib/sanad/types'
import { DraggableCase } from './DraggableCase'

export function KanbanColumn({
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
            <div className="text-center text-xs text-muted-foreground py-12 border border-dashed border-border/60 rounded-xl m-1">
              {t('cases.drop_here')}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
