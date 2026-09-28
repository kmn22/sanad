import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { canManageUsers, forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()
  const where = { workspaceId: auth.workspaceId }
  const [processors, transfers, dpias, retentionPolicies, legalHolds] = await Promise.all([
    db.processorRegister.findMany({ where, orderBy: { name: 'asc' } }),
    db.transferAssessment.findMany({ where, orderBy: { createdAt: 'desc' } }),
    db.dataProtectionImpactAssessment.findMany({ where, orderBy: { createdAt: 'desc' } }),
    db.retentionPolicy.findMany({ where, orderBy: { entityType: 'asc' } }),
    db.legalHold.findMany({ where, orderBy: { createdAt: 'desc' } }),
  ])
  return NextResponse.json({ processors, transfers, dpias, retentionPolicies, legalHolds })
}

export async function POST(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()
  const body = await req.json()
  switch (body.resource) {
    case 'processor':
      return NextResponse.json(await db.processorRegister.create({ data: { workspaceId: auth.workspaceId, name: String(body.name).slice(0, 200), purpose: String(body.purpose).slice(0, 2000), dataCategories: String(body.dataCategories).slice(0, 2000), processingLocation: String(body.processingLocation).slice(0, 200), contractReference: body.contractReference ? String(body.contractReference).slice(0, 500) : null } }), { status: 201 })
    case 'transfer':
      return NextResponse.json(await db.transferAssessment.create({ data: { workspaceId: auth.workspaceId, processorId: body.processorId || null, destinationCountry: String(body.destinationCountry).slice(0, 100), purpose: String(body.purpose).slice(0, 2000), dataCategories: String(body.dataCategories).slice(0, 2000), safeguard: String(body.safeguard).slice(0, 2000), riskAssessment: String(body.riskAssessment).slice(0, 8000) } }), { status: 201 })
    case 'dpia':
      return NextResponse.json(await db.dataProtectionImpactAssessment.create({ data: { workspaceId: auth.workspaceId, title: String(body.title).slice(0, 200), processing: String(body.processing).slice(0, 8000), necessity: String(body.necessity).slice(0, 8000), risks: String(body.risks).slice(0, 8000), mitigations: String(body.mitigations).slice(0, 8000), residualRisk: String(body.residualRisk).slice(0, 2000) } }), { status: 201 })
    case 'retention':
      return NextResponse.json(await db.retentionPolicy.upsert({ where: { workspaceId_entityType: { workspaceId: auth.workspaceId, entityType: String(body.entityType) } }, create: { workspaceId: auth.workspaceId, entityType: String(body.entityType), retentionDays: Number(body.retentionDays), legalBasis: String(body.legalBasis).slice(0, 2000) }, update: { retentionDays: Number(body.retentionDays), legalBasis: String(body.legalBasis).slice(0, 2000), active: true } }), { status: 201 })
    case 'legal_hold':
      return NextResponse.json(await db.legalHold.create({ data: { workspaceId: auth.workspaceId, entityType: String(body.entityType), entityId: String(body.entityId), reason: String(body.reason).slice(0, 2000), createdById: auth.userId } }), { status: 201 })
    default:
      return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
  }
}
