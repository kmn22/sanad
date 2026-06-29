import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createCreateHandler } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const subject = searchParams.get('subject')
  const where = subject ? { subject } : {}
  const cases = await db.caseEntry.findMany({ where, orderBy: { rating: 'desc' } })
  return NextResponse.json(cases)
}

export const POST = createCreateHandler('caseEntry')
