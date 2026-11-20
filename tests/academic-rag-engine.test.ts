import { describe, it, expect } from 'vitest'
import {
  computeLegalEmbeddingVector,
  cosineSimilarity,
  runGroundedSemanticLegalSearch,
  evaluateStudentDraftingSubmission,
  MENTORSHIP_TALENT_PROFILES,
} from '../src/lib/academic'

describe('Maqar Semantic Legal Search & Strict Grounded RAG', () => {
  it('computes normalized L2 vector embeddings with positive cosine similarity for related Arabic legal queries', () => {
    const v1 = computeLegalEmbeddingVector('تخفيض الشرط الجزائي المبالغ فيه المادة 179')
    const v2 = computeLegalEmbeddingVector('الشرط الجزائي والتعويض الاتفاقي المادة 179 من نظام المعاملات المدنية')
    const sim = cosineSimilarity(v1, v2)
    expect(v1).toHaveLength(64)
    expect(sim).toBeGreaterThan(0.45)
  })

  it('strictly cites article numbers and official royal decree dates without hallucinations', () => {
    const res = runGroundedSemanticLegalSearch(
      'ما حكم الشرط الجزائي المبالغ فيه وفق المادة 179 من نظام المعاملات المدنية؟'
    )
    expect(res.strictGroundingVerified).toBe(true)
    expect(res.hallucinationGuardStatus).toBe('VERIFIED_ZERO_HALLUCINATION')
    expect(res.citations.length).toBeGreaterThanOrEqual(1)
    expect(res.citations[0].articleNumber).toContain('179')
    expect(res.citations[0].officialDecreeNumber).toContain('م/191')
    expect(res.groundedAnswer).toContain('29/11/1444هـ')
  })

  it('abstains when a query has no statutory match in the authoritative corpus', () => {
    const res = runGroundedSemanticLegalSearch('zzzz_nonexistent_topic_99999')
    expect(res.hallucinationGuardStatus).toBe('ABSTAINED_NO_CORPUS_MATCH')
    expect(res.citations).toHaveLength(0)
  })
})

describe('Maqar Student Drafting Simulator (مختبر الصياغة القضائية)', () => {
  it('scores linguistic precision, procedural correctness, and identifies missed substantive counterarguments', () => {
    const partialDefense =
      'إلى مقام الدائرة التجارية بالمحكمة التجارية: ندفع ببطلان الشرط الجزائي لمخالفته المادة 179 والنظام العام.'
    const evalResult = evaluateStudentDraftingSubmission(
      'SIM-COMMERCIAL-179',
      partialDefense
    )

    expect(evalResult.linguisticAndLegalPrecisionScore).toBeGreaterThan(30)
    expect(evalResult.detectedSubstantiveArguments.length).toBeGreaterThanOrEqual(1)
    // Should flag missed partial performance (85%) or creditor fault (Art. 178)
    expect(evalResult.missedSubstantiveCounterarguments.length).toBeGreaterThanOrEqual(1)
  })

  it('awards high substantive completeness when all statutory counterarguments are pleaded', () => {
    const fullDefense =
      'إلى مقام المحكمة التجارية، عن موكلتي المدعى عليها: ندفع ببطلان شرط استبعاد رقابة القضاء لتعلقه بالنظام العام وفق المادة 179، ونتمسك بـالتنفيذ الجزئي البالغ 85% بمحاضر استلام، فضلاً عن تأخر المدعية في تجهيز الموقع وفق المادة 178. الطلبات: نلتمس أصلياً رد الدعوى واحتياطياً تخفيض التعويض مع أتعاب المحاماة.'
    const evalResult = evaluateStudentDraftingSubmission(
      'SIM-COMMERCIAL-179',
      fullDefense
    )

    expect(evalResult.proceduralCorrectnessScore).toBe(100)
    expect(evalResult.substantiveCompletenessScore).toBe(100)
    expect(evalResult.missedSubstantiveCounterarguments).toHaveLength(0)
  })
})

describe('Maqar Mentorship & Talent Directory', () => {
  it('exposes verified student profiles with professor-attested research memos and partner firm endorsements', () => {
    expect(MENTORSHIP_TALENT_PROFILES.length).toBeGreaterThanOrEqual(3)
    expect(MENTORSHIP_TALENT_PROFILES[0].verifiedMemos.length).toBeGreaterThanOrEqual(1)
  })
})

