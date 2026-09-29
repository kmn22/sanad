import { createHash } from 'crypto'
import { PRIVACY_NOTICE_VERSION } from '@/lib/privacy-version'

// Re-exported so existing server imports from '@/lib/compliance' keep working.
export { PRIVACY_NOTICE_VERSION }

export const CONTROLLER_NAME_AR = 'سند'
export const CONTROLLER_NAME_EN = 'Sanad'
export const PRIVACY_CONTACT_EMAIL = 'ahmed@sanad.sa'

export function privacyNoticeHash(locale: 'ar' | 'en') {
  return createHash('sha256')
    .update(`${PRIVACY_NOTICE_VERSION}:${locale}:${CONTROLLER_NAME_AR}:${PRIVACY_CONTACT_EMAIL}`)
    .digest('hex')
}

export function requestDeadline(receivedAt = new Date()) {
  return new Date(receivedAt.getTime() + 30 * 24 * 60 * 60 * 1000)
}

export function breachNotificationDeadline(awareAt: Date) {
  return new Date(awareAt.getTime() + 72 * 60 * 60 * 1000)
}
