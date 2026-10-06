import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

const KNOWN_TYPES = new Set(['system', 'assignment', 'workflow', 'portal', 'approval', 'security', 'reminder'])
const TIME_RE = /^\d{2}:\d{2}$/

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const prefs = await db.notificationPreference.findMany({ where: { userId: auth.userId }, orderBy: { type: 'asc' } })
  return NextResponse.json(prefs)
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const body = await req.json().catch(() => null)
  if (!Array.isArray(body?.preferences)) return NextResponse.json({ error: 'preferences must be an array' }, { status: 400 })

  for (const item of body.preferences.slice(0, 20)) {
    const type = typeof item?.type === 'string' ? item.type : ''
    if (!KNOWN_TYPES.has(type)) continue
    const inApp = item.inApp !== false
    const email = item.email !== false
    const quietStart = typeof item.quietStart === 'string' && TIME_RE.test(item.quietStart) ? item.quietStart : null
    const quietEnd = typeof item.quietEnd === 'string' && TIME_RE.test(item.quietEnd) ? item.quietEnd : null
    await db.notificationPreference.upsert({
      where: { userId_type: { userId: auth.userId, type } },
      create: { userId: auth.userId, type, inApp, email, quietStart, quietEnd },
      update: { inApp, email, quietStart, quietEnd },
    })
  }
  const prefs = await db.notificationPreference.findMany({ where: { userId: auth.userId } })
  return NextResponse.json(prefs)
}
