import { describe, it, expect } from 'vitest'
import { ANALYTICS_EVENTS } from '../src/lib/analytics/events'
import { runDeterministicClauseRules } from '../src/lib/ai/clause-checker'
import { buildDeterministicContractSummary, SAMPLE_SUPPLY_CONTRACT_TEXT } from '../src/lib/ai/contract-summarizer'

describe('Repositioning Architecture & Analytics', () => {
  it('defines the required wedge analytics events', () => {
    expect(ANALYTICS_EVENTS.CLAUSE_CHECK_STARTED).toBe('clause_check_started')
    expect(ANALYTICS_EVENTS.CLAUSE_CHECK_COMPLETED).toBe('clause_check_completed')
    expect(ANALYTICS_EVENTS.WAITLIST_JOINED).toBe('waitlist_joined')
  })

  it('validates email format properly for waitlist submissions', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test('lawyer@firm.sa')).toBe(true)
    expect(emailRegex.test('ahmed@sanad.sa')).toBe(true)
    expect(emailRegex.test('invalid-email')).toBe(false)
    expect(emailRegex.test('@sanad.sa')).toBe(false)
    expect(emailRegex.test('user@')).toBe(false)
  })

  it('flags Saudi Labor Law Art. 83 non-compete violations and passes compliant clauses', () => {
    const bad = runDeterministicClauseRules(
      'يلتزم الطرف الثاني بعدم العمل لدى أي منافس داخل المملكة العربية السعودية لمدة خمس سنوات بعد انتهاء العقد.',
    )
    expect(bad.valid).toBe(false)
    expect(bad.article).toContain('83')
    expect(bad.matchedRule).toBe(true)

    const good = runDeterministicClauseRules(
      'يلتزم الطرف الثاني بعدم منافسة الطرف الأول في نشاط المقاولات داخل مدينة الرياض لمدة سنة واحدة.',
    )
    expect(good.valid).toBe(true)
    expect(good.score).toBeGreaterThanOrEqual(90)
  })

  it('flags Saudi Labor Law Art. 53 probation and Civil Transactions Art. 179 penalty waivers', () => {
    const probation = runDeterministicClauseRules('تحدد فترة التجربة بستة أشهر (180 يوماً) من تاريخ المباشرة.')
    expect(probation.valid).toBe(false)
    expect(probation.article).toContain('53')

    const penalty = runDeterministicClauseRules('غرامة قطعية ولا يحق للقضاء التدخل بتعديلها.')
    expect(penalty.valid).toBe(false)
    expect(penalty.article).toContain('179')

    const deduction = runDeterministicClauseRules('يحق لصاحب العمل حسم 70% من أجر العامل الشهري دون موافقة كتابية.')
    expect(deduction.valid).toBe(false)
    expect(deduction.article).toContain('92')

    const passport = runDeterministicClauseRules('يلتزم العامل بتسليم جواز السفر لصاحب العمل طوال مدة العقد.')
    expect(passport.valid).toBe(false)
    expect(passport.article).toContain('61')
  })

  it('summarizes contracts into structured clauses, obligations, durations, and risk alerts', () => {
    const sample = buildDeterministicContractSummary(SAMPLE_SUPPLY_CONTRACT_TEXT)
    expect(sample.clauses.length).toBe(6)
    expect(sample.executiveSummary.attentionCount).toBe(3)
    expect(sample.executiveSummary.alerts.length).toBe(3)

    const custom = buildDeterministicContractSummary(
      'عقد خدمات استشارية\nيتجدد العقد تلقائياً ما لم يشعر أحد الطرفين قبل 60 يوماً.\nتفرض غرامة قطعية دون حد أعلى عند التأخير.',
    )
    expect(custom.isSample).toBe(false)
    expect(custom.executiveSummary.attentionCount).toBeGreaterThanOrEqual(2)
    expect(custom.durationsAndNotices[0]?.value).toContain('60')
  })
})
