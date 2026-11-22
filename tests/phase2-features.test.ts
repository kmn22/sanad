import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  normalizeSaudiPhone,
  buildWhatsAppShareUrl,
  buildPortalWhatsAppMessage,
  buildFeeStatementWhatsAppMessage,
} from '../src/lib/whatsapp'
import { formatDualHijriGregorian } from '../src/lib/dates'
import { isMoyasarConfigured, verifyMoyasarWebhookSecret } from '../src/lib/payments/moyasar'
import { runDeterministicClauseRules } from '../src/lib/ai/clause-checker'
import { hashPassword, verifyPassword } from '../src/lib/auth/password'

describe('Phase 2 — Saudi WhatsApp Phone Normalization & Deep Links', () => {
  it('normalizes Saudi phone formats to 9665XXXXXXXX', () => {
    expect(normalizeSaudiPhone('0501234567')).toBe('966501234567')
    expect(normalizeSaudiPhone('501234567')).toBe('966501234567')
    expect(normalizeSaudiPhone('+966 50 123 4567')).toBe('966501234567')
    expect(normalizeSaudiPhone('00966501234567')).toBe('966501234567')
    expect(normalizeSaudiPhone('9660501234567')).toBe('966501234567')
    expect(normalizeSaudiPhone('')).toBeNull()
    expect(normalizeSaudiPhone(null)).toBeNull()
  })

  it('builds wa.me share URLs with or without a recipient phone', () => {
    const withPhone = buildWhatsAppShareUrl({
      phone: '0551112233',
      text: 'مرحباً بك في بوابة مقر',
    })
    expect(withPhone).toContain('https://wa.me/966551112233?text=')

    const withoutPhone = buildWhatsAppShareUrl({
      phone: null,
      text: 'رابط البوابة',
    })
    expect(withoutPhone).toContain('https://wa.me/?text=')
  })

  it('formats Arabic portal and fee-statement WhatsApp messages cleanly', () => {
    const portalMsg = buildPortalWhatsAppMessage({
      clientName: 'سارة عبد الله',
      workspaceName: 'مكتب خالد النعيمي',
      caseTitle: 'قضية عمالية',
      portalUrl: 'https://maqar.sa/portal/abc',
    })
    expect(portalMsg).toContain('سارة عبد الله')
    expect(portalMsg).toContain('مكتب خالد النعيمي')
    expect(portalMsg).toContain('https://maqar.sa/portal/abc')

    const invMsg = buildFeeStatementWhatsAppMessage({
      clientName: 'سارة عبد الله',
      invoiceNumber: 'INV-2026-01',
      totalFormatted: '2,875 ر.س',
      dueDateLabel: '15 أكتوبر 2026',
    })
    expect(invMsg).toContain('INV-2026-01')
    expect(invMsg).toContain('2,875 ر.س')
  })
})

describe('Phase 2 — Dual Hijri (Umm al-Qura) & Gregorian Date Formatting', () => {
  it('returns both Gregorian and Hijri representations for valid dates', () => {
    const dual = formatDualHijriGregorian(new Date('2026-10-15T09:00:00Z'), 'ar')
    expect(dual.gregorian).toBeTruthy()
    expect(dual.hijri).toBeTruthy()
    expect(dual.combined).toContain('(')
  })

  it('handles null or invalid dates gracefully', () => {
    expect(formatDualHijriGregorian(null).combined).toBe('—')
    expect(formatDualHijriGregorian('not-a-date').combined).toBe('—')
  })
})

describe('Phase 2 — Moyasar Payment Gateway Config & Webhook Security', () => {
  const originalSecret = process.env.MOYASAR_SECRET_KEY
  const originalWebhook = process.env.MOYASAR_WEBHOOK_SECRET

  beforeEach(() => {
    delete process.env.MOYASAR_SECRET_KEY
    delete process.env.MOYASAR_WEBHOOK_SECRET
  })

  afterEach(() => {
    if (originalSecret !== undefined) process.env.MOYASAR_SECRET_KEY = originalSecret
    else delete process.env.MOYASAR_SECRET_KEY
    if (originalWebhook !== undefined) process.env.MOYASAR_WEBHOOK_SECRET = originalWebhook
    else delete process.env.MOYASAR_WEBHOOK_SECRET
  })

  it('reports unconfigured when MOYASAR_SECRET_KEY is absent and verifies webhook secret in constant time', () => {
    expect(isMoyasarConfigured()).toBe(false)
    process.env.MOYASAR_SECRET_KEY = 'sk_test_moyasar_valid_secret_key'
    expect(isMoyasarConfigured()).toBe(true)

    process.env.MOYASAR_WEBHOOK_SECRET = 'whsec_maqar_2026_secret'
    expect(verifyMoyasarWebhookSecret('whsec_maqar_2026_secret')).toBe(true)
    expect(verifyMoyasarWebhookSecret('wrong_secret')).toBe(false)
    expect(verifyMoyasarWebhookSecret(null)).toBe(false)
  })
})

describe('Phase 2 — Expanded 12-Rule Saudi Statutory Contract Clause Checker', () => {
  it('flags end-of-service gratuity waivers (Art. 8 & 84), unpaid overtime (Art. 107), annual leave < 21d (Art. 109), auto-renewal traps, and foreign jurisdiction', () => {
    const eosWaiver = runDeterministicClauseRules('يتنازل الطرف الثاني مسبقاً عن مكافأة نهاية الخدمة عند انتهاء العقد.')
    expect(eosWaiver.valid).toBe(false)
    expect(eosWaiver.status).toBe('flagged')
    expect(eosWaiver.article).toContain('84')

    const unpaidOvertime = runDeterministicClauseRules('يلتزم العامل بأداء ساعات العمل الإضافية دون أجر إضافي أو تعويض.')
    expect(unpaidOvertime.valid).toBe(false)
    expect(unpaidOvertime.status).toBe('flagged')
    expect(unpaidOvertime.article).toContain('107')

    const shortLeave = runDeterministicClauseRules('يستحق العامل إجازة سنوية مدتها 14 يوماً فقط في السنة.')
    expect(shortLeave.valid).toBe(false)
    expect(shortLeave.status).toBe('flagged')
    expect(shortLeave.article).toContain('109')

    const autoRenew = runDeterministicClauseRules('يتجدد تلقائياً لمدة سنة ما لم يخطر الطرف الآخر قبل 120 يوماً مع غرامة عدم التجديد.')
    expect(autoRenew.valid).toBe(false)
    expect(autoRenew.status).toBe('flagged')

    const foreignCourts = runDeterministicClauseRules('تختص محاكم لندن بالفصل في أي نزاع ينشأ عن هذا العقد وتطبق قوانين دولة أجنبية.')
    expect(foreignCourts.valid).toBe(false)
    expect(foreignCourts.status).toBe('flagged')
  })
})

describe('Phase 2 — Multi-Hash & Whitespace-Trimmed Password Verification', () => {
  it('verifies comma-separated password hashes and trims accidental paste whitespace', () => {
    const h1 = hashPassword('OriginalSavedPass2026!')
    const h2 = hashPassword('KhaledMaqar2026!')
    const combined = `${h1},${h2}`

    expect(verifyPassword('OriginalSavedPass2026!', combined)).toBe(true)
    expect(verifyPassword('KhaledMaqar2026!', combined)).toBe(true)
    expect(verifyPassword('  KhaledMaqar2026! \t', combined)).toBe(true)
    expect(verifyPassword('WrongPassword2026!', combined)).toBe(false)
  })
})
