import { createListHandler, createCreateHandler } from '@/lib/api-helpers'

export const GET = createListHandler('client', {
  include: {
    cases: { select: { id: true, title: true, stage: true } },
    _count: { select: { cases: true, documents: true, communications: true, invoices: true } },
  },
  orderBy: { createdAt: 'desc' },
})

export const POST = createCreateHandler('client')
