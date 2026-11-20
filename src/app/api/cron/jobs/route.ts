import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { processDueJobs } from '@/lib/jobs'
import { getAuthContext, isPlatformSuperAdmin } from '@/lib/auth/workspace'

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const authHeader = req.headers.get('authorization') || ''
  const cronSecretHeader = req.headers.get('x-cron-secret') || ''
  return safeEqual(authHeader, `Bearer ${secret}`) || safeEqual(cronSecretHeader, secret)
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    const auth = await getAuthContext().catch(() => null)
    if (!auth || !isPlatformSuperAdmin(auth)) {
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
