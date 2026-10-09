import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCaseSchema } from '@/lib/validations'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canWrite, denyUnless, enforceMutationBudget, caseAccessWhere } from '@/lib/auth/capabilities'
import { hasEntitlement } from '@/lib/saas/entitlements'
import { parsePagination, paginatedResponse } from '@/lib/http'

export async function GET(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const workspaceId = auth.workspaceId
  const { limit, cursor } = parsePagination(new URL(req.url))
  const [rows, total] = await Promise.all([
    db.legalCase.findMany({
      where: { workspaceId, deletedAt: null, ...caseAccessWhere(auth) },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { timeEntries: true } } },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    db.legalCase.count({ where: { workspaceId, deletedAt: null, ...caseAccessWhere(auth) } }),
  ])
  return NextResponse.json(paginatedResponse(rows, limit, { total }))
}


export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const denied = denyUnless(auth, canWrite(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  if (!(await hasEntitlement(auth.workspaceId, 'cases'))) {
    return NextResponse.json({ error: 'Case management is not included in the current plan', code: 'CASES_NOT_INCLUDED' }, { status: 403 })
  }
  const workspaceId = auth.workspaceId

  let rawBody: unknown
  try {
    rawBody = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = createCaseSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
  }

  try {
    if (parsed.data.clientId) {
      const client = await db.client.findFirst({ where: { id: parsed.data.clientId, workspaceId }, select: { id: true } })
      if (!client) return notFoundJson()
    }
    const c = await db.legalCase.create({
      data: {
        ...parsed.data,
        workspaceId,
        // A confidential case is only visible to its assigned team — auto-lead the creator.
        assignments: parsed.data.confidential
          ? { create: { workspaceId, userId: auth.userId, assignedById: auth.userId, role: 'lead' } }
          : undefined,
      },
    })
    return NextResponse.json(c)
  } catch (err) {
    console.error('Failed to create case:', err)
    return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
  }
}
