import crypto from 'crypto'

/**
 * Time-to-live constants for all token types, in milliseconds.
 */
export const TOKEN_TTL = {
  /** Password-reset links are valid for 1 hour. */
  passwordReset: 60 * 60 * 1000,
  /** Email verification tokens are valid for 24 hours. */
  emailVerification: 24 * 60 * 60 * 1000,
  /** Team invitation tokens are valid for 7 days. */
  invitation: 7 * 24 * 60 * 60 * 1000,
} as const

/**
 * Generates a cryptographically secure, URL-safe 32-byte token.
 * Store the hash (via `hashToken`) — never the raw token.
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Returns the SHA-256 hex digest of the token, which is what gets stored in the DB.
 * Hashing prevents token exposure if the database is compromised.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Returns a `Date` that is `ttlMs` milliseconds in the future.
 * Use as the `expiresAt` value when creating a token record.
 */
export function expiresIn(ttlMs: number): Date {
  return new Date(Date.now() + ttlMs)
}
