import { describe, expect, it } from 'vitest'
import { NextRequest } from 'next/server'
import {
  MAQAR_ANTI_HALLUCINATION_INSTRUCTION,
  chunkStatuteByArticles,
  hybridStatutorySearch,
  resolveMaqarLegalQuery,
} from '../src/lib/ai/maqar-rag-pipeline'
import { POST as legalQueryPost } from '../src/app/api/ai/legal-query/route'

describe('Maqar Statutory RAG Pipeline — Chunking, Hybrid Search & Footnotes', () => {
  it('chunks legal documents structurally by Article and preserves statute_name, article_number, and promulgation_date', () => {
    const sampleStatute = {
      idPrefix: 'test-civil',
      statute_name: 'نظام المعاملات المدنية',
      promulgation_date: 'المرسوم الملكي رقم (م/191) وتاريخ 29/11/1444هـ',
      rawText: `
المادة (94): القوة الملزمة للعقد
العقد شريعة المتعاقدين، فلا يجوز نقضه ولا تعديله إلا باتفاق الطرفين أو للأسباب التي يقررها النظام.
المادة (179): الشرط الجزائي
يجوز للمتعاقدين أن يحددا مقدماً قيمة التعويض بالنص عليها في العقد أو في اتفاق لاحق.
`,
    }

    const chunks = chunkStatuteByArticles(sampleStatute)
    expect(chunks).toHaveLength(2)
    expect(chunks[0].metadata.statute_name).toBe('نظام المعاملات المدنية')
    expect(chunks[0].metadata.article_number).toBe('المادة (94)')
    expect(chunks[0].metadata.promulgation_date).toBe(
      'المرسوم الملكي رقم (م/191) وتاريخ 29/11/1444هـ'
    )
    expect(chunks[1].metadata.article_number).toBe('المادة (179)')
  })

  it('retrieves relevant statutory articles via hybrid search (Vector + BM25)', () => {
    const matches = hybridStatutorySearch(
      'ما هو مقدار التعويض عن إنهاء عقد العمل لسبب غير مشروع وفق المادة 77 من نظام العمل؟'
    )
    expect(matches.length).toBeGreaterThan(0)
    expect(matches[0].chunk.metadata.statute_name).toContain('نظام العمل')
    expect(matches[0].chunk.metadata.article_number).toContain('77')
    expect(matches[0].hybridScore).toBeGreaterThan(0.2)
  })

  it('enforces the exact Maqar anti-hallucination system instruction and enriches clickable footnote citations', async () => {
    const res = await resolveMaqarLegalQuery({
      query: 'هل يجوز للمحكمة تخفيض الشرط الجزائي المبالغ فيه في نظام المعاملات المدنية؟',
    })

    expect(res.abstained).toBe(false)
    expect(res.systemInstructionUsed).toBe(MAQAR_ANTI_HALLUCINATION_INSTRUCTION)
    expect(res.citations.length).toBeGreaterThan(0)
    expect(res.citations[0].statute_name).toBe('نظام المعاملات المدنية')
    expect(res.citations[0].article_number).toBe('المادة (179)')
    expect(res.answerMarkdownWithFootnotes).toContain('#statutory-footnote-1')
    expect(res.answerHtmlWithFootnotes).toContain('href="#statutory-footnote-1"')
  })

  it('abstains strictly when the query is not covered in the retrieved statutory corpus', async () => {
    const res = await resolveMaqarLegalQuery({
      query: 'zzzz_interplanetary_space_mining_tax_code_99999',
    })

    expect(res.abstained).toBe(true)
    expect(res.citations).toHaveLength(0)
    expect(res.answerPlain).toContain('لم يرد نص صريح')
  })

  it('serves POST /api/ai/legal-query with grounded citations and footnotes', async () => {
    const req = new NextRequest('http://localhost:3001/api/ai/legal-query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: 'ما هي مسؤولية مديري الشركة وأعضاء مجلس الإدارة عن الأخطاء في نظام الشركات؟',
        caseSummary: 'دعوى مقامة من الشركاء ضد مدير الشركة لمخالفته نظام الأساس.',
        topK: 3,
      }),
    })

    const response = await legalQueryPost(req)
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.abstained).toBe(false)
    expect(payload.citations.length).toBeGreaterThan(0)
    expect(payload.answerHtmlWithFootnotes).toContain('statutory-footnote-1')
  })
})

