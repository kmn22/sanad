import { createPatchHandler, createDeleteHandler } from '@/lib/api-helpers'

// PATCH /api/cases/:id — used for kanban drag & drop (stage change) + edits
export const PATCH = createPatchHandler('legalCase')

export const DELETE = createDeleteHandler('legalCase')
