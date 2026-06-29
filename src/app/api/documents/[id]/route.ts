import { createPatchHandler, createDeleteHandler } from '@/lib/api-helpers'

export const PATCH = createPatchHandler('legalDocument')

export const DELETE = createDeleteHandler('legalDocument')
