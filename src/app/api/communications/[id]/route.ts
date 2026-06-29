import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createDeleteHandler } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const updated = await db.communication.update({
    where: { id },
    data: {
      ...body,
      date: body.date ? new Date(body.date) : undefined,
      durationMin: body.durationMin ?? undefined,
    },
  })
  return NextResponse.json(updated)
}

export const DELETE = createDeleteHandler('communication')
