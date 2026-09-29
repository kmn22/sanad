import { NextResponse, after } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { clientIp, readJsonLimited, safeErrorResponse } from '@/lib/http'
import { forgotPasswordSchema } from '@/lib/auth/schemas'
import { TOKEN_TTL, expiresIn, generateToken, hashToken } from '@/lib/auth/tokens'
import { emailConfigured, publicAppUrl, sendTransactionalEmail } from '@/lib/email'

/**
 * Issues a password-reset link. Always 200 for unknown addresses so the
 * endpoint can't be used to enumerate accounts.
 *
 * This is the endpoint `src/app/forgot-password/page.tsx` already posts to
 * (`{ email }`) — it must stay at this path.
 */
export async function POST(req: Request) {
  try {
    const ip = clientIp(req)
    if (ip !== 'unknown' && !(await rateLimit(`forgot:ip:${ip}`, 10, 15 * 60 * 1000)).success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    const parsed = forgotPasswordSchema.safeParse(await readJsonLimited<unknown>(req, 16 * 1024))
    if (!parsed.success) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 })
    }
    const email = parsed.data.email

    if (!(await rateLimit(`forgot:email:${email}`, 5, 60 * 60 * 1000)).success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 })
    }

    // Surface a real 503 when mail is down (the page already reports it) rather
    // than silently pretending a link was sent. Same for every request, so it
    // leaks nothing about whether an account exists.
    if (!emailConfigured()) {
      return NextResponse.json({ error: 'خدمة البريد غير مهيأة حالياً.' }, { status: 503 })
    }

    const user = await db.user.findUnique({
      where: { email },
      select: { id: true, name: true, disabledAt: true },
    })

    if (user && !user.disabledAt) {
      const token = generateToken()
      await db.$transaction([
        db.passwordResetToken.deleteMany({ where: { email } }),
        db.passwordResetToken.create({
          data: { tokenHash: hashToken(token), email, expiresAt: expiresIn(TOKEN_TTL.passwordReset) },
        }),
        db.auditLog.create({
          data: {
            workspaceId: null,
            userId: user.id,
            action: 'auth.password_reset_request',
            entityType: 'User',
            entityId: user.id,
            ipAddress: ip === 'unknown' ? undefined : ip,
          },
        }),
      ])

      // Dispatch after the response is flushed. An awaited SMTP round trip makes
      // requests for known addresses measurably slower than unknown ones, which
      // is a timing side-channel for account enumeration even though the body is
      // identical. `after()` keeps the send reliable but off the hot path.
      const recipient = email
      const recipientName = user.name || email
      const link = publicAppUrl(`/reset-password?token=${token}`)
      after(async () => {
        try {
          await sendTransactionalEmail({
            to: recipient,
            subject: 'إعادة تعيين كلمة المرور — سند',
            heading: 'إعادة تعيين كلمة المرور',
            text: `مرحباً ${recipientName}، طلبت إعادة تعيين كلمة المرور. الرابط صالح لمدة ساعة واحدة. إذا لم تطلب ذلك فتجاهل هذه الرسالة — كلمة مرورك لم تتغير.`,
            actionUrl: link,
            actionLabel: 'إعادة تعيين كلمة المرور',
          })
        } catch (mailError) {
          console.error('Password reset email failed:', mailError instanceof Error ? mailError.message : 'unknown error')
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'إذا كان البريد مسجلاً لدينا، فستصلك رسالة لإعادة تعيين كلمة المرور.',
    })
  } catch (error) {
    return safeErrorResponse(error)
  }
}
