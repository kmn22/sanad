import { createPatchHandler, createDeleteHandler } from '@/lib/api-helpers'

export const PATCH = createPatchHandler('task')

export const DELETE = createDeleteHandler('task')
