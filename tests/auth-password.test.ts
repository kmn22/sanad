import { describe, it, expect } from 'vitest'
import { hashPassword, isStrongPassword, verifyPassword } from '../src/lib/auth/password'

describe('Cryptographic Password Hashing & Verification', () => {
  it('correctly hashes and verifies valid passwords', () => {
    const raw = 'SecureLegalPass2026!'
    const hash = hashPassword(raw)

    expect(hash).toContain(':')
    expect(hash.split(':').length).toBe(2)

    // Valid password must return true
    expect(verifyPassword(raw, hash)).toBe(true)
  })

  it('rejects wrong passwords and invalid hashes', () => {
    const raw = 'MyPassword123'
    const hash = hashPassword(raw)

    // Wrong password must return false
    expect(verifyPassword('WrongPassword', hash)).toBe(false)
    expect(verifyPassword('', hash)).toBe(false)

    // Corrupted hash must return false
    expect(verifyPassword(raw, 'invalid-hash')).toBe(false)
    expect(verifyPassword(raw, '')).toBe(false)
  })

  it('enforces the account password policy', () => {
    expect(isStrongPassword('StrongPass2026')).toBe(true)
    expect(isStrongPassword('short1A')).toBe(false)
    expect(isStrongPassword('onlyletterslong')).toBe(false)
    expect(isStrongPassword('123456789012')).toBe(false)
  })
})

describe('Cryptographic Tokens & TTL Policies', () => {
  it('generates secure unique 64-char hex tokens', async () => {
    const { generateToken, hashToken, expiresIn, TOKEN_TTL } = await import('../src/lib/auth/tokens')
    const t1 = generateToken()
    const t2 = generateToken()
    expect(t1).toHaveLength(64)
    expect(t2).toHaveLength(64)
    expect(t1).not.toBe(t2)

    const h1 = hashToken(t1)
    const h2 = hashToken(t1)
    expect(h1).toHaveLength(64)
    expect(h1).toBe(h2)
    expect(h1).not.toBe(t1)

    const before = Date.now()
    const expiry = expiresIn(TOKEN_TTL.passwordReset)
    expect(expiry.getTime()).toBeGreaterThanOrEqual(before + TOKEN_TTL.passwordReset)

    expect(TOKEN_TTL.portalMagicLink).toBe(72 * 60 * 60 * 1000)
    expect(TOKEN_TTL.portalOtp).toBe(10 * 60 * 1000)
    expect(TOKEN_TTL.portalSession).toBe(24 * 60 * 60 * 1000)
    expect(TOKEN_TTL.portalDeviceMemory).toBe(30 * 24 * 60 * 60 * 1000)
  })
})

