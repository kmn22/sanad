import { NextRequest, NextResponse } from 'next/server'
import { processDueJobs } from '@/lib/jobs'
import { getAuthContext, hasRole } from '@/lib/auth/workspace'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV !== 'production'
  return (
    req.headers.get('authorization') === `Bearer ${secret}` ||
    req.headers.get('x-cron-secret') === secret ||
    req.nextUrl.searchParams.get('secret') === secret
  )
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    const auth = await getAuthContext().catch(() => null)
    if (!auth || !hasRole(auth, ['admin', 'workspace_owner'])) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 })
    }
  }
  try {
    const result = await processDueJobs()
    return NextResponse.json({ success: true, timestamp: new Date().toISOString(), result })
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
