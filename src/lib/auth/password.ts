import crypto from 'crypto'

/**
 * Hashes a plaintext password using standard scrypt with a unique random 16-byte salt.
 * Formats as `salt:derivedKeyHex`.
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex')
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${derivedKey}`
}

/**
 * Cryptographically verifies a plaintext password against a stored `salt:derivedKeyHex` hash
 * using constant-time comparison to protect against timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.includes(':')) return false
    const [salt, key] = storedHash.split(':')
    const keyBuffer = Buffer.from(key, 'hex')
    const derivedKey = crypto.scryptSync(password, salt, 64)
    return crypto.timingSafeEqual(keyBuffer, derivedKey)
  } catch {
    return false
  }
}
