import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requestIp } from '@/lib/audit'
import { rateLimit } from '@/lib/rate-limit'
import { readJsonLimited, safeErrorResponse } from '@/lib/http'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  try {
    const body = await readJsonLimited<{ email?: unknown; interest?: unknown; source?: unknown }>(req, 16 * 1024)
    const rawEmail = typeof body.email === 'string' ? body.email.toLowerCase().trim().slice(0, 254) : ''
    const interest = typeof body.interest === 'string' && body.interest.trim() ? body.interest.trim().slice(0, 100) : 'general'
    const source = typeof body.source === 'string' && body.source.trim() ? body.source.trim().slice(0, 100) : 'landing'

    if (!rawEmail || !EMAIL_REGEX.test(rawEmail)) {
      return NextResponse.json({ error: 'الرجاء إدخال بريد إلكتروني صالح' }, { status: 400 })
    }

    const ip = requestIp(req)
    const [ipLimiter, emailLimiter] = await Promise.all([
      rateLimit(`waitlist:ip:${ip}`, 15, 60 * 60 * 1000),
      rateLimit(`waitlist:${rawEmail}`, 5, 60 * 60 * 1000),
    ])
    if (!ipLimiter.success || !emailLimiter.success) {
      return NextResponse.json({ error: 'طلبات متكررة، يرجى المحاولة لاحقاً' }, { status: 429 })
    }

    const entry = await db.waitlistEntry.upsert({
      where: { email: rawEmail },
      create: {
        email: rawEmail,
        interest,
        source,
      },
      update: {
        interest,
        source,
      },
      select: { id: true, email: true, createdAt: true },
    })

    return NextResponse.json({
      success: true,
      message: 'تم تسجيل اهتمامك بقائمة الانتظار بنجاح. سنوافيك بالتحديثات فور إطلاق الميزة.',
      entry,
    }, { status: 201 })
  } catch (error) {
    return safeErrorResponse(error, req, { route: 'POST /api/waitlist' })
  }
}
