import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'
import { readJsonLimited, safeErrorResponse } from '@/lib/http'
import { rateLimit } from '@/lib/rate-limit'

const feedbackSchema = z.object({
  type: z.enum(['bug', 'suggestion', 'question', 'other']).default('suggestion'),
  message: z.string().trim().min(5, 'الرسالة قصيرة جداً').max(4000),
  pagePath: z.string().trim().max(300).optional(),
})

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const items = await db.feedback.findMany({
    where: { workspaceId: auth.workspaceId, userId: auth.userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, type: true, message: true, status: true, adminNote: true, createdAt: true },
  })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()
    if (!(await rateLimit(`feedback:${auth.userId}`, 10, 60 * 60 * 1000)).success) {
      return NextResponse.json({ error: 'تم إرسال عدد كبير من الملاحظات. حاول لاحقاً.' }, { status: 429 })
    }
    const parsed = feedbackSchema.safeParse(await readJsonLimited(req, 16 * 1024))
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'بيانات غير صالحة' }, { status: 400 })
    }
    const item = await db.feedback.create({
      data: {
        workspaceId: auth.workspaceId,
        userId: auth.userId,
        ...parsed.data,
        userAgent: req.headers.get('user-agent')?.slice(0, 300) ?? null,
      },
      select: { id: true, type: true, status: true, createdAt: true },
    })
    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (error) {
    return safeErrorResponse(error, req, { route: 'POST /api/feedback' })
  }
}
