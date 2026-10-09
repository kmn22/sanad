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

  it('rejects files whose content does not match their extension', () => {
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])
    expect(validateUpload('renamed.pdf', 'application/pdf', jpeg)).toMatch(/does not match its extension/i)
    expect(validateUpload('archive.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', jpeg)).toMatch(/does not match its extension/i)
    expect(validateUpload('scan.png', 'image/png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]))).toBeNull()
    expect(validateUpload('report.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14]))).toBeNull()
  })

  it('rejects binary payloads disguised as text and accepts UTF-16 text', () => {
    expect(validateUpload('notes.txt', 'text/plain', Buffer.from('plain text'))).toBeNull()
    expect(validateUpload('notes.txt', 'text/plain', Buffer.concat([Buffer.from('MZ'), Buffer.alloc(32)]))).toMatch(/binary content|Executable/i)
    expect(validateUpload('notes.txt', 'text/plain', Buffer.from([0xff, 0xfe, 0x41, 0x00, 0x42, 0x00]))).toBeNull()
  })

  it('rejects Mach-O executables regardless of extension', () => {
    expect(validateUpload('photo.png', 'image/png', Buffer.from([0xfe, 0xed, 0xfa, 0xce, 0x00, 0x01]))).toMatch(/Executable/i)
    expect(validateUpload('photo.png', 'image/png', Buffer.from([0xcf, 0xfa, 0xed, 0xfe, 0x00, 0x01]))).toMatch(/Executable/i)
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

describe('portal API actions (F-08 & F-09)', () => {
  it('rejects payment, signing, and OTP actions without configured providers', async () => {
    process.env.ENABLE_DEMO_PORTAL = 'true'
    const { POST } = await import('../src/app/api/portal/[token]/route')
    const { NextRequest } = await import('next/server')

    // 1. Pay invoice action
    const payReq = new NextRequest('http://localhost:3000/api/portal/demo-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'pay_invoice', invoiceId: 'inv-demo-1', paymentMethod: 'mada' }),
    })
    const payRes = await POST(payReq, { params: Promise.resolve({ token: 'demo-token' }) })
    expect(payRes.status).toBe(503)
    const payData = await payRes.json()
    expect(payData.code).toBe('PAYMENT_PROVIDER_NOT_CONFIGURED')

    // 2. Sign document action
    const signReq = new NextRequest('http://localhost:3000/api/portal/demo-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'sign_document',
        documentId: 'doc-demo-1',
        signerName: 'سارة عبد الله',
        stepUpOtp: '1234',
      }),
    })
    const signRes = await POST(signReq, { params: Promise.resolve({ token: 'demo-token' }) })
    expect(signRes.status).toBe(503)
    const signData = await signRes.json()
    expect(signData.code).toBe('SIGNATURE_PROVIDER_NOT_CONFIGURED')

    // 3. OTP verification action
    const otpReq = new NextRequest('http://localhost:3000/api/portal/demo-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify_otp', code: '9876' }),
    })
    const otpRes = await POST(otpReq, { params: Promise.resolve({ token: 'demo-token' }) })
    expect(otpRes.status).toBe(503)
    const otpData = await otpRes.json()
    expect(otpData.code).toBe('OTP_PROVIDER_NOT_CONFIGURED')
  })
})


