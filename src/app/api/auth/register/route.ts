import { createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth/password'
import { rateLimit } from '@/lib/rate-limit'
import { PRIVACY_NOTICE_VERSION, privacyNoticeHash } from '@/lib/compliance'

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex')

function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || req.headers.get('x-real-ip')?.trim() || 'unknown'
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req)
    if (ip !== 'unknown' && !(await rateLimit(`register:ip:${ip}`, 10, 15 * 60 * 1000)).success) {
      return NextResponse.json({ error: 'Too many registration attempts. Please try again later.' }, { status: 429 })
    }

    const { name, email, password, inviteToken, privacyNoticeVersion, acceptPrivacy } = await req.json()
    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير صالح' }, { status: 400 })
    }
    const cleanEmail = email.toLowerCase().trim()
    if (!(await rateLimit(`register:email:${cleanEmail}`, 3, 60 * 60 * 1000)).success) {
      return NextResponse.json({ error: 'Too many registration attempts for this email. Please try again later.' }, { status: 429 })
    }
    if (typeof password !== 'string' || password.length < 12 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json({ error: 'كلمة المرور يجب أن تكون 12 خانة على الأقل وتحتوي على حروف وأرقام' }, { status: 400 })
    }
    if (typeof inviteToken !== 'string' || !/^[a-f0-9]{64}$/i.test(inviteToken)) {
      return NextResponse.json({ error: 'A valid invitation is required' }, { status: 403 })
    }
    if (acceptPrivacy !== true || privacyNoticeVersion !== PRIVACY_NOTICE_VERSION) {
      return NextResponse.json({ error: 'Current privacy notice acceptance is required' }, { status: 400 })
    }

    const invitation = await db.invitation.findUnique({ where: { tokenHash: hashToken(inviteToken) } })
    if (!invitation || invitation.email.toLowerCase() !== cleanEmail || invitation.acceptedAt || invitation.expiresAt <= new Date()) {
      return NextResponse.json({ error: 'Invitation is invalid or expired' }, { status: 403 })
    }
    if (await db.user.findUnique({ where: { email: cleanEmail }, select: { id: true } })) {
      return NextResponse.json({ error: 'هذا البريد الإلكتروني مسجل بالفعل.' }, { status: 409 })
    }

    const newUser = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          name: typeof name === 'string' ? name.trim().slice(0, 100) : cleanEmail.split('@')[0],
          password: hashPassword(password),
          role: invitation.role,
          workspaceId: invitation.workspaceId,
          emailVerified: new Date(),
          privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        },
      })
      await tx.invitation.update({ where: { id: invitation.id }, data: { acceptedAt: new Date() } })
      const notice = await tx.privacyNotice.upsert({
        where: { version_locale: { version: PRIVACY_NOTICE_VERSION, locale: 'ar' } },
        create: { version: PRIVACY_NOTICE_VERSION, locale: 'ar', contentHash: privacyNoticeHash('ar') },
        update: {},
      })
      await tx.privacyAcceptance.create({
        data: { userId: user.id, noticeId: notice.id, ipAddress: ip, userAgent: req.headers.get('user-agent')?.slice(0, 500) },
      })
      await tx.auditLog.create({
        data: { workspaceId: invitation.workspaceId, userId: user.id, action: 'auth.register', entityType: 'User', entityId: user.id, ipAddress: ip },
      })
      await tx.notification.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId: user.id,
          type: 'system',
          title: 'مرحباً بك في سند',
          message: 'اكتمل إعداد حسابك وتم ربطه بمساحة العمل.',
          link: '/dashboard',
        },
      })
      return user
    })

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء الحساب ويمكنك تسجيل الدخول الآن.',
      user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, workspaceId: newUser.workspaceId },
    }, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'تعذر إتمام التسجيل في الوقت الحالي. يرجى المحاولة لاحقاً.' }, { status: 500 })
  }
}
