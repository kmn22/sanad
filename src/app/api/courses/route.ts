import { createListHandler, createCreateHandler } from '@/lib/api-helpers'

export const GET = createListHandler('course', {
  include: { lectures: true, deadlines: true },
  orderBy: { createdAt: 'asc' },
})

export const POST = createCreateHandler('course')
