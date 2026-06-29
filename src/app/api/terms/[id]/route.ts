import { createPatchHandler, createDeleteHandler } from '@/lib/api-helpers'

export const PATCH = createPatchHandler('legalTerm')

export const DELETE = createDeleteHandler('legalTerm')
