import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PRIVACY_NOTICE_VERSION, privacyNoticeHash } from '@/lib/compliance'
import { requestIp, writeAudit } from '@/lib/audit'
import { getAuthContext, unauthorizedJson } from '@/lib/auth/workspace'

export async function POST(req: Request) {
  const auth = await getAuthContext()
  if (!auth) return unauthorizedJson()
  const { version, accept } = await req.json()
  if (accept !== true || version !== PRIVACY_NOTICE_VERSION) return NextResponse.json({ error: 'Current notice acceptance is required' }, { status: 400 })
  await db.$transaction(async (tx) => {
    const notice = await tx.privacyNotice.upsert({ where: { version_locale: { version, locale: 'ar' } }, create: { version, locale: 'ar', contentHash: privacyNoticeHash('ar') }, update: {} })
    await tx.privacyAcceptance.upsert({ where: { userId_noticeId: { userId: auth.userId, noticeId: notice.id } }, create: { userId: auth.userId, noticeId: notice.id, ipAddress: requestIp(req), userAgent: req.headers.get('user-agent')?.slice(0, 500) }, update: {} })
    await tx.user.update({ where: { id: auth.userId }, data: { privacyNoticeVersion: version, sessionVersion: { increment: 1 } } })
  })
  await writeAudit({ workspaceId: auth.workspaceId, userId: auth.userId, action: 'privacy.notice.accept', entityType: 'PrivacyNotice', entityId: version, ipAddress: requestIp(req) })
  return NextResponse.json({ success: true, signInAgain: true })
}
