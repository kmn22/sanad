import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const subject = req.nextUrl.searchParams.get('subject')
  const cases = await db.caseEntry.findMany({
    where: { workspaceId, ...(subject ? { subject } : {}) },
    orderBy: { rating: 'desc' },
  })
  return NextResponse.json(cases)
}

export async function POST(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const body = await req.json()
  const entry = await db.caseEntry.create({ data: { ...body, id: undefined, workspaceId } })
  return NextResponse.json(entry, { status: 201 })
}
