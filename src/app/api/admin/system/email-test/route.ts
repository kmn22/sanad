import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { emailConfigured, publicAppUrl, sendTransactionalEmail } from '@/lib/email'
import { rateLimit } from '@/lib/rate-limit'
import { requestIp, writeAudit } from '@/lib/audit'
import { canManageUsers, forbiddenJson, getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function POST(req: Request) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  if (!canManageUsers(auth)) return forbiddenJson()
  if (!emailConfigured()) return NextResponse.json({ error: 'Email delivery is not configured' }, { status: 503 })
  const limited = await rateLimit(`admin-email-test:${auth.userId}`, 3, 60 * 60 * 1000)
  if (!limited.success) return NextResponse.json({ error: 'Too many attempts' }, { status: 429 })
  const user = await db.user.findUnique({ where: { id: auth.userId }, select: { email: true } })
  if (!user?.email) return NextResponse.json({ error: 'Account email is unavailable' }, { status: 400 })

  try {
    await sendTransactionalEmail({
      to: user.email,
      subject: 'Sanad SMTP test',
      heading: 'اختبار إعدادات البريد',
      text: 'تم إرسال هذه الرسالة للتحقق من إعدادات SMTP الخاصة بسند.',
      actionUrl: publicAppUrl('/admin'),
      actionLabel: 'فتح الإدارة',
    })
    await writeAudit({ workspaceId: auth.workspaceId, userId: auth.userId, action: 'admin.email_test', ipAddress: requestIp(req) })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('SMTP test failed:', error instanceof Error ? error.message : 'unknown error')
    await writeAudit({ workspaceId: auth.workspaceId, userId: auth.userId, action: 'admin.email_test_failed', ipAddress: requestIp(req) })
    return NextResponse.json({ error: 'Email delivery failed. Check SMTP configuration and provider logs.' }, { status: 502 })
  }
}
