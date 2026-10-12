import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'
import { canWriteAcademic, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'
import { requireEducation } from '@/lib/saas/entitlements'

export async function GET(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const eduGate = await requireEducation(workspaceId)
  if (eduGate) return eduGate
  const subject = req.nextUrl.searchParams.get('subject')
  const cases = await db.caseEntry.findMany({
    where: { workspaceId, ...(subject ? { subject } : {}) },
    orderBy: { rating: 'desc' },
  })
  return NextResponse.json(cases)
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
  const body = await req.json()
  const entry = await db.caseEntry.create({ data: { ...body, id: undefined, workspaceId } })
  return NextResponse.json(entry, { status: 201 })
}
