import { describe, it, expect } from 'vitest'
import { isAcademicEmail, getAcademicInstitutionName, SAUDI_ACADEMIC_DOMAINS } from '../src/lib/auth/academic'

describe('Academic Email Verification (F-13: Verified Student Tier)', () => {
  it('correctly identifies Saudi university domains (.edu.sa)', () => {
    expect(isAcademicEmail('student@ksu.edu.sa')).toBe(true)
    expect(isAcademicEmail('ahmed@kau.edu.sa')).toBe(true)
    expect(isAcademicEmail('sara@pnu.edu.sa')).toBe(true)
    expect(isAcademicEmail('lawyer@imamu.edu.sa')).toBe(true)
    expect(isAcademicEmail('student@unknown-college.edu.sa')).toBe(true)
  })

  it('identifies international academic domains (.edu)', () => {
    expect(isAcademicEmail('researcher@harvard.edu')).toBe(true)
    expect(isAcademicEmail('student@mit.edu')).toBe(true)
  })

  it('rejects commercial and generic consumer email providers', () => {
    expect(isAcademicEmail('user@gmail.com')).toBe(false)
    expect(isAcademicEmail('lawyer@hotmail.com')).toBe(false)
    expect(isAcademicEmail('consultant@yahoo.com')).toBe(false)
    expect(isAcademicEmail('partner@firm.sa')).toBe(false)
    expect(isAcademicEmail('')).toBe(false)
    expect(isAcademicEmail('not-an-email')).toBe(false)
  })

  it('resolves Saudi institution names accurately', () => {
    expect(getAcademicInstitutionName('student@ksu.edu.sa')).toBe('جامعة الملك سعود')
    expect(getAcademicInstitutionName('student@kau.edu.sa')).toBe('جامعة الملك عبد العزيز')
    expect(getAcademicInstitutionName('student@pnu.edu.sa')).toBe('جامعة الأميرة نورة بنت عبد الرحمن')
    expect(getAcademicInstitutionName('student@imamu.edu.sa')).toBe('جامعة الإمام محمد بن سعود الإسلامية')
    expect(getAcademicInstitutionName('student@other.edu.sa')).toBe('جامعة سعودية معتمدة')
    expect(getAcademicInstitutionName('student@mit.edu')).toBe('مؤسسة أكاديمية معتمدة')
    expect(getAcademicInstitutionName('student@gmail.com')).toBeNull()
  })

  it('maintains a comprehensive list of major Saudi university domains', () => {
    expect(SAUDI_ACADEMIC_DOMAINS.length).toBeGreaterThanOrEqual(15)
    expect(SAUDI_ACADEMIC_DOMAINS).toContain('ksu.edu.sa')
    expect(SAUDI_ACADEMIC_DOMAINS).toContain('kau.edu.sa')
    expect(SAUDI_ACADEMIC_DOMAINS).toContain('kfupm.edu.sa')
  })
})
