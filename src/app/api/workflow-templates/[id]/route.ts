import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { CASE_STAGES, canManageWorkflow } from '@/lib/workflow'

function parseStages(input: unknown): string[] | null | undefined {
  if (input === undefined) return undefined
  if (!Array.isArray(input)) return null
  const stages = input.filter((s): s is string => typeof s === 'string' && CASE_STAGES.has(s))
  const unique = [...new Set(stages)]
  if (unique.length < 2 || unique.length > CASE_STAGES.size || unique.length !== input.length) return null
  return unique
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageWorkflow(auth)) return forbiddenJson()
  const { id } = await params
  const existing = await db.workflowTemplate.findFirst({ where: { id, workspaceId: auth.workspaceId }, select: { id: true } })
  if (!existing) return notFoundJson()

  const body = await req.json().catch(() => null)
  const stages = parseStages(body?.stages)
  if (stages === null) return NextResponse.json({ error: 'Invalid stages' }, { status: 400 })
  const data: Record<string, unknown> = {}
  if (typeof body?.name === 'string' && body.name.trim()) data.name = body.name.trim().slice(0, 120)
  if (body?.description !== undefined) data.description = typeof body.description === 'string' ? body.description.trim().slice(0, 1000) : null
  if (body?.caseType !== undefined) data.caseType = typeof body.caseType === 'string' && body.caseType ? body.caseType : null
  if (stages) data.stages = JSON.stringify(stages)
  if (typeof body?.active === 'boolean') data.active = body.active
  if (body?.isDefault === true) data.isDefault = true
  if (body?.isDefault === false) data.isDefault = false

  const template = await db.$transaction(async (tx) => {
    if (data.isDefault === true) {
      await tx.workflowTemplate.updateMany({ where: { workspaceId: auth.workspaceId, isDefault: true, id: { not: id } }, data: { isDefault: false } })
    }
    const updated = await tx.workflowTemplate.update({ where: { id }, data })
    await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'workflow.template.update', entityType: 'WorkflowTemplate', entityId: id } })
    return updated
  })
  return NextResponse.json(template)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageWorkflow(auth)) return forbiddenJson()
  const { id } = await params
  const existing = await db.workflowTemplate.findFirst({ where: { id, workspaceId: auth.workspaceId }, select: { id: true } })
  if (!existing) return notFoundJson()
  // Retire rather than hard-delete so linked cases keep their audit trail.
  await db.$transaction(async (tx) => {
    await tx.workflowTemplate.update({ where: { id }, data: { active: false, isDefault: false } })
    await tx.auditLog.create({ data: { workspaceId: auth.workspaceId, userId: auth.userId, action: 'workflow.template.retire', entityType: 'WorkflowTemplate', entityId: id } })
  })
  return NextResponse.json({ ok: true })
}
