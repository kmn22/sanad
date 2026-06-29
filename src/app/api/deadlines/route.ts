import { createListHandler, createCreateHandler } from '@/lib/api-helpers'

export const GET = createListHandler('academicDeadline', {
  orderBy: { dueDate: 'asc' },
  include: { course: true },
})

export const POST = createCreateHandler('academicDeadline')
