import { describe, it, expect } from 'vitest'
import { SAUDI_STANDARD_CLAUSES } from '../src/lib/sanad/drafting/standardClauses'

describe('Saudi Legal Standard Clauses Library', () => {
  it('contains essential clauses covering arbitration, civil law, labor, and privacy', () => {
    expect(SAUDI_STANDARD_CLAUSES.length).toBeGreaterThanOrEqual(6)

    const scca = SAUDI_STANDARD_CLAUSES.find((c) => c.id === 'scca-arbitration')
    expect(scca).toBeDefined()
    expect(scca?.clauseText).toContain('المركز السعودي للتحكيم التجاري (SCCA)')
    expect(scca?.clauseText).toContain('الرياض')

    const penalty = SAUDI_STANDARD_CLAUSES.find((c) => c.id === 'civil-liquidated-damages')
    expect(penalty).toBeDefined()
    expect(penalty?.clauseText).toContain('179')
    expect(penalty?.clauseText).toContain('المعاملات المدنية')

    const pdpl = SAUDI_STANDARD_CLAUSES.find((c) => c.id === 'pdpl-confidentiality')
    expect(pdpl).toBeDefined()
    expect(pdpl?.clauseText).toContain('نظام حماية البيانات الشخصية')
    expect(pdpl?.clauseText).toContain('م/148')

    const nonCompete = SAUDI_STANDARD_CLAUSES.find((c) => c.id === 'labor-non-compete')
    expect(nonCompete).toBeDefined()
    expect(nonCompete?.clauseText).toContain('المادة (83)')
    expect(nonCompete?.clauseText).toContain('نظام العمل')
  })
})
