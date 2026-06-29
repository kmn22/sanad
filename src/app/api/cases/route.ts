import { createListHandler, createCreateHandler } from '@/lib/api-helpers'

export const GET = createListHandler('legalCase', {
  orderBy: { updatedAt: 'desc' },
  include: { timeEntries: true },
})

export const POST = createCreateHandler('legalCase')
