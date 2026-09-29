import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { communicationWorkspaceWhere, getSessionWorkspaceId, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'

export async function GET(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const { searchParams } = new URL(req.url)
  const clientId = searchParams.get('clientId')
  const caseId = searchParams.get('caseId')

  const where: any = { AND: [communicationWorkspaceWhere(workspaceId)] }
  if (clientId) where.AND.push({ clientId })
  if (caseId) where.AND.push({ caseId })

  const communications = await db.communication.findMany({
    where,
    include: {
      client: { select: { id: true, name: true } },
      case: { select: { id: true, title: true } },
    },
    orderBy: { date: 'desc' },
    take: 100,
  })
  return NextResponse.json(communications)
}

export async function POST(req: NextRequest) {
  const workspaceId = await getSessionWorkspaceId()
  if (!workspaceId) return unauthorizedJson()
  const body = await req.json()
  if (body.clientId) {
    const client = await db.client.findFirst({ where: { id: body.clientId, workspaceId }, select: { id: true } })
    if (!client) return notFoundJson()
  }
  if (body.caseId) {
    const legalCase = await db.legalCase.findFirst({ where: { id: body.caseId, workspaceId }, select: { id: true } })
    if (!legalCase) return notFoundJson()
  }
  const c = await db.communication.create({
    data: {
      clientId: body.clientId || null,
      caseId: body.caseId || null,
      workspaceId,
      type: String(body.type || 'note'),
      direction: String(body.direction || 'outgoing'),
      subject: String(body.subject || ''),
      body: String(body.body || ''),
      date: body.date ? new Date(body.date) : new Date(),
      durationMin: body.durationMin || null,
    },
  })
  return NextResponse.json(c)
}
