import { NextResponse, after } from 'next/server'
import { db } from '@/lib/db'
import { rateLimit } from '@/lib/rate-limit'
import { clientIp, readJsonLimited, safeErrorResponse } from '@/lib/http'
import { forgotPasswordSchema } from '@/lib/auth/schemas'
import { TOKEN_TTL, expiresIn, generateToken, hashToken } from '@/lib/auth/tokens'
import { emailConfigured, publicAppUrl, sendTransactionalEmail } from '@/lib/email'
import { logError } from '@/lib/observability'

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

      const recipient = email
      const recipientName = user.name || email
      const link = publicAppUrl(`/reset-password?token=${token}`)
      if (emailConfigured()) {
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
            logError(mailError, { req, msg: 'Password reset email failed', route: 'POST /api/auth/password-reset/request' })
          }
        })
      }

      if (!emailConfigured() && process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          success: true,
          message: 'تم إنشاء رابط إعادة التعيين التجريبي.',
          devResetUrl: link,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'إذا كان البريد مسجلاً لدينا، فستصلك رسالة لإعادة تعيين كلمة المرور.',
    })
  } catch (error) {
    return safeErrorResponse(error, req, { route: 'POST /api/auth/password-reset/request' })
  }
}
