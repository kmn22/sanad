import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const members = await db.user.findMany({
    where: { workspaceId: auth.workspaceId, disabledAt: null },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  })
  return NextResponse.json(members)
}
