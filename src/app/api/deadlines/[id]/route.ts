import { createPatchHandler, createDeleteHandler } from '@/lib/api-helpers'

export const PATCH = createPatchHandler('academicDeadline')

export const DELETE = createDeleteHandler('academicDeadline')
