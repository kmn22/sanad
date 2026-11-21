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
export function isStrongPassword(password: string): boolean {
  return password.length >= 12 && /[A-Za-z]/.test(password) && /\d/.test(password)
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.includes(':')) return false
    const candidates = password.trim() && password.trim() !== password ? [password, password.trim()] : [password]
    for (const entry of storedHash.split(',')) {
      const trimmedEntry = entry.trim()
      if (!trimmedEntry.includes(':')) continue
      const [salt, key] = trimmedEntry.split(':')
      if (!salt || !key) continue
      const keyBuffer = Buffer.from(key, 'hex')
      for (const candidate of candidates) {
        const derivedKey = crypto.scryptSync(candidate, salt, 64)
        if (keyBuffer.length === derivedKey.length && crypto.timingSafeEqual(keyBuffer, derivedKey)) {
          return true
        }
      }
    }
    return false
  } catch {
    return false
  }
}
