import { createPatchHandler, createDeleteHandler } from '@/lib/api-helpers'

export const PATCH = createPatchHandler('course')

export const DELETE = createDeleteHandler('course')
