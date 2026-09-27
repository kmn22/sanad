import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET() {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const items = await db.complianceItem.findMany({ where: { workspaceId }, orderBy: { expiryDate: 'asc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const body = await req.json()
  const item = await db.complianceItem.create({ data: { ...body, workspaceId } })
  return NextResponse.json(item)
}
