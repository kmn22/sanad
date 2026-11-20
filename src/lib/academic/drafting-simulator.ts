export interface SimulationScenario {
  id: string
  type: 'PLEADING_DEFENSE' | 'CONTRACT_REDLINE'
  title: { ar: string; en: string }
  courtOrContext: { ar: string; en: string }
  caseFacts: { ar: string; en: string }
  opposingClaimOrFlawedClause: { ar: string; en: string }
  requiredProceduralElements: Array<{
    id: string
    label: { ar: string; en: string }
    patterns: RegExp
  }>
  requiredSubstantiveArguments: Array<{
    id: string
    label: { ar: string; en: string }
    statutoryBasis: string
    patterns: RegExp
  }>
  modelSolution: { ar: string; en: string }
}

export interface DraftingEvaluationResult {
  scenarioId: string
  overallGrade: 'EXCELLENT' | 'PROFICIENT' | 'DEVELOPING' | 'NEEDS_REVISION'
  linguisticAndLegalPrecisionScore: number // 0 - 100
  proceduralCorrectnessScore: number // 0 - 100
  substantiveCompletenessScore: number // 0 - 100
  detectedProceduralStrengths: Array<{ ar: string; en: string }>
  missedProceduralRequirements: Array<{ ar: string; en: string }>
  detectedSubstantiveArguments: Array<{ ar: string; en: string }>
  missedSubstantiveCounterarguments: Array<{
    ar: string
    en: string
    statutoryBasis: string
  }>
  coachFeedback: { ar: string; en: string }
  evaluatedAt: string
}

