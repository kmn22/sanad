import { describe, it, expect } from 'vitest'
import {
  stripTashkeel,
  normalizeArabic,
  tokenizeArabic,
  calculateNgramSimilarity,
  extractLegalCitations,
} from '../src/lib/ai/arabic-nlp'
import { SAUDI_STATUTES } from '../src/lib/ai/saudi-statutes'
import { buildRagPrompt } from '../src/lib/ai/rag-engine'

describe('Arabic Legal NLP & Normalization', () => {
  it('strips tashkeel, tanween, and kashida accurately', () => {
    const raw = 'نِظَامُ المَعَامَلَاتِ المَدَنِيَّةِ ــ م/191'
    const clean = stripTashkeel(raw)
    expect(clean).toBe('نظام المعاملات المدنية  م/191')
  })

  it('normalizes hamza, teh marbuta, and alef maksura variants', () => {
    const raw = 'إلزام الشَّرِكَةِ بدفعِ التَّعْوِيضِ لِلْمُدَّعِي أَو وَرَثَتِهِ'
    const normalized = normalizeArabic(raw)
    // إلزام -> الزام, الشركة -> الشركه, تعويض -> تعويض
    expect(normalized).toContain('الزام')
    expect(normalized).toContain('الشركه')
    expect(normalized).toContain('تعويض')
  })

  it('tokenizes text and removes non-legal stop words', () => {
    const query = 'ما هي شروط فسخ العقد في نظام المعاملات المدنية طبقاً للقانون؟'
    const tokens = tokenizeArabic(query, true)

    expect(tokens).toContain('شروط')
    expect(tokens).toContain('فسخ')
    expect(tokens).toContain('العقد')
    expect(tokens).toContain('المعاملات')
    expect(tokens).toContain('المدنيه')
    // Stop words removed:
    expect(tokens).not.toContain('ما')
    expect(tokens).not.toContain('هي')
    expect(tokens).not.toContain('في')
  })

  it('calculates fuzzy n-gram similarity correctly', () => {
    const a = 'المحكمة التجارية بالرياض'
    const b = 'محكمه تجاريه في الرياض'
    const sim = calculateNgramSimilarity(a, b)
    expect(sim).toBeGreaterThan(0.4)

    const c = 'عقد إيجار شقة سكنية'
    const unrelatedSim = calculateNgramSimilarity(a, c)
    expect(unrelatedSim).toBeLessThan(0.15)
  })

  it('extracts legal citations and decree numbers', () => {
    const query = 'استناداً إلى المادة 77 والمادة 80 من نظام العمل والمرسوم الملكي م/191'
    const { articleNumbers, decreeNumbers } = extractLegalCitations(query)

    expect(articleNumbers).toContain(77)
    expect(articleNumbers).toContain(80)
    expect(decreeNumbers.some((d) => d.includes('191'))).toBe(true)
  })
})

describe('Saudi Statutes Knowledge Base', () => {
  it('contains core statutes with valid articles and text', () => {
    expect(SAUDI_STATUTES.length).toBeGreaterThanOrEqual(8)

    const m77 = SAUDI_STATUTES.find((s) => s.law.includes('العمل') && s.articleNumber === 77)
    expect(m77).toBeDefined()
    expect(m77?.text).toContain('التعويض')
    expect(m77?.decree).toContain('م/51')

    const m94 = SAUDI_STATUTES.find((s) => s.law.includes('المعاملات المدنية') && s.articleNumber === 94)
    expect(m94).toBeDefined()
    expect(m94?.title).toContain('العقد شريعة المتعاقدين')
  })
})

describe('RAG Prompt Synthesis', () => {
  it('constructs a prompt with structured legal sources and injection guards', () => {
    const prompt = buildRagPrompt('ما هو التعويض في المادة 77؟', [
      {
        id: '1',
        type: 'statute',
        title: 'نظام العمل م/77',
        reference: 'نظام العمل، المادة 77',
        snippet: 'يستحق الطرف المتضرر تعويضاً...',
        score: 18.5,
      },
    ])

    expect(prompt).toContain('السياق النظامي الموثوق')
    expect(prompt).toContain('نظام العمل، المادة 77')
    expect(prompt).toContain('يستحق الطرف المتضرر تعويضاً...')
    expect(prompt).toContain('تنبيه أمني')
  })
})
