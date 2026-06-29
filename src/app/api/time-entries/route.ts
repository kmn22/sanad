import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { timeEntrySchema } from '@/lib/validations'

export async function GET() {
  const entries = await db.timeEntry.findMany({
    orderBy: { date: 'desc' },
    take: 50,
    include: { case: true },
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = timeEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const te = await db.timeEntry.create({ data: parsed.data })
  return NextResponse.json(te)
}
