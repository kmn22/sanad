import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requestIp, writeAudit } from '@/lib/audit'
import { breachNotificationDeadline } from '@/lib/compliance'
import { canManageUsers, forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()
  return NextResponse.json(await db.privacyIncident.findMany({ where: auth.role === 'admin' ? {} : { workspaceId: auth.workspaceId }, orderBy: { awareAt: 'desc' } }))
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()
  const body = await req.json()
  if (typeof body.title !== 'string' || typeof body.description !== 'string') return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
  const awareAt = body.awareAt ? new Date(body.awareAt) : new Date()
  if (Number.isNaN(awareAt.getTime())) return NextResponse.json({ error: 'Invalid awareness date' }, { status: 400 })
  const incident = await db.privacyIncident.create({
    data: {
      workspaceId: auth.workspaceId,
      title: body.title.slice(0, 200),
      description: body.description.slice(0, 10000),
      severity: ['low', 'medium', 'high', 'critical'].includes(body.severity) ? body.severity : 'medium',
      detectedAt: body.detectedAt ? new Date(body.detectedAt) : awareAt,
      awareAt,
      authorityDueAt: breachNotificationDeadline(awareAt),
      affectedSubjects: Number.isInteger(body.affectedSubjects) ? body.affectedSubjects : null,
      dataCategories: typeof body.dataCategories === 'string' ? body.dataCategories.slice(0, 4000) : null,
      createdById: auth.userId,
    },
  })
  await writeAudit({ workspaceId: auth.workspaceId, userId: auth.userId, action: 'privacy.incident.create', entityType: 'PrivacyIncident', entityId: incident.id, ipAddress: requestIp(req) })
  return NextResponse.json(incident, { status: 201 })
}
