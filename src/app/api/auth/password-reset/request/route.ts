import { createHash, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emailConfigured, publicAppUrl, sendTransactionalEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'

const hash = (value: string) => createHash('sha256').update(value).digest('hex')

export async function POST(req: Request) {
  if (!emailConfigured()) return NextResponse.json({ error: 'Email delivery is not configured' }, { status: 503 })
  const { email } = await req.json()
  const cleanEmail = typeof email === 'string' ? email.toLowerCase().trim() : ''
  if (!cleanEmail.includes('@')) return NextResponse.json({ success: true })
  if (!(await rateLimit(`password-reset:${cleanEmail}`, 3, 60 * 60 * 1000)).success) return NextResponse.json({ success: true })
  const user = await db.user.findUnique({ where: { email: cleanEmail }, select: { id: true } })
  if (user) {
    const token = randomBytes(32).toString('hex')
    await db.$transaction([
      db.passwordResetToken.deleteMany({ where: { email: cleanEmail, usedAt: null } }),
      db.passwordResetToken.create({ data: { tokenHash: hash(token), email: cleanEmail, expiresAt: new Date(Date.now() + 60 * 60 * 1000) } }),
    ])
    await sendTransactionalEmail({ to: cleanEmail, subject: 'إعادة تعيين كلمة مرور سند', heading: 'إعادة تعيين كلمة المرور', text: 'استخدم الرابط خلال ساعة واحدة. إذا لم تطلب ذلك فتجاهل الرسالة.', actionUrl: publicAppUrl(`/reset-password?token=${encodeURIComponent(token)}`), actionLabel: 'إعادة تعيين كلمة المرور' })
  }
  return NextResponse.json({ success: true })
}
