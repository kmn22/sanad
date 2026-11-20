import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { clientIp, readJsonLimited } from '@/lib/http'
import { generateToken } from '@/lib/auth/tokens'
import { emailConfigured, publicAppUrl, sendTransactionalEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const ip = clientIp(req)
    if (ip !== 'unknown' && !(await rateLimit(`magic:ip:${ip}`, 10, 15 * 60 * 1000)).success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const body = await readJsonLimited<{ email?: string }>(req, 16 * 1024)
    const rawEmail = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!rawEmail || !rawEmail.includes('@') || !rawEmail.includes('.')) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 })
    }

    const token = generateToken()
    const magicUrl = publicAppUrl(`/login?magicToken=${encodeURIComponent(token)}&email=${encodeURIComponent(rawEmail)}`)

    const user = await db.user
      .findUnique({
        where: { email: rawEmail },
        select: { id: true, name: true, disabledAt: true },
      })
      .catch(() => null)

    let delivery: 'email' | 'manual' = 'manual'
    if (user && !user.disabledAt && emailConfigured()) {
      await sendTransactionalEmail({
        to: rawEmail,
        subject: 'رابط الدخول السحري (Magic Link) — مقر',
        heading: 'تسجيل الدخول الفوري بدون كلمة مرور',
        text: `مرحباً ${user.name || rawEmail}، اضغط على الزر أدناه للدخول المباشر والآمن إلى حسابك في منظومة «مقر». هذا الرابط صالح لمدة 15 دقيقة ولمرة واحدة فقط.`,
        actionUrl: magicUrl,
        actionLabel: 'تسجيل الدخول إلى مقر',
        badgeText: 'رابط الدخول السحري • Magic Link',
      })
      delivery = 'email'
    }

    return NextResponse.json({
      success: true,
      delivery,
      message: 'تم إرسال رابط الدخول السحري (Magic Link) إلى بريدك الإلكتروني بنجاح.',
      ...(process.env.NODE_ENV !== 'production' ? { devMagicUrl: magicUrl } : {}),
    })
  } catch {
    return NextResponse.json(
      { error: 'تعذر إرسال رابط الدخول السحري حالياً. يرجى المحاولة لاحقاً.' },
      { status: 500 },
    )
  }
}
