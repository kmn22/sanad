import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const notifications = await db.notification.findMany({
    where: { userId: auth.userId, workspaceId: auth.workspaceId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json(notifications, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function PATCH(req: Request) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const body = await req.json().catch(() => null)
  const ids = Array.isArray(body?.ids) ? body.ids.filter((id: unknown) => typeof id === 'string').slice(0, 100) : []
  await db.notification.updateMany({ where: { userId: auth.userId, workspaceId: auth.workspaceId, ...(ids.length ? { id: { in: ids } } : {}) }, data: { isRead: true } })
  return NextResponse.json({ ok: true })
}
