import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { db } from '@/lib/db'
import { getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

// Whitelist of updatable fields — never spread the raw body into the update.
const legalTermUpdateSchema = z.object({
  term: z.string().min(1).optional(),
  definition: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
  origin: z.string().nullable().optional(),
  example: z.string().nullable().optional(),
  mastery: z.enum(['learning', 'familiar', 'mastered']).optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { id } = await params
  const existing = await db.legalTerm.findFirst({ where: { id, workspaceId }, select: { id: true } })
  if (!existing) return notFoundJson()

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = legalTermUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
  }

  try {
    const updated = await db.legalTerm.update({ where: { id }, data: parsed.data })
    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'A term with this name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update term' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { id } = await params
  const result = await db.legalTerm.deleteMany({ where: { id, workspaceId } })
  if (!result.count) return notFoundJson()
  return NextResponse.json({ ok: true })
}
