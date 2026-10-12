import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { logError } from '@/lib/observability'

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', database: 'ok' })
  } catch (error) {
    logError(error, { route: 'GET /api/health' })
    return NextResponse.json(
      { status: 'error', database: 'unavailable' },
      { status: 503 }
    )
  }
}
