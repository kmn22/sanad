import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { readJsonLimited, RequestError, safeErrorResponse } from '@/lib/http'

// DailyBrief is platform-wide content visible to every workspace — reads are
// authenticated, but publishing is restricted to platform admins.
const briefSchema = z.object({
  title: z.string().min(1).max(200),
  summary: z.string().min(1).max(4000),
  source: z.string().min(1).max(50),
  category: z.string().min(1).max(50),
  url: z.string().url().max(2000).optional().nullable(),
  publishedAt: z.string().optional().nullable().transform((v) => (v ? new Date(v) : undefined)),
})

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const briefs = await db.dailyBrief.findMany({ orderBy: { publishedAt: 'desc' }, take: 12 })
  return NextResponse.json(briefs)
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    if (auth.role !== 'admin') return forbiddenJson()

    const body = await readJsonLimited(req)
    const parsed = briefSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.issues }, { status: 400 })
    }
    if (parsed.data.publishedAt && Number.isNaN(parsed.data.publishedAt.getTime())) {
      throw new RequestError('Invalid publishedAt date', 400)
    }
    const brief = await db.dailyBrief.create({ data: parsed.data })
    return NextResponse.json(brief, { status: 201 })
  } catch (error) {
    return safeErrorResponse(error, req, { route: 'POST /api/brief' })
  }
}
