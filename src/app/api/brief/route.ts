import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const briefs = await db.dailyBrief.findMany({ orderBy: { publishedAt: 'desc' }, take: 12 })
  return NextResponse.json(briefs)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const b = await db.dailyBrief.create({ data: body })
  return NextResponse.json(b)
}
