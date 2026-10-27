'use client'

import { useDraggable } from '@dnd-kit/core'
import { type LegalCase } from '@/lib/sanad/types'
import { CaseCard } from './CaseCard'

export function DraggableCase({
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
  const { role: _ignoredRole, tabIndex: _ignoredTabIndex, ...dragAttrs } = attributes
  return (
    <div ref={setNodeRef} {...dragAttrs} {...listeners} className={isDragging ? 'opacity-30' : ''}>
      <CaseCard c={c} onClick={onClick} onEdit={onEdit} onDelete={onDelete} onDraftPleading={onDraftPleading} />
    </div>
  )
}
