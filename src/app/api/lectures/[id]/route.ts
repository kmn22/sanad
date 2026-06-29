import { createPatchHandler, createDeleteHandler } from '@/lib/api-helpers'

export const PATCH = createPatchHandler('lecture')

export const DELETE = createDeleteHandler('lecture')
