import { createListHandler, createCreateHandler } from '@/lib/api-helpers'

export const GET = createListHandler('timeEntry', {
  orderBy: { date: 'desc' },
  take: 50,
  include: { case: true },
})

export const POST = createCreateHandler('timeEntry')