export const DRAFTING_SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'SIM-COMMERCIAL-179',
    type: 'PLEADING_DEFENSE',
    title: {
      ar: 'مذكرة دفاع في دعوى مطالبة بشرط جزائي مبالغ فيه مع سبق التنفيذ الجزئي',
      en: 'Defense Pleading Against Excessive Liquidated Damages & Partial Performance',
    },
    courtOrContext: {
      ar: 'الدائرة التجارية — المحكمة التجارية بالرياض',
      en: 'Commercial Circuit — Riyadh Commercial Court',
    },
    caseFacts: {
      ar: 'أبرمت موكلتك عقد توريد وتركيب خطوط إنتاج بقيمة (2,000,000) ريال، وأنجزت (85%) من الأعمال وسلمتها بمحاضر رسمية، وتأخرت في الـ (15%) المتبقية بسبب تأخر المدعية في تجهيز الموقع. أقامت المدعية دعوى تطالب فيها بكامل الشرط الجزائي البالغ (600,000) ريال مستندةً إلى بند في العقد ينص على أن الشرط الجزائي قطعي ولا يخضع لرقابة القضاء.',
      en: 'Your client completed 85% of a 2M SAR supply contract (verified via signed handover certificates) and delayed the remaining 15% due to the Plaintiff’s site-readiness delay. The Plaintiff sues for the full 600,000 SAR penalty citing a clause waiving judicial review.',
    },
    opposingClaimOrFlawedClause: {
      ar: 'تطالب المدعية بإلزام المدعى عليها بدفع مبلغ (600,000) ريال فوراً إعمالاً للبند التاسع الذي ينص على استحقاق الغرامة كاملة بمجرد التأخير دون حاجة لإثبات الضرر ودون سلطة للمحكمة في تخفيضها.',
      en: 'Plaintiff demands immediate payment of 600,000 SAR pursuant to Clause 9 waiving proof of harm and judicial reduction.',
    },
    requiredProceduralElements: [
      {
        id: 'PROC-HEADER',
        label: {
          ar: 'توجيه المذكرة للدائرة التجارية وبيان صفة الخصوم ورقم القضية',
          en: 'Formal court addressing, party capacity, and case reference',
        },
        patterns: /المحكمة التجارية|الدائرة|المدعي|المدعى عليه|موكلي|موكلتي/i,
      },
      {
        id: 'PROC-PRAYER',
        label: {
          ar: 'صياغة الطلبات الختامية مقسمة إلى طلب أصلي وطلب احتياطي وأتعاب المحاماة',
          en: 'Structured Final Remedies divided into Primary, Alternative, and Counsel Fees',
        },
        patterns: /أصلياً|احتياطياً|الطلبات|نلتمس|رد الدعوى|أتعاب المحاماة/i,
      },
    ],
    requiredSubstantiveArguments: [
      {
        id: 'SUB-ART-179-NULLITY',
        label: {
          ar: 'الدفع ببطلان شرط استبعاد رقابة القضاء لتعلقه بالنظام العام وفق المادة (179) من نظام المعاملات المدنية',
          en: 'Nullity of judicial-review waiver as contrary to public order under Civil Transactions Law Art. 179',
        },
        statutoryBasis: 'المادة (179) من نظام المعاملات المدنية (م/191)',
        patterns: /179|بطلان|النظام العام|رقابة القضاء|تخفيض/i,
      },
      {
        id: 'SUB-PARTIAL-PERF',
        label: {
          ar: 'الدفع بالتنفيذ الجزئي الجوهري (85%) بموجب محاضر الاستلام الرسمية الموجب لتخفيض التعويض',
          en: 'Substantial partial performance (85%) evidenced by handover certificates warranting proportional reduction',
        },
        statutoryBasis: 'المادة (179) من نظام المعاملات المدنية والمادة (29) من نظام الإثبات',
        patterns: /تنفيذ.*جزئي|85%|محاضر استلام|جزء منه/i,
      },
      {
        id: 'SUB-CREDITOR-FAULT',
        label: {
          ar: 'الدفع بمساهمة الدائن (المدعية) في التأخير لعدم جاهزية الموقع وانتفاء ركن الخطأ العقدي',
          en: 'Creditor’s contributory delay (site unreadiness) negating contractual fault',
        },
        statutoryBasis: 'المادة (178) من نظام المعاملات المدنية وقاعدة (من سعى في نقض ما تم من جهته فسعيه مردود عليه)',
        patterns: /178|تأخر المدعية|تجهيز الموقع|لا ضرر|الخطأ/i,
      },
    ],
    modelSolution: {
      ar: 'أولاً: من الناحية الموضوعية ندفع ببطلان الشق الوارد في البند التاسع القاضي بحرمان المحكمة من سلطتها التقديرية لمخالفته صريح المادة (179) من نظام المعاملات المدنية التي نصت على أنه "يقع باطلاً كل اتفاق يخالف ذلك". ثانياً: الثابت بمحاضر الاستلام الرسمية تنفيذ موكلتي لـ (85%) من الأعمال، فضلاً عن أن التأخير في الجزء المتبقي راجع لتأخر المدعية في تسليم الموقع طبقاً للمادة (178). الطلبات الختامية: 1. أصلياً: رد دعوى المدعية. 2. احتياطياً: تخفيض الشرط الجزائي بما يتناسب مع الجزء المنفذ (85%). 3. إلزام المدعية بأتعاب المحاماة.',
      en: '1. Plead nullity of the judicial-review waiver under Mandatory Article 179 of the Civil Transactions Law. 2. Establish 85% partial performance via signed certificates and Plaintiff contributory fault under Article 178. 3. Conclude with Primary (dismissal) and Alternative (proportional reduction) prayers.',
    },
  },
  {
    id: 'SIM-LABOR-REDLINE-83',
    type: 'CONTRACT_REDLINE',
    title: {
      ar: 'تنقيح وتعديل بند عدم المنافسة وفترة التجربة في عقد عمل قيادي (Redlining)',
      en: 'Redlining Non-Compliant Non-Compete & Probation Clauses in Executive Contract',
    },
    courtOrContext: {
      ar: 'مراجعة العقود العمالية — نظام العمل السعودي (م/53 وم/83)',
      en: 'Employment Contract Redlining — Saudi Labor Law Arts. 53 & 83',
    },
    caseFacts: {
      ar: 'عُرض عليك بند في مسودة عقد عمل ينص على: "تكون فترة التجربة 180 يوماً قابلة للتمديد، ويلتزم الموظف بعد انتهاء عقده بعدم العمل لدى أي شركة في المملكة لمدة 5 سنوات". أعد صياغة البند ليكون صحيحاً ونافذاً نظاماً.',
      en: 'Redline a draft clause stating: "Probation is 180 days extendable, and Employee shall not work for any company in the Kingdom for 5 years post-termination."',
    },
    opposingClaimOrFlawedClause: {
      ar: 'البند المعيب: "يخضع الطرف الثاني لفترة تجربة مدتها 180 يوماً من تاريخ التوقيع، ويحظر عليه منافسة الشركة لمدة 5 سنوات في كافة أنحاء المملكة."',
      en: 'Flawed Clause: "Second Party is subject to 180 days probation from signing and barred from competing for 5 years across the Kingdom."',
    },
    requiredProceduralElements: [
      {
        id: 'PROC-CONTRACT-PRECISION',
        label: {
          ar: 'استخدام الصياغة التعاقدية الملزمة المحددة للالتزامات بدقة (يلتزم الطرف الثاني / باتفاق كتابي)',
          en: 'Use formal contractual drafting terminology and explicit obligation scoping',
        },
        patterns: /يلتزم|الطرف الثاني|اتفاق كتابي|تاريخ مباشرة العمل/i,
      },
    ],
    requiredSubstantiveArguments: [
      {
        id: 'SUB-ART-53-PROBATION',
        label: {
          ar: 'تحديد فترة التجربة الأصلية بـ (90) يوماً واشتراط اتفاق كتابي لاحق للتمديد حتى (180) يوماً وفق المادة (53)',
          en: 'Cap initial probation at 90 days and require a separate written agreement to extend up to 180 days (Art. 53)',
        },
        statutoryBasis: 'المادة (53) من نظام العمل السعودي (م/51)',
        patterns: /90|تسعين|اتفاق كتابي|المادة 53|م\/53/i,
      },
      {
        id: 'SUB-ART-83-NONCOMPETE',
        label: {
          ar: 'تقييد مدة عدم المنافسة بما لا يتجاوز سنتين وتحديد النطاق المكاني ونوع النشاط وفق المادة (83)',
          en: 'Limit non-compete duration to max 2 years and specify geographic and activity scope (Art. 83)',
        },
        statutoryBasis: 'المادة (83) من نظام العمل السعودي (م/51)',
        patterns: /سنة|سنتين|سنتان|المادة 83|م\/83|الرياض|نشاط/i,
      },
    ],
    modelSolution: {
      ar: 'يخضع الطرف الثاني لفترة تجربة مدتها (90) يوماً تبدأ من تاريخ مباشرة العمل الفعلي، ويجوز باتفاق كتابي لاحق تمديدها بما لا يتجاوز (180) يوماً وفق المادة (53) من نظام العمل. كما يلتزم الطرف الثاني بعد انتهاء العقد بعدم منافسة الطرف الأول في نشاط (تقنية المعلومات) داخل مدينة (الرياض) لمدة (سنة واحدة) وفق ضوابط المادة (83) من نظام العمل.',
      en: 'Second Party shall undergo a 90-day probation period from actual work commencement, extendable up to 180 days by subsequent written agreement per Article 53. Post-termination non-compete is restricted to 1 year within Riyadh in the IT sector per Article 83.',
    },
  },
]

