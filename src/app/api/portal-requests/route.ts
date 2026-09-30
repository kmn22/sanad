import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const requests = await db.portalRequest.findMany({
    where: { workspaceId: auth.workspaceId },
    orderBy: { updatedAt: 'desc' },
    take: 100,
    include: {
      client: { select: { id: true, name: true } },
      case: { select: { id: true, title: true, stage: true } },
      assignedTo: { select: { id: true, name: true, role: true } },
      files: { select: { id: true, originalName: true, sizeBytes: true, createdAt: true } },
    },
  })
  return NextResponse.json(requests)
}
