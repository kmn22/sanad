import { NextRequest, NextResponse } from 'next/server'
import { getTenantDb } from '@/lib/db'
import { updateCaseSchema } from '@/lib/validations'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canAccessCase, canWrite, denyUnless, enforceMutationBudget, legalHoldBlock } from '@/lib/auth/capabilities'
import { publishNotification } from '@/lib/notifications/bus'
import { normalizeSaudiPhone } from '@/lib/whatsapp'
import { formatDualHijriGregorian } from '@/lib/dates'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    const denied = denyUnless(auth, canWrite(auth))
    if (denied) return denied
    const budgeted = await enforceMutationBudget(auth)
    if (budgeted) return budgeted
    const tdb = getTenantDb(auth)
    const workspaceId = auth.workspaceId
    const { id } = await params
    const parsed = updateCaseSchema.parse(await req.json())
    const existing = await tdb.legalCase.findFirst({
      where: { id, workspaceId, orgId: auth.orgId, deletedAt: null },
      select: { id: true, title: true, stage: true, hearingDate: true, clientId: true },
    })
    if (!existing || !(await canAccessCase(auth, id))) return notFoundJson()
    if (parsed.clientId) {
      const client = await tdb.client.findFirst({ where: { id: parsed.clientId, workspaceId }, select: { id: true } })
      if (!client) return notFoundJson()
    }
    const updated = await tdb.legalCase.update({ where: { id }, data: parsed })

    const stageChanged = parsed.stage && parsed.stage !== existing.stage
    const hearingChanged =
      parsed.hearingDate &&
      (!existing.hearingDate || new Date(parsed.hearingDate).getTime() !== new Date(existing.hearingDate).getTime())

    if (stageChanged || hearingChanged) {
      const targetClientId = parsed.clientId ?? existing.clientId
      const client = targetClientId
        ? await tdb.client.findFirst({ where: { id: targetClientId, workspaceId }, select: { name: true, phone: true } })
        : null
      const normalizedPhone = normalizeSaudiPhone(client?.phone)
      const dualHearing = updated.hearingDate ? formatDualHijriGregorian(updated.hearingDate, 'ar').combined : null
      const bodyText = hearingChanged && dualHearing
        ? `تم تحديد/تحديث موعد جلسة للقضية «${updated.title}» بتاريخ ${dualHearing}.`
        : `تم تحديث مرحلة القضية «${updated.title}» إلى (${updated.stage}).`

      await publishNotification(workspaceId, [auth.userId], {
        type: 'case_update',
        title: hearingChanged ? 'تحديث موعد جلسة قضائية' : 'تحديث مرحلة قضية',
        body: bodyText,
        link: '/lawyer/cases',
        entityType: 'LegalCase',
        entityId: updated.id,
        channels: normalizedPhone ? ['in_app', 'whatsapp'] : ['in_app'],
        metadata: normalizedPhone ? { recipientPhone: normalizedPhone } : undefined,
      }).catch(() => {})
    }

    return NextResponse.json(updated)
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: err.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update case' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const denied = denyUnless(auth, canWrite(auth))
  if (denied) return denied
  const budgeted = await enforceMutationBudget(auth)
  if (budgeted) return budgeted
  const tdb = getTenantDb(auth)
  const workspaceId = auth.workspaceId
  const { id } = await params
  const hold = await legalHoldBlock(auth.workspaceId, 'LegalCase', id)
  if (hold) return hold
  const existing = await tdb.legalCase.findFirst({ where: { id, workspaceId, orgId: auth.orgId, deletedAt: null }, select: { id: true } })
  if (!existing || !(await canAccessCase(auth, id))) return notFoundJson()
  await tdb.legalCase.update({ where: { id }, data: { deletedAt: new Date() } })
  return NextResponse.json({ ok: true })
}
