import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'
import { canWriteAcademic, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'
import { requireEducation } from '@/lib/saas/entitlements'
import { createTermSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const eduGate = await requireEducation(workspaceId)
  if (eduGate) return eduGate
  const q = req.nextUrl.searchParams.get('q')
  const terms = await db.legalTerm.findMany({
    where: { workspaceId, ...(q ? { term: { contains: q } } : {}) },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(terms)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const eduGate = await requireEducation(auth.workspaceId)
  if (eduGate) return eduGate
  const denied = denyUnless(auth, canWriteAcademic(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  const workspaceId = auth.workspaceId
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const parsed = createTermSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
  }
  try {
    const term = await db.legalTerm.create({ data: { ...parsed.data, workspaceId } })
    return NextResponse.json(term, { status: 201 })
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      return NextResponse.json({ error: 'A term with this name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create term' }, { status: 500 })
  }
}
