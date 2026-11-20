import { ollamaChat } from '@/lib/ai/ollama'

export type DetectedJurisdiction =
  | 'SAUDI_LABOR_LAW'
  | 'SAUDI_COMMERCIAL_CIVIL_LAW'
  | 'SAUDI_PDPL_DATA_GOVERNANCE'
  | 'SAUDI_GENERAL_JURISDICTION'

export type ClauseRiskScore = 'LOW' | 'MEDIUM' | 'HIGH'

export interface ClauseFinding {
  id: string
  category: 'LIABILITY' | 'AMBIGUOUS_PENALTY' | 'LABOR_VIOLATION' | 'COMMERCIAL_NON_COMPLIANCE' | 'DATA_PRIVACY'
  severity: ClauseRiskScore
  statutoryReference: {
    ar: string
    en: string
  }
  flaggedExcerpt: string
  issueExplanation: {
    ar: string
    en: string
  }
  recommendedSubstituteClause: {
    ar: string
    en: string
  }
}

export interface ContractRiskAuditReport {
  jurisdiction: {
    code: DetectedJurisdiction
    label: { ar: string; en: string }
    governingStatutes: string[]
  }
  overallRiskScore: ClauseRiskScore
  numericComplianceScore: number // 0 - 100
  liabilitiesIdentified: string[]
  ambiguousPenaltyClauses: string[]
  nonCompliantStipulations: string[]
  findings: ClauseFinding[]
  recommendedSubstituteClauses: Array<{
    targetIssueId: string
    statuteCitation: string
    clauseTextAr: string
    clauseTextEn: string
  }>
  engine: 'statutory-hybrid' | 'ollama-augmented'
  auditedAt: string
}

/**
 * Automatically detects the primary legal regime from contract text (Arabic & English).
 */
export function detectContractJurisdiction(text: string): ContractRiskAuditReport['jurisdiction'] {
  const normalized = text.toLowerCase()

  const laborSignals =
    /عقد عمل|العامل|صاحب العمل|فترة التجربة|نهاية الخدمة|نظام العمل|أجر|منافسة|probation|employee|employer|labor law|wage|end of service/i.test(
      normalized
    )
  const pdplSignals =
    /بيانات شخصية|سدايا|نقل البيانات|معالجة البيانات|حماية البيانات|pdpl|personal data|sdaia|cross-border transfer|data controller/i.test(
      normalized
    )
  const commercialSignals =
    /توريد|مقاولات|شركة|المعاملات المدنية|شرط جزائي|تحكيم|المحكمة التجارية|ضمان|تعويض|commercial court|liquidated damages|indemnity|msa|sla|supply/i.test(
      normalized
    )

  if (laborSignals) {
    return {
      code: 'SAUDI_LABOR_LAW',
      label: {
        ar: 'نظام العمل السعودي ولوائحه التنفيذية (الموارد البشرية)',
        en: 'Saudi Labor Law & Implementing Regulations (MHRSD)',
      },
      governingStatutes: [
        'نظام العمل السعودي (المرسوم الملكي م/51 وتعديلاته)',
        'نظام المعاملات المدنية (المرسوم الملكي م/191)',
      ],
    }
  }

  if (pdplSignals && !commercialSignals) {
    return {
      code: 'SAUDI_PDPL_DATA_GOVERNANCE',
      label: {
        ar: 'نظام حماية البيانات الشخصية والحوكمة السيبرانية (سدايا / الهيئة الوطنية للأمن السيبراني)',
        en: 'Saudi Personal Data Protection Law (SDAIA PDPL) & NCA Controls',
      },
      governingStatutes: [
        'نظام حماية البيانات الشخصية (المرسوم الملكي م/19)',
        'اللائحة التنفيذية لنقل البيانات الشخصية خارج المملكة',
      ],
    }
  }

  if (commercialSignals) {
    return {
      code: 'SAUDI_COMMERCIAL_CIVIL_LAW',
      label: {
        ar: 'نظام المعاملات المدنية ونظام المحاكم التجارية السعودي',
        en: 'Saudi Civil Transactions Law & Commercial Courts Law',
      },
      governingStatutes: [
        'نظام المعاملات المدنية (المرسوم الملكي م/191)',
        'نظام المحاكم التجارية (المرسوم الملكي م/93)',
        'نظام التحكيم السعودي (المرسوم الملكي م/34)',
      ],
    }
  }

  return {
    code: 'SAUDI_GENERAL_JURISDICTION',
    label: {
      ar: 'الأنظمة التجارية والمدنية العامة في المملكة العربية السعودية',
      en: 'General Commercial & Civil Laws of Saudi Arabia',
    },
    governingStatutes: ['نظام المعاملات المدنية (م/191)', 'نظام الإثبات (م/43)'],
  }
}

