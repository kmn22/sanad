import { createListHandler, createCreateHandler } from '@/lib/api-helpers'

export const GET = createListHandler('task', { orderBy: { dueDate: 'asc' } })

export const POST = createCreateHandler('task')
