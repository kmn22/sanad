import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { termSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const where = q ? { term: { contains: q } } : {}
  const terms = await db.legalTerm.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(terms)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = termSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', details: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const t = await db.legalTerm.create({ data: parsed.data })
  return NextResponse.json(t)
}