/**
 * Core AI & Statutory Clause Analyzer Service.
 * Evaluates contract body text, detects jurisdiction, scores risk (LOW / MEDIUM / HIGH),
 * extracts uncapped liabilities, ambiguous penalty clauses, and non-compliant stipulations,
 * and returns statutory-aligned substitute clauses.
 */
export async function analyzeContractClauses(
  contractText: string,
  options?: { enableLlmEnrichment?: boolean }
): Promise<ContractRiskAuditReport> {
  const cleanText = contractText.trim()
  const jurisdiction = detectContractJurisdiction(cleanText)
  const findings: ClauseFinding[] = []

  // Rule 1: Ambiguous / Unreviewable Penalty Clauses (Civil Transactions Law Art. 178-179)
  if (
    /شرط جزائي|غرامة تأخير|تعويض قطعي|لا يخضع لرقابة القضاء|دون سلطة للمحكمة|غير قابل للتخفيض|penalty|liquidated damages|irrevocable penalty|waive judicial review/i.test(
      cleanText
    )
  ) {
    const waivesCourtOrUncapped =
      /قطعي|لا يخضع|دون سلطة|غير قابل للتخفيض|دون حاجة لإثبات|irrevocable|waive judicial|without proof of damage/i.test(
        cleanText
      )
    findings.push({
      id: 'CLM-RISK-179',
      category: 'AMBIGUOUS_PENALTY',
      severity: waivesCourtOrUncapped ? 'HIGH' : 'MEDIUM',
      statutoryReference: {
        ar: 'نظام المعاملات المدنية — المادة (179)',
        en: 'Saudi Civil Transactions Law — Article 179',
      },
      flaggedExcerpt: 'الشرط الجزائي / التعويض الاتفاقي القطعي غير الخاضع لتقدير القضاء',
      issueExplanation: {
        ar: 'بطلان أي اتفاق يقضي بحرمان المحكمة من سلطتها في تخفيض الشرط الجزائي إذا ثبت مبالغته أو تنفيذ الالتزام الأصلي جزئياً، فضلاً عن غموض سقف غرامات التأخير.',
        en: 'Any stipulation waiving judicial authority to reduce excessive liquidated damages or account for partial performance is void under Article 179 (Public Order).',
      },
      recommendedSubstituteClause: {
        ar: 'اتفق الطرفان على أنه في حال تأخر الطرف الثاني عن تنفيذ التزاماته الجوهرية لسبب يرجع إليه، يستحق الطرف الأول تعويضاً اتفاقياً بنسبة (1%) عن كل أسبوع تأخير وبحد أقصى لا يتجاوز (10%) من إجمالي قيمة العقد، مع خضوع هذا التقدير لأحكام المادة (179) من نظام المعاملات المدنية.',
        en: 'If the Second Party delays material performance due to its fault, the First Party shall be entitled to liquidated damages of 1% per delayed week, capped at 10% of the total Contract Value, subject to Article 179 of the Saudi Civil Transactions Law.',
      },
    })
  }

  // Rule 2: Uncapped / Unlimited Liability & Consequential Damages (Civil Transactions Law Art. 136-139)
  if (
    /مسؤولية غير محدودة|كافة الأضرار المباشرة وغير المباشرة|فوات الربح|دون سقف|يتحمل وحده كافة الخسائر|unlimited liability|indirect or consequential|uncapped indemnity/i.test(
      cleanText
    )
  ) {
    findings.push({
      id: 'CLM-RISK-138',
      category: 'LIABILITY',
      severity: 'HIGH',
      statutoryReference: {
        ar: 'نظام المعاملات المدنية — المواد (136–139) ومبادئ التوازن التعاقدي',
        en: 'Saudi Civil Transactions Law — Articles 136–139 (Liability & Damages Scope)',
      },
      flaggedExcerpt: 'التزام التعويض المفتوح عن الأضرار غير المباشرة وفوات الكسب دون سقف مالي',
      issueExplanation: {
        ar: 'إطلاق المسؤولية التعاقدية لتشمل الأضرار غير المباشرة أو الاحتمالية دون حد أقصى (Liability Cap) يعرض المنشأة لمخاطر مالية جسيمة غير قابلة للتأمين.',
        en: 'Uncapped indemnity covering indirect, speculative, or consequential damages exposes the entity to uninsurable balance-sheet liability.',
      },
      recommendedSubstituteClause: {
        ar: 'باستثناء حالات الغش أو الخطأ الجسيم، تقتصر المسؤولية التعاقدية الكلية لأي من الطرفين على الأضرار المباشرة الفعلية المثبتة، وبحد أقصى لا يتجاوز (100%) من إجمالي المبالغ المدفوعة بموجب هذا العقد خلال الاثني عشر (12) شهراً السابقة لوقوع المطالبة.',
        en: 'Except in cases of fraud or gross negligence, the aggregate liability of either Party shall be limited to proven direct damages only, and shall not exceed 100% of the fees paid under this Agreement during the twelve (12) months preceding the claim.',
      },
    })
  }

  // Rule 3: Non-Compliant Non-Compete Covenant (Saudi Labor Law Art. 83)
  if (
    /عدم المنافسة|لا يجوز للعامل العمل لدى منافس|منافسة صاحب العمل|non-compete|competing business/i.test(
      cleanText
    )
  ) {
    const invalidScope =
      /ثلاث سنوات|خمس سنوات|[3-9]\s*سنوات|مدى الحياة|في جميع أنحاء|دون تحديد|3 years|5 years|worldwide|unlimited/i.test(
        cleanText
      )
    if (invalidScope || !/سنتين|سنتان|سنة واحدة|two years|1 year|2 years/i.test(cleanText)) {
      findings.push({
        id: 'CLM-RISK-L83',
        category: 'LABOR_VIOLATION',
        severity: 'HIGH',
        statutoryReference: {
          ar: 'نظام العمل السعودي — المادة (83)',
          en: 'Saudi Labor Law — Article 83',
        },
        flaggedExcerpt: 'شرط عدم المنافسة المطلق أو المتجاوز لمدة سنتين',
        issueExplanation: {
          ar: 'يشترط لصحة شرط عدم المنافسة أن يكون محرراً ومحدداً من حيث الزمان (بما لا يتجاوز سنتين من انتهاء العقد) والمكان ونوع العمل بالقدر الضروري لحماية مصالح صاحب العمل المشروعة.',
          en: 'A non-compete clause is unenforceable under Article 83 unless strictly limited in duration (max 2 years), geographic scope, and specific business activity.',
        },
        recommendedSubstituteClause: {
          ar: 'حمايةً لأسرار العمل المشروعة، يلتزم الطرف الثاني بعد انتهاء العقد بعدم منافسة الطرف الأول في قطاع (النشاط المحدد) داخل نطاق مدينة (الرياض) لمدة (سنة ميلادية واحدة) من تاريخ انتهاء العلاقة التعاقدية وفقاً للمادة (83) من نظام العمل.',
          en: 'To protect legitimate trade secrets, the Second Party shall not compete with the First Party in the specified sector within the city of Riyadh for a period of one (1) year following contract termination, in accordance with Article 83 of the Saudi Labor Law.',
        },
      })
    }
  }

  // Rule 4: Probation Period Exceeding Statutory Limit (Saudi Labor Law Art. 53)
  if (/فترة التجربة|فترة تجربة|تحت التجربة|probation period|probationary/i.test(cleanText)) {
    const over90WithoutWritten =
      /180|ستة أشهر|6 أشهر|six months|180 days/i.test(cleanText) &&
      !/اتفاق كتابي مستقل|اتفاق كتابي لاحق|subsequent written agreement/i.test(cleanText)
    if (over90WithoutWritten) {
      findings.push({
        id: 'CLM-RISK-L53',
        category: 'LABOR_VIOLATION',
        severity: 'MEDIUM',
        statutoryReference: {
          ar: 'نظام العمل السعودي — المادة (53)',
          en: 'Saudi Labor Law — Article 53',
        },
        flaggedExcerpt: 'تحديد فترة التجربة بـ 180 يوماً ابتداءً دون اتفاق كتابي لاحق',
        issueExplanation: {
          ar: 'الحد الأقصى لفترة التجربة عند إبرام العقد هو (90) يوماً، ولا يصح نظاماً النص المسبق على 180 يوماً إلا باتفاق كتابي مستقل بعد بدء العمل.',
          en: 'Initial probation cannot exceed 90 days; extending it up to 180 days requires a separate written agreement executed after employment commences.',
        },
        recommendedSubstituteClause: {
          ar: 'يخضع الطرف الثاني لفترة تجربة مدتها (90) يوماً تبدأ من تاريخ مباشرة العمل الفعلي، ويجوز باتفاق كتابي لاحق ومستقل تمديدها بما لا يزيد على (180) يوماً وفق المادة (53) من نظام العمل.',
          en: 'The Second Party shall be subject to a probation period of ninety (90) days starting from actual commencement of work, extendable up to 180 days only by a subsequent written agreement per Article 53 of the Labor Law.',
        },
      })
    }
  }

  // Rule 5: Unilateral Termination / Forfeiture of End-of-Service Award (Labor Law Art. 75, 80, 84)
  if (
    /إنهاء العقد فوراً دون مكافأة|حرمان من مكافأة نهاية الخدمة|الفسخ بالإرادة المنفردة دون إشعار|terminate immediately without notice or end of service/i.test(
      cleanText
    )
  ) {
    findings.push({
      id: 'CLM-RISK-L80',
      category: 'LABOR_VIOLATION',
      severity: 'HIGH',
      statutoryReference: {
        ar: 'نظام العمل السعودي — المواد (75، 80، 84)',
        en: 'Saudi Labor Law — Articles 75, 80 & 84',
      },
      flaggedExcerpt: 'الإنهاء الفوري أو إسقاط مكافأة نهاية الخدمة خارج الحالات الحصرية للمادة (80)',
      issueExplanation: {
        ar: 'لا يجوز فصل العامل دون مكافأة أو إشعار إلا في الحالات التسع الحصرية المنصوص عليها في المادة (80) وبعد إجراء تحقيق كتابي وسماع دفوع العامل.',
        en: 'Termination without notice or end-of-service gratuity is strictly prohibited outside the exhaustive grounds of Article 80 and mandatory due-process investigation.',
      },
      recommendedSubstituteClause: {
        ar: 'يجوز لأي من الطرفين إنهاء هذا العقد لسبب مشروع بموجب إشعار كتابي مدته (60) يوماً، مع احتفاظ العامل بكامل مستحقاته النظامية ومكافأة نهاية الخدمة طبقاً للمادة (84)، وذلك دون إخلال بالحالات الحصرية الواردة في المادة (80) من نظام العمل.',
        en: 'Either Party may terminate this Contract for a valid reason upon sixty (60) days written notice, preserving full statutory entitlements and End-of-Service gratuity under Article 84, without prejudice to Article 80 of the Labor Law.',
      },
    })
  }

  // Rule 6: Cross-Border Personal Data Transfer (SDAIA PDPL Art. 29)
  if (
    /خارج المملكة|خوادم سحابية دولية|نقل البيانات.*للخارج|outside the kingdom|cross-border data|foreign servers/i.test(
      cleanText
    )
  ) {
    findings.push({
      id: 'CLM-RISK-PDPL29',
      category: 'DATA_PRIVACY',
      severity: 'MEDIUM',
      statutoryReference: {
        ar: 'نظام حماية البيانات الشخصية (PDPL) — المادة (29)',
        en: 'Saudi Personal Data Protection Law (PDPL) — Article 29',
      },
      flaggedExcerpt: 'نقل أو استضافة البيانات الشخصية خارج النطاق الجغرافي للمملكة',
      issueExplanation: {
        ar: 'يحظر نقل البيانات الشخصية خارج المملكة أو الإفصاح عنها لجهة خارجية إلا بعد استيفاء الضمانات القياسية وتقييم مخاطر النقل وفق لوائح سدايا.',
        en: 'Cross-border transfer of personal data requires adequacy assessment, standard contractual clauses (SCCs), and compliance with SDAIA Article 29 regulations.',
      },
      recommendedSubstituteClause: {
        ar: 'يلتزم الطرفان بمعالجة وتخزين كافة البيانات الشخصية على خوادم مستضافة داخل المملكة العربية السعودية، ولا يجوز نقل أي بيانات شخصية خارج المملكة إلا بعد استيفاء الضوابط والاشتراطات المنصوص عليها في المادة (29) من نظام حماية البيانات الشخصية ولوائحه التنفيذية.',
        en: 'Both Parties shall host and process all Personal Data within the Kingdom of Saudi Arabia. No cross-border transfer may occur without prior compliance with Article 29 of the Saudi PDPL and SDAIA Standard Contractual Clauses.',
      },
    })
  }

  // Optional LLM Enrichment via local Ollama if enabled and no deterministic findings matched
  let engine: ContractRiskAuditReport['engine'] = 'statutory-hybrid'
  if (options?.enableLlmEnrichment && findings.length === 0 && cleanText.length > 30) {
    try {
      const raw = await ollamaChat(
        [
          {
            role: 'system',
            content:
              'أنت مستشار قانوني خبير في الأنظمة السعودية (نظام المعاملات المدنية ونظام العمل ونظام المحاكم التجارية). حلل النص التعاقدي وأعد JSON يحتوي على: {"severity": "LOW"|"MEDIUM"|"HIGH", "statute": string, "issueAr": string, "substituteAr": string}.',
          },
          { role: 'user', content: cleanText.slice(0, 3000) },
        ],
        { json: true, timeoutMs: 12_000 }
      )
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.issueAr && parsed.substituteAr) {
          engine = 'ollama-augmented'
          findings.push({
            id: 'CLM-RISK-AI-01',
            category: 'COMMERCIAL_NON_COMPLIANCE',
            severity: parsed.severity === 'HIGH' || parsed.severity === 'MEDIUM' ? parsed.severity : 'LOW',
            statutoryReference: {
              ar: parsed.statute || 'نظام المعاملات المدنية السعودي',
              en: parsed.statute || 'Saudi Civil Transactions Law',
            },
            flaggedExcerpt: cleanText.slice(0, 120),
            issueExplanation: { ar: parsed.issueAr, en: parsed.issueAr },
            recommendedSubstituteClause: { ar: parsed.substituteAr, en: parsed.substituteAr },
          })
        }
      }
    } catch {
      // Deterministic statutory audit remains authoritative
    }
  }

  // Compute aggregate Risk Score & Compliance Percentage
  const hasHigh = findings.some((f) => f.severity === 'HIGH')
  const hasMedium = findings.some((f) => f.severity === 'MEDIUM')
  const overallRiskScore: ClauseRiskScore = hasHigh ? 'HIGH' : hasMedium ? 'MEDIUM' : 'LOW'

  const penaltyPoints = findings.reduce(
    (acc, f) => acc + (f.severity === 'HIGH' ? 28 : f.severity === 'MEDIUM' ? 15 : 5),
    0
  )
  const numericComplianceScore = Math.max(12, 100 - penaltyPoints)

  return {
    jurisdiction,
    overallRiskScore,
    numericComplianceScore,
    liabilitiesIdentified: findings
      .filter((f) => f.category === 'LIABILITY')
      .map((f) => f.issueExplanation.ar),
    ambiguousPenaltyClauses: findings
      .filter((f) => f.category === 'AMBIGUOUS_PENALTY')
      .map((f) => f.issueExplanation.ar),
    nonCompliantStipulations: findings
      .filter((f) =>
        ['LABOR_VIOLATION', 'COMMERCIAL_NON_COMPLIANCE', 'DATA_PRIVACY'].includes(f.category)
      )
      .map((f) => f.issueExplanation.ar),
    findings,
    recommendedSubstituteClauses: findings.map((f) => ({
      targetIssueId: f.id,
      statuteCitation: f.statutoryReference.ar,
      clauseTextAr: f.recommendedSubstituteClause.ar,
      clauseTextEn: f.recommendedSubstituteClause.en,
    })),
    engine,
    auditedAt: new Date().toISOString(),
  }
}
