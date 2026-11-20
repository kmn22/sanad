import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, isPlatformSuperAdmin, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!isPlatformSuperAdmin(auth)) return forbiddenJson()

  const entries = await db.waitlistEntry.findMany({
    orderBy: { createdAt: 'desc' },
    take: 500,
    select: {
      id: true,
      email: true,
      interest: true,
      source: true,
      createdAt: true,
    },
  })

  return NextResponse.json({ items: entries, total: entries.length })
}
