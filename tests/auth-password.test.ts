import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from '../src/lib/auth/password'

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
})
