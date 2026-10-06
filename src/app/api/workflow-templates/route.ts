import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { CASE_STAGES, canManageWorkflow } from '@/lib/workflow'
import { hasEntitlement } from '@/lib/saas/entitlements'
import { rateLimit } from '@/lib/rate-limit'

function parseStages(input: unknown): string[] | null {
  if (!Array.isArray(input)) return null
  const stages = input.filter((s): s is string => typeof s === 'string' && CASE_STAGES.has(s))
  const unique = [...new Set(stages)]
  if (unique.length < 2 || unique.length > CASE_STAGES.size || unique.length !== input.length) return null
  return unique
}

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!(await hasEntitlement(auth.workspaceId, 'workflow'))) return forbiddenJson()
  const templates = await db.workflowTemplate.findMany({
    where: { workspaceId: auth.workspaceId },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
    include: { _count: { select: { cases: true } } },
  })
  return NextResponse.json(templates)
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageWorkflow(auth)) return forbiddenJson()
  if (!(await hasEntitlement(auth.workspaceId, 'workflow'))) return forbiddenJson()
  const limited = await rateLimit(`workflow-template:create:${auth.userId}`, 20, 60 * 60 * 1000)
  if (!limited.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const body = await req.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim().slice(0, 120) : ''
  const description = typeof body?.description === 'string' ? body.description.trim().slice(0, 1000) : null
  const caseType = typeof body?.caseType === 'string' && body.caseType ? body.caseType : null
  const stages = parseStages(body?.stages)
  const isDefault = body?.isDefault === true
  if (!name || !stages) return NextResponse.json({ error: 'A name and at least two valid stages are required' }, { status: 400 })

  const template = await db.$transaction(async (tx) => {
    if (isDefault) {
      await tx.workflowTemplate.updateMany({ where: { workspaceId: auth.workspaceId, isDefault: true }, data: { isDefault: false } })
    }
    const created = await tx.workflowTemplate.create({
      data: { workspaceId: auth.workspaceId, name, description, caseType, stages: JSON.stringify(stages), isDefault, createdById: auth.userId },
    })
    await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'workflow.template.create', entityType: 'WorkflowTemplate', entityId: created.id } })
    return created
  })
  return NextResponse.json(template, { status: 201 })
}
