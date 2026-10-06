import { NextRequest, NextResponse } from 'next/server'
import { getClientContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { createClientCaseSession } from '@/lib/client-portal'
import { rateLimit } from '@/lib/rate-limit'

// POST { caseId?: string } → { url } — opens the full case workspace for a
// logged-in client via a short-lived, single-purpose portal token.
export async function POST(req: NextRequest) {
  const ctx = await getClientContext()
  if (!ctx) return unauthorizedJson()
  const limited = await rateLimit(`client-session:${ctx.userId}`, 30, 60 * 60 * 1000)
  if (!limited.success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

  const body = await req.json().catch(() => null)
  const caseId = typeof body?.caseId === 'string' && body.caseId ? body.caseId : null
  const token = await createClientCaseSession(ctx, caseId)
  if (!token) return notFoundJson()
  return NextResponse.json({ url: `/portal/${token}` })
}
