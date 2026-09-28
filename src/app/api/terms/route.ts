import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSessionWorkspaceId, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const q = req.nextUrl.searchParams.get('q')
  const terms = await db.legalTerm.findMany({
    where: { workspaceId, ...(q ? { term: { contains: q } } : {}) },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(terms)
}

export async function POST(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const body = await req.json()
  const term = await db.legalTerm.create({ data: { ...body, id: undefined, workspaceId } })
  return NextResponse.json(term, { status: 201 })
}
