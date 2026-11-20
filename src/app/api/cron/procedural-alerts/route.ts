import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { runDailyProceduralNotificationsWorker } from '@/services/procedural-notifications'
import { getAuthContext, hasRole, isPlatformSuperAdmin } from '@/lib/auth/workspace'
import { logError } from '@/lib/observability'

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB)
}

function verifyCronSecret(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization') || ''
  const cronSecretHeader = req.headers.get('x-cron-secret') || ''

  if (secret) {
    return safeEqual(authHeader, `Bearer ${secret}`) || safeEqual(cronSecretHeader, secret)
  }

  return false
}

export async function GET(req: NextRequest) {
  let tenantScope: { orgId: string; workspaceId: string } | undefined

  if (!verifyCronSecret(req)) {
    const auth = await getAuthContext().catch(() => null)
    if (!auth || (!hasRole(auth, ['admin', 'workspace_owner']) && !auth.isOwner)) {
      return NextResponse.json(
        { error: 'Unauthorized procedural cron invocation' },
        { status: 401 }
      )
    }
    if (!isPlatformSuperAdmin(auth)) {
      tenantScope = { orgId: auth.orgId, workspaceId: auth.workspaceId }
    }
  }

  try {
    const report = await runDailyProceduralNotificationsWorker(new Date(), tenantScope)
    return NextResponse.json({
      success: true,
      worker: 'maqar.procedural-notifications',
      report,
    })
  } catch (error) {
    logError(error, {
      req,
      msg: 'Failed executing daily procedural notifications worker',
      route: 'GET /api/cron/procedural-alerts',
    })
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal worker error',
      },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}

