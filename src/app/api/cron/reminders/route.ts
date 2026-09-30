import { NextRequest, NextResponse } from 'next/server'
import { runAutomatedReminders } from '@/lib/reminders'
import { getAuthContext } from '@/lib/auth/workspace'

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  const authHeader = req.headers.get('authorization')
  const cronSecretHeader = req.headers.get('x-cron-secret')
  const querySecret = req.nextUrl.searchParams.get('secret')

  if (secret) {
    if (authHeader === `Bearer ${secret}`) return true
    if (cronSecretHeader === secret) return true
    if (querySecret === secret) return true
    return false
  }

  // If CRON_SECRET is not configured in production, refuse access
  if (process.env.NODE_ENV === 'production') {
    return false
  }

  // In non-production or dev, allow if user is authenticated or dev environment
  return true
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    // Check if triggered by an authenticated admin/user
    const auth = await getAuthContext().catch(() => null)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 })
    }
  }

  try {
    const result = await runAutomatedReminders()
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    })
  } catch (error) {
    console.error('Error running automated reminders:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  return GET(req)
}
