import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { caseSchema } from '@/lib/validations'

export async function GET() {
  const cases = await db.legalCase.findMany({ orderBy: { updatedAt: 'desc' }, include: { timeEntries: true } })
  return NextResponse.json(cases)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = caseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const c = await db.legalCase.create({ data: parsed.data })
  return NextResponse.json(c)
}
