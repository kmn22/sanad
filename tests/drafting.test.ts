import { describe, it, expect } from 'vitest'
import { TEMPLATES } from '../src/lib/sanad/drafting/templates'
import { evaluateSafeguards, GLOBAL_SAFEGUARDS } from '../src/lib/sanad/drafting/regulatorySafeguards'

describe('Legal Drafting Engine & Template Library', () => {
  it('registers all standard Saudi contracts and court pleadings', () => {
    const expectedIds = ['employment', 'nda', 'services', 'settlement', 'claim', 'defense', 'appeal']
    expectedIds.forEach((id) => {
      expect(TEMPLATES[id as keyof typeof TEMPLATES]).toBeDefined()
      expect(TEMPLATES[id as keyof typeof TEMPLATES].fields.length).toBeGreaterThan(0)
    })
  })

  it('generates a compliant Saudi fixed-term employment contract with statutory citations', () => {
    const tmpl = TEMPLATES.employment
    const markdown = tmpl.generateFallback({
      employerName: 'شركة تقنية سند',
      employerCr: '1010999999',
      employeeName: 'محمد أحمد السعيد',
      employeeId: '1099887766',
      jobTitle: 'مستشار قانوني',
      basicSalary: 15000,
      housingAllowance: 3750,
      transportAllowance: 1000,
      contractDurationMonths: 24,
      probationPeriod: 90,
      workCity: 'الرياض',
      hasNonCompete: 'yes',
      nonCompeteScope: 'مدينة الرياض في مجال الحلول التقنية',
    })

    expect(markdown).toContain('عقد عمل محدد المدة')
    expect(markdown).toContain('(53) من نظام العمل السعودي')
    expect(markdown).toContain('المادة الخامسة: عدم المنافسة وسرية المعلومات (م/83)')
    expect(markdown).toContain('19,750 ريال سعودي') // Total salary calculation: 15000 + 3750 + 1000
    expect(markdown).toContain('محمد أحمد السعيد')
  })

  it('generates a compliant court defense pleading with formal and substantive defenses', () => {
    const tmpl = TEMPLATES.defense
    const markdown = tmpl.generateFallback({
      caseNumber: '4510123456',
      courtCircuit: 'المحكمة التجارية بالرياض - الدائرة الأولى',
      defendantName: 'شركة الأعمال المتقدمة',
      plaintiffName: 'مؤسسة التوريد',
      formalDefenses: 'الدفع بعدم الاختصاص المكاني والدفع بسقوط الحق بالتقادم',
      substantiveDefenses: 'قيام موكلي بالوفاء بكامل الالتزامات التعاقدية وتسليم المواد المبيعة مطابقة للمواصفات',
      counterRequests: 'رد الدعوى وإلزام المدعي بأتعاب المحاماة والتعويض',
    })

    expect(markdown).toContain('مذكرة جوابية ورد على دعوى')
    expect(markdown).toContain('المحكمة التجارية بالرياض - الدائرة الأولى')
    expect(markdown).toContain('الدفوع الشكلية (م/75 مرافعات شرعية)')
    expect(markdown).toContain('الدفوع والردود الموضوعية')
    expect(markdown).toContain('الطلبات الختامية')
  })

  it('generates a statement of claim compliant with Najiz commercial court filings', () => {
    const tmpl = TEMPLATES.claim
    const markdown = tmpl.generateFallback({
      courtName: 'commercial',
      plaintiffName: 'شركة النماء',
      plaintiffId: '1010111111',
      defendantName: 'مؤسسة البناء',
      defendantId: '1010222222',
      facts: 'تخلف المدعى عليه عن سداد قيمة الفواتير المستحقة',
      legalGrounds: 'المادة (80) من نظام المحاكم التجارية، وأحكام عقد البيع في نظام المعاملات المدنية',
      requests: 'إلزام المدعى عليه بمبلغ 250,000 ريال وأتعاب المحاماة',
    })

    expect(markdown).toContain('صحيفة دعوى افتتاحية')
    expect(markdown).toContain('المحكمة التجارية')
    expect(markdown).toContain('أولاً: وقائع الدعوى وتحرير النزاع')
    expect(markdown).toContain('ثانياً: الأسانيد الشرعية والنظامية')
    expect(markdown).toContain('ثالثاً: الطلبات الختامية')
  })
})

describe('Regulatory Safeguards & Statutory Linters', () => {
  it('triggers Article 53 warning when probation period exceeds 90 days', () => {
    const alerts = evaluateSafeguards('employment', { probationPeriod: 120 })
    const probationAlert = alerts.find((a) => a.id === 'labor-probation-max')
    expect(probationAlert).toBeDefined()
    expect(probationAlert?.law).toContain('م/53')
    expect(probationAlert?.type).toBe('warning')
  })

  it('does NOT trigger Article 53 warning when probation period is within the standard 90 days', () => {
    const alerts = evaluateSafeguards('employment', { probationPeriod: 90 })
    const probationAlert = alerts.find((a) => a.id === 'labor-probation-max')
    expect(probationAlert).toBeUndefined()
  })

  it('triggers Civil Transactions Law Article 179 alert when penalty clauses are entered', () => {
    const alerts = evaluateSafeguards('services', { penaltyClause: '500' })
    const penaltyAlert = alerts.find((a) => a.id === 'civil-penalty-clause')
    expect(penaltyAlert).toBeDefined()
    expect(penaltyAlert?.law).toContain('م/179')
  })

  it('triggers Article 75 Sharia Pleadings formal defense order alert in defense briefs', () => {
    const alerts = evaluateSafeguards('defense', {
      formalDefenses: 'الدفع بعدم الاختصاص النوعي',
    })
    const formalAlert = alerts.find((a) => a.id === 'pleading-formal-defenses-order')
    expect(formalAlert).toBeDefined()
    expect(formalAlert?.law).toContain('م/75')
  })
})
