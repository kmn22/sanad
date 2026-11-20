import { describe, it, expect } from 'vitest'
import {
  canTransitionClmStage,
  getAllowedNextStages,
  analyzeContractClauses,
  detectContractJurisdiction,
  GOLDEN_CLAUSE_REPOSITORY,
} from '../src/lib/clm'

describe('Maqar CLM State Machine', () => {
  it('enforces the happy-path lifecycle: DRAFT -> INTERNAL_REVIEW -> AI_CLAUSE_RISK_AUDIT -> APPROVAL_WORKFLOW -> DIGITAL_SIGNATURE_DISPATCH -> ACTIVE -> ARCHIVED', () => {
    const t1 = canTransitionClmStage('DRAFT', 'INTERNAL_REVIEW', { actorId: 'u1' })
    expect(t1.allowed).toBe(true)
    expect(t1.prismaStatus).toBe('LEGAL_REVIEW')

    const t2 = canTransitionClmStage('INTERNAL_REVIEW', 'AI_CLAUSE_RISK_AUDIT', { actorId: 'u1' })
    expect(t2.allowed).toBe(true)
    expect(t2.prismaStatus).toBe('NEGOTIATION')

    // Rejects advancing from AI_CLAUSE_RISK_AUDIT -> APPROVAL_WORKFLOW if audit not completed
    const t3Blocked = canTransitionClmStage('AI_CLAUSE_RISK_AUDIT', 'APPROVAL_WORKFLOW', {
      actorId: 'u1',
      riskAuditCompleted: false,
    })
    expect(t3Blocked.allowed).toBe(false)

    const t3 = canTransitionClmStage('AI_CLAUSE_RISK_AUDIT', 'APPROVAL_WORKFLOW', {
      actorId: 'u1',
      riskAuditCompleted: true,
    })
    expect(t3.allowed).toBe(true)
    expect(t3.prismaStatus).toBe('APPROVED')

    const t4 = canTransitionClmStage('APPROVAL_WORKFLOW', 'DIGITAL_SIGNATURE_DISPATCH', {
      actorId: 'u1',
      approverApproved: true,
    })
    expect(t4.allowed).toBe(true)
    expect(t4.prismaStatus).toBe('SIGNED')

    const t5 = canTransitionClmStage('DIGITAL_SIGNATURE_DISPATCH', 'ACTIVE', {
      actorId: 'u1',
      signatureEnvelopeId: 'ENV-123',
    })
    expect(t5.allowed).toBe(true)
    expect(t5.prismaStatus).toBe('ACTIVE')

    const t6 = canTransitionClmStage('ACTIVE', 'ARCHIVED', { actorId: 'u1' })
    expect(t6.allowed).toBe(true)
    expect(t6.prismaStatus).toBe('EXPIRED')
  })

  it('blocks illegal stage jumps (e.g. DRAFT directly to ACTIVE)', () => {
    const res = canTransitionClmStage('DRAFT', 'ACTIVE', { actorId: 'u1' })
    expect(res.allowed).toBe(false)
    expect(getAllowedNextStages('DRAFT')).toEqual(['INTERNAL_REVIEW', 'ARCHIVED'])
  })
})

describe('Maqar AI Clause Analyzer & Jurisdiction Detector', () => {
  it('detects Saudi Labor Law jurisdiction and flags non-compliant non-compete & probation clauses', async () => {
    const sample =
      'عقد عمل: يخضع العامل لفترة تجربة مدتها 180 يوماً ويلتزم بعدم المنافسة لمدة خمس سنوات في جميع أنحاء المملكة.'
    const jur = detectContractJurisdiction(sample)
    expect(jur.code).toBe('SAUDI_LABOR_LAW')

    const report = await analyzeContractClauses(sample)
    expect(report.overallRiskScore).toBe('HIGH')
    expect(report.nonCompliantStipulations.length).toBeGreaterThanOrEqual(2)
    expect(report.recommendedSubstituteClauses.length).toBeGreaterThanOrEqual(2)
  })

  it('detects Saudi Commercial/Civil Law and flags uncapped liability and judicial-waiver penalty clauses', async () => {
    const sample =
      'عقد توريد: يتحمل الطرف الثاني مسؤولية غير محدودة عن كافة الأضرار المباشرة وغير المباشرة، مع شرط جزائي قطعي لا يخضع لرقابة القضاء.'
    const jur = detectContractJurisdiction(sample)
    expect(jur.code).toBe('SAUDI_COMMERCIAL_CIVIL_LAW')

    const report = await analyzeContractClauses(sample)
    expect(report.overallRiskScore).toBe('HIGH')
    expect(report.liabilitiesIdentified.length).toBe(1)
    expect(report.ambiguousPenaltyClauses.length).toBe(1)
  })

  it('exposes pre-vetted statutory clauses in GOLDEN_CLAUSE_REPOSITORY', () => {
    expect(GOLDEN_CLAUSE_REPOSITORY.length).toBeGreaterThanOrEqual(5)
  })
})