const LEGAL_TERMINOLOGY_MARKERS = [
  'حيث إن',
  'استناداً إلى',
  'المادة',
  'نظام',
  'أصلياً',
  'احتياطياً',
  'النظام العام',
  'يلتزم',
  'براءة ذمة',
  'الدفع',
  'نلتمس',
  'موكلي',
  'موكلتي',
]

/**
 * Evaluates a student's simulated legal defense or contract redline submission.
 * Computes linguistic/legal precision, procedural correctness, and missed substantive counterarguments.
 */
export function evaluateStudentDraftingSubmission(
  scenarioId: string,
  submissionText: string
): DraftingEvaluationResult {
  const scenario =
    DRAFTING_SIMULATION_SCENARIOS.find((s) => s.id === scenarioId) ||
    DRAFTING_SIMULATION_SCENARIOS[0]
  const clean = submissionText.trim()

  // 1. Evaluate Procedural Requirements
  const detectedProceduralStrengths: Array<{ ar: string; en: string }> = []
  const missedProceduralRequirements: Array<{ ar: string; en: string }> = []

  for (const proc of scenario.requiredProceduralElements) {
    if (proc.patterns.test(clean)) {
      detectedProceduralStrengths.push(proc.label)
    } else {
      missedProceduralRequirements.push(proc.label)
    }
  }

  const proceduralCorrectnessScore = Math.round(
    (detectedProceduralStrengths.length /
      Math.max(1, scenario.requiredProceduralElements.length)) *
      100
  )

  // 2. Evaluate Substantive Counterarguments & Statutory Citations
  const detectedSubstantiveArguments: Array<{ ar: string; en: string }> = []
  const missedSubstantiveCounterarguments: DraftingEvaluationResult['missedSubstantiveCounterarguments'] =
    []

  for (const sub of scenario.requiredSubstantiveArguments) {
    if (sub.patterns.test(clean)) {
      detectedSubstantiveArguments.push(sub.label)
    } else {
      missedSubstantiveCounterarguments.push({
        ar: sub.label.ar,
        en: sub.label.en,
        statutoryBasis: sub.statutoryBasis,
      })
    }
  }

  const substantiveCompletenessScore = Math.round(
    (detectedSubstantiveArguments.length /
      Math.max(1, scenario.requiredSubstantiveArguments.length)) *
      100
  )

  // 3. Linguistic & Legal Precision Score
  let terminologyHits = 0
  for (const term of LEGAL_TERMINOLOGY_MARKERS) {
    if (clean.includes(term)) terminologyHits++
  }
  const lengthFactor = Math.min(40, Math.round(clean.length / 8))
  const termFactor = Math.min(45, terminologyHits * 9)
  const structureBonus =
    proceduralCorrectnessScore >= 50 && substantiveCompletenessScore >= 50 ? 15 : 5
  const linguisticAndLegalPrecisionScore = Math.min(
    100,
    Math.max(15, lengthFactor + termFactor + structureBonus)
  )

  const avgScore =
    (linguisticAndLegalPrecisionScore +
      proceduralCorrectnessScore +
      substantiveCompletenessScore) /
    3

  const overallGrade: DraftingEvaluationResult['overallGrade'] =
    avgScore >= 85
      ? 'EXCELLENT'
      : avgScore >= 70
      ? 'PROFICIENT'
      : avgScore >= 50
      ? 'DEVELOPING'
      : 'NEEDS_REVISION'

  const coachFeedback =
    missedSubstantiveCounterarguments.length === 0
      ? {
          ar: 'صياغة قانونية متقنة! استوفيت الدفوع الجوهرية والأسانيد النظامية الإلزامية مع التزام رصين بلغة المرافعات القضائية.',
          en: 'Outstanding legal drafting! You addressed all mandatory statutory defenses and maintained rigorous procedural structure.',
        }
      : {
          ar: `صياغتك جيدة من حيث البناء، لكن فاتك التمسك بـ (${missedSubstantiveCounterarguments.length}) من الدفوع الجوهرية الحاسمة في النزاع. راجع الأسانيد النظامية المقترحة أدناه لتعزيز مذكرتك.`,
          en: `Good structural foundation, but you missed (${missedSubstantiveCounterarguments.length}) dispositive substantive counterarguments. Review the statutory citations below.`,
        }

  return {
    scenarioId: scenario.id,
    overallGrade,
    linguisticAndLegalPrecisionScore,
    proceduralCorrectnessScore,
    substantiveCompletenessScore,
    detectedProceduralStrengths,
    missedProceduralRequirements,
    detectedSubstantiveArguments,
    missedSubstantiveCounterarguments,
    coachFeedback,
    evaluatedAt: new Date().toISOString(),
  }
}

