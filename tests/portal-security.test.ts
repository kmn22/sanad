import { describe, expect, it } from 'vitest'
import { MAX_UPLOAD_BYTES, sanitizeFilename, validateUpload } from '../src/lib/file-storage'
import { canAccessPortal, homePathFor, isReadOnlyRole, portalForPath } from '../src/lib/auth/portals'
import { hashPortalToken } from '../src/lib/portal'
import { GLOSSARY_ITEMS, translateToClientWording, getGlossaryExplanation } from '../src/lib/portal-glossary'

const pdf = Buffer.from('%PDF-1.7\nexample')

describe('portal access boundaries', () => {
  it('routes each account type to its own portal', () => {
    expect(homePathFor('workspace_owner')).toBe('/firm')
    expect(homePathFor('lawyer')).toBe('/lawyer')
    expect(homePathFor('student')).toBe('/student')
    expect(homePathFor('client')).toBe('/client')
  })

  it('prevents clients and students from entering practice portals', () => {
    expect(canAccessPortal('client', 'lawyer')).toBe(false)
    expect(canAccessPortal('client', 'firm')).toBe(false)
    expect(canAccessPortal('student', 'lawyer')).toBe(false)
    expect(canAccessPortal('workspace_owner', 'firm')).toBe(true)
  })

  it('recognizes only complete portal path segments', () => {
    expect(portalForPath('/client/cases')).toBe('client')
    expect(portalForPath('/client-data')).toBeNull()
    expect(isReadOnlyRole('auditor')).toBe(true)
  })
})

describe('portal token and upload security', () => {
  it('hashes tokens deterministically without storing the raw value', () => {
    const token = 'a'.repeat(64)
    expect(hashPortalToken(token)).toHaveLength(64)
    expect(hashPortalToken(token)).not.toBe(token)
    expect(hashPortalToken(token)).toBe(hashPortalToken(token))
  })

  it('sanitizes traversal and unsafe filename characters', () => {
    expect(sanitizeFilename('../../contract<script>.pdf')).toBe('contract-script-.pdf')
  })

  it('accepts allowed documents and rejects executable content', () => {
    expect(validateUpload('evidence.pdf', 'application/pdf', pdf)).toBeNull()
    expect(validateUpload('evidence.exe', 'application/octet-stream', Buffer.from('MZpayload'))).toMatch(/not allowed/i)
    expect(validateUpload('evidence.pdf', 'application/pdf', Buffer.from('MZpayload'))).toMatch(/Executable/i)
  })

  it('enforces the upload size boundary', () => {
    expect(validateUpload('large.pdf', 'application/pdf', Buffer.alloc(MAX_UPLOAD_BYTES + 1))).toMatch(/10 MB/i)
  })
})

describe('portal zero-jargon glossary (Client-Portal-UX-Spec Section 05)', () => {
  it('contains all 8 required glossary mappings with explanations', () => {
    expect(GLOSSARY_ITEMS).toHaveLength(8)
    const terms = GLOSSARY_ITEMS.map((item) => item.term)
    expect(terms).toContain('الجلسة')
    expect(terms).toContain('المدة النظامية')
    expect(terms).toContain('المذكرة')
    expect(terms).toContain('حكم ابتدائي')
    expect(terms).toContain('اعتراض')
    expect(terms).toContain('إحالة')
    expect(terms).toContain('أتعاب المحامي')
    expect(terms).toContain('قيد الإجراء')
  })

  it('translates formal terms into client-friendly spoken Arabic', () => {
    expect(translateToClientWording('الجلسة')).toBe('موعدك أمام القاضي')
    expect(translateToClientWording('المدة النظامية')).toBe('موعد نهائي قانوني لا يمكن تجاوزه')
    expect(translateToClientWording('المذكرة')).toBe('وثيقة قانونية أعدّها محاميك')
    expect(translateToClientWording('حكم ابتدائي')).toBe('قرار المحكمة الأول في قضيتك')
    expect(translateToClientWording('اعتراض')).toBe('طلب إعادة النظر في القرار')
    expect(translateToClientWording('إحالة')).toBe('تحويل قضيتك إلى الجهة المختصة')
    expect(translateToClientWording('أتعاب المحامي')).toBe('رسوم الخدمة القانونية')
    expect(translateToClientWording('قيد الإجراء')).toBe('قضيتك مستمرة — لا يوجد مطلوب منك حالياً')
  })

  it('returns original term safely if not in glossary', () => {
    expect(translateToClientWording('مصطلح غير معروف')).toBe('مصطلح غير معروف')
    expect(getGlossaryExplanation('غير معروف')).toBeUndefined()
    expect(getGlossaryExplanation('الجلسة')).toBeDefined()
  })
})

