import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createPatchHandler, createDeleteHandler } from '@/lib/api-helpers'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await db.client.findUnique({
    where: { id },
    include: {
      cases: { orderBy: { updatedAt: 'desc' } },
      documents: { orderBy: { updatedAt: 'desc' } },
      communications: { orderBy: { date: 'desc' } },
      invoices: { orderBy: { createdAt: 'desc' } },
    },
  })
  return NextResponse.json(client)
}

export const PATCH = createPatchHandler('client')

export const DELETE = createDeleteHandler('client')
