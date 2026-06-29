import { createPatchHandler, createDeleteHandler } from '@/lib/api-helpers'

export const PATCH = createPatchHandler('caseEntry')

export const DELETE = createDeleteHandler('caseEntry')
