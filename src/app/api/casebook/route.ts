import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'
import { canWriteAcademic, denyUnless, enforceMutationBudget } from '@/lib/auth/capabilities'
import { requireEducation } from '@/lib/saas/entitlements'
import { createCaseEntrySchema } from '@/lib/validations'

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
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const parsed = createCaseEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
  }
  const entry = await db.caseEntry.create({ data: { ...parsed.data, workspaceId } })
  return NextResponse.json(entry, { status: 201 })
}
