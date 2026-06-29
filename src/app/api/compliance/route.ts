import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { complianceSchema } from '@/lib/validations'

export async function GET() {
  const items = await db.complianceItem.findMany({ orderBy: { expiryDate: 'asc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = complianceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const item = await db.complianceItem.create({ data: parsed.data })
  return NextResponse.json(item)
}
