import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { canManageUsers, forbiddenJson, getAuthContext, hasRole, unauthorizedJson, type AuthContext } from '@/lib/auth/workspace'
import { KNOWN_FLAGS } from '@/lib/feature-flags'

function targetWorkspace(req: NextRequest, auth: AuthContext) {
  const requested = req.nextUrl.searchParams.get('workspaceId')
  // Platform admins may manage any workspace; owners manage only their own.
  return hasRole(auth, ['admin']) && requested ? requested : auth.workspaceId
}

export async function GET(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()
  const workspaceId = targetWorkspace(req, auth)
  const flags = await db.featureFlag.findMany({ where: { workspaceId }, orderBy: { key: 'asc' } })
  const map = Object.fromEntries(flags.map((flag) => [flag.key, flag.enabled]))
  return NextResponse.json({ workspaceId, flags: Object.fromEntries([...KNOWN_FLAGS].map((key) => [key, map[key] ?? true])) })
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()
  const workspaceId = targetWorkspace(req, auth)
  const body = await req.json().catch(() => null)
  if (typeof body?.key !== 'string' || !KNOWN_FLAGS.has(body.key) || typeof body?.enabled !== 'boolean') {
    return NextResponse.json({ error: 'Unknown flag or invalid enabled value' }, { status: 400 })
  }
  const flag = await db.$transaction(async (tx) => {
    const row = await tx.featureFlag.upsert({
      where: { workspaceId_key: { workspaceId, key: body.key } },
      create: { workspaceId, key: body.key, enabled: body.enabled, updatedById: auth.userId },
      update: { enabled: body.enabled, updatedById: auth.userId },
    })
    await tx.auditLog.create({ data: { workspaceId, userId: auth.userId, action: 'feature_flag.update', entityType: 'FeatureFlag', entityId: row.id, metadata: JSON.stringify({ key: body.key, enabled: body.enabled }) } })
    return row
  })
  return NextResponse.json(flag)
}
