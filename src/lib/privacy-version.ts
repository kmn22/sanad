/**
 * Client-safe privacy notice version.
 *
 * Kept in its own module with no `node:crypto` import so that both server code
 * (`@/lib/compliance`) and client components can import the exact same value.
 * Bumping this single constant updates the enforcement in `proxy.ts`, the hash
 * in `privacyNoticeHash`, and the value the registration form submits.
 */
export const PRIVACY_NOTICE_VERSION = '2026-09-28'
