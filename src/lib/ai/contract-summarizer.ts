export type ClauseTag = 'core' | 'attention' | 'risk' | 'safe'

export type ExtractionFocus = 'all' | 'core_clauses' | 'obligations' | 'durations' | 'risks'

export interface SummarizedClauseItem {
  number: number
  tag: ClauseTag
  tagLabel: string
  title: string
  summary: string
  actionNote?: string
  statuteRef: string
}

export interface ContractSummaryResult {
  contractTitle: string
  estimatedPages: number
  focus: ExtractionFocus
  executiveSummary: {
    headline: string
    totalClauses: number
    attentionCount: number
    alerts: Array<{
      title: string
      clauseRef: string
      detail: string
      severity: 'high' | 'medium' | 'low'
    }>
    closingNote: string
  }
  clauses: SummarizedClauseItem[]
  obligations: {
    firstParty: string[]
    secondParty: string[]
  }
  durationsAndNotices: Array<{
    label: string
    value: string
    warning?: string
  }>
  engine: 'rule' | 'ollama'
}

export const SAMPLE_SUPPLY_CONTRACT_TEXT = `عقد توريد وتنفيذ معدات صناعية إطاري
إنه في يوم الأحد بمدينة الرياض، تم الاتفاق بين كل من:
1. الطرف الأول (المشتري): شركة الروافد للصناعات المتقدمة، سجل تجاري رقم (1010XXXXXX).
2. الطرف الثاني (المورد): مؤسسة التقنية الحديثة للتوريدات الصناعية، سجل تجاري رقم (1010YYYYYY).

البند الأول (موضوع العقد ونطاق التوريد):
يلتزم الطرف الثاني بتوريد وتركيب وتشغيل خطوط الإنتاج الصناعية وفق المواصفات الفنية وجداول الكميات الملحقة بهذا العقد.

البند الثاني (مدة العقد والتجديد التلقائي):
مدة هذا العقد ثلاث (3) سنوات ميلادية تبدأ من تاريخ التوقيع، ويتجدد العقد تلقائياً لمدة أو لمدد مماثلة ما لم يُشعر أحد الطرفين الآخر كتابياً بعدم رغبته في التجديد قبل تسعين (90) يوماً على الأقل من تاريخ انتهاء المدة الأصلية أو أي مدة مجددة.

البند الثالث (القيمة المالية وشروط الدفع):
تبلغ القيمة الإجمالية التقديرية للعقد (4,500,000) أربعة ملايين وخمسمائة ألف ريال سعودي شاملة ضريبة القيمة المضافة، وتُصرف على أربع دفعات مرتبطة بمحاضر الاستلام الفني خلال 30 يوماً من تاريخ كل فاتورة.

البند الرابع (غرامة التأخير):
في حال تأخر الطرف الثاني عن التوريد في المواعيد المحددة، تُفرض عليه غرامة تأخير بنسبة (1%) من قيمة العقد عن كل يوم تأخير دون وضع حد أقصى لإجمالي الغرامات ودون حاجة لإثبات الضرر أو توجيه إعذار.

البند الخامس (حدود المسؤولية والضمان):
تقتصر المسؤولية التعاقدية القصوى للطرف الثاني عن أي أضرار مباشرة أو غير مباشرة على ما لا يتجاوز (10%) من قيمة أمر الشراء، بينما يلتزم الطرف الأول بتعويض الطرف الثاني عن كامل الخسائر والأضرار دون سقف محدد.

البند السادس (القانون الواجب التطبيق وتسوية النزاعات):
يخضع هذا العقد ويفسر وفقاً للأنظمة السارية في المملكة العربية السعودية، وتختص المحاكم التجارية بمدينة الرياض بالفصل في أي نزاع ينشأ عن تنفيذه أو تفسيره.`

export const SAMPLE_SUPPLY_CONTRACT_SUMMARY: ContractSummaryResult = {
  contractTitle: 'عقد توريد وتنفيذ معدات صناعية إطاري',
  estimatedPages: 62,
  focus: 'all',
  executiveSummary: {
    headline: '6 بنود جوهرية مستخرجة، منها 3 بنود تحتاج انتباهاً ومراجعة قبل الاعتماد والتوقيع.',
    totalClauses: 6,
    attentionCount: 3,
    alerts: [
      {
        title: 'غرامة التأخير دون سقف أعلى',
        clauseRef: 'البند 4',
        detail: 'النسبة اليومية (1% يومياً) مفتوحة دون حد أعلى منصوص عليه — عرضة للتخفيض القضائي وفق المادة (179) من نظام المعاملات المدنية.',
        severity: 'high',
      },
      {
        title: 'شرط التجديد التلقائي ومهلة الإشعار',
        clauseRef: 'البند 2',
        detail: 'يلزم الإشعار الكتابي قبل 90 يوماً من انتهاء الـ 3 سنوات؛ سجّل التاريخ في تقويم الامتثال حتى لا يتجدد العقد تلقائياً.',
        severity: 'medium',
      },
      {
        title: 'عدم توازن سقف حدود المسؤولية',
        clauseRef: 'البند 5',
        detail: 'السقف محدد بـ (10%) لصالح الطرف الآخر فقط دون سقف مقابل لالتزاماتك؛ يُوصى بتوحيد سقف المسؤولية للطرفين.',
        severity: 'high',
      },
    ],
    closingNote: 'الاختصاص القضائي والمرجع النظامي في تسوية النزاعات واضحان ومتوافقان مع نظام المحاكم التجارية السعودي.',
  },
  clauses: [
    {
      number: 1,
      tag: 'core',
      tagLabel: 'بند جوهري',
      title: 'موضوع العقد وأطرافه',
      summary: 'نطاق التوريد والتركيب محدد، والأطراف والصفة النظامية والسجلات التجارية لكل طرف واضحة.',
      statuteRef: 'نظام المعاملات المدنية (م/31–42 — أركان العقد ومحل الالتزام)',
    },
    {
      number: 2,
      tag: 'attention',
      tagLabel: 'يحتاج انتباهاً',
      title: 'المدة والتجديد التلقائي',
      summary: 'مدة العقد 3 سنوات، بتجديد تلقائي ما لم يُشعر أحد الطرفين كتابياً قبل 90 يوماً على الأقل.',
      actionNote: 'سجّل مهلة الـ 90 يوماً في منبهات العقود لتفادي التجديد غير المقصود.',
      statuteRef: 'نظام المعاملات المدنية (م/94 — القوة الملزمة للعقد ومدد الإشعار)',
    },
    {
      number: 3,
      tag: 'core',
      tagLabel: 'بند جوهري',
      title: 'الالتزامات المالية وشروط الدفع',
      summary: 'قيمة العقد (4,500,000 ر.س شاملة الضريبة) ودفعاته الأربع ومواعيد استحقاقها (30 يوماً) مستخرجة كما وردت.',
      statuteRef: 'نظام ضريبة القيمة المضافة ونظام المعاملات المدنية (م/162)',
    },
    {
      number: 4,
      tag: 'risk',
      tagLabel: 'مخاطرة محتملة',
      title: 'غرامة التأخير والشرط الجزائي',
      summary: 'نسبة غرامة يومية (1%) دون حد أعلى منصوص عليه ودون اشتراط إثبات الضرر.',
      actionNote: 'حدّد سقفاً أقصى للغرامة (مثلاً 10% من قيمة العقد) لتفادي النزاع حول المبالغة في التعويض.',
      statuteRef: 'نظام المعاملات المدنية (م/179 — سلطة المحكمة في تخفيض التعويض الاتفاقي)',
    },
    {
      number: 5,
      tag: 'attention',
      tagLabel: 'يحتاج انتباهاً',
      title: 'حدود المسؤولية والضمان',
      summary: 'سقف محدد لمسؤولية الطرف الآخر (10%)، دون سقف مقابل لالتزاماتك التعاقدية.',
      actionNote: 'اجعل سقف المسؤولية متقابلاً للطرفين مع استثناء الغش والخطأ الجسيم.',
      statuteRef: 'نظام المعاملات المدنية (م/173 — بطلان الإعفاء من المسؤولية عن الغش أو الخطأ الجسيم)',
    },
    {
      number: 6,
      tag: 'safe',
      tagLabel: 'سليم',
      title: 'تسوية النزاعات والاختصاص القضائي',
      summary: 'الاختصاص للمحاكم التجارية بمدينة الرياض والمرجع للأنظمة السعودية محددان وواضحان.',
      statuteRef: 'نظام المحاكم التجارية (م/16 — الاختصاص النوعي والمكاني)',
    },
  ],
  obligations: {
    firstParty: [
      'سداد الدفعات الأربع خلال 30 يوماً من تاريخ كل فاتورة ومحضر استلام فني.',
      'تمكين المورد من الوصول للموقع لاستكمال التركيب والتشغيل.',
      'توجيه إشعار كتابي قبل 90 يوماً في حال الرغبة بعدم تجديد العقد.',
    ],
    secondParty: [
      'توريد وتركيب وتشغيل خطوط الإنتاج وفق المواصفات الفنية الملحقة.',
      'الالتزام بالجدول الزمني للتسليم وتفادي غرامات التأخير.',
      'ضمان سلامة المعدات الموردة ومطابقتها للمواصفات المتفق عليها.',
    ],
  },
  durationsAndNotices: [
    { label: 'مدة العقد الأساسية', value: '3 سنوات ميلادية من تاريخ التوقيع' },
    { label: 'مهلة إشعار عدم التجديد', value: '90 يوماً قبل انتهاء المدة', warning: 'يتجدد العقد تلقائياً لـ 3 سنوات إضافية عند فوات المهلة' },
    { label: 'مهلة سداد الفواتير', value: '30 يوماً من تاريخ إصدار الفاتورة ومحضر الاستلام' },
  ],
  engine: 'rule',
}

export function buildDeterministicContractSummary(
  rawText: string,
  focus: ExtractionFocus = 'all',
): ContractSummaryResult & { isSample: boolean } {
  const text = rawText.trim()
  if (
    text === SAMPLE_SUPPLY_CONTRACT_TEXT.trim() ||
    (text.includes('شركة الروافد للصناعات المتقدمة') && text.includes('4,500,000'))
  ) {
    return { ...SAMPLE_SUPPLY_CONTRACT_SUMMARY, focus, isSample: true }
  }

  const estPages = Math.max(1, Math.ceil(text.length / 1800))
  const firstLine = text.split('\n').map((l) => l.trim()).find(Boolean) || 'عقد ومستند قانوني'
  const contractTitle = firstLine.slice(0, 90)

  const clauses: SummarizedClauseItem[] = []
  const alerts: ContractSummaryResult['executiveSummary']['alerts'] = []
  const durations: ContractSummaryResult['durationsAndNotices'] = []

  // Detect key statutory patterns in the uploaded contract
  clauses.push({
    number: 1,
    tag: 'core',
    tagLabel: 'بند جوهري',
    title: 'موضوع العقد وأطرافه',
    summary: `يحدد النص التزامات الأطراف في «${contractTitle}» والنطاق التعاقدي المتفق عليه.`,
    statuteRef: 'نظام المعاملات المدنية (م/31–42)',
  })

  if (/يتجدد.*تلقائ|تجديد تلقائي|ما لم يشعر|ما لم يُشعر/.test(text)) {
    const noticeMatch = text.match(/(\d+)\s*(يوم|يوماً|أيام|شهر|أشهر)/)
    const noticeStr = noticeMatch ? `${noticeMatch[1]} ${noticeMatch[2]}` : 'المهلة المنصوص عليها'
    clauses.push({
      number: clauses.length + 1,
      tag: 'attention',
      tagLabel: 'يحتاج انتباهاً',
      title: 'المدة والتجديد التلقائي',
      summary: `يتضمن العقد شرط تجديد تلقائي ما لم يتم الإشعار قبل (${noticeStr}).`,
      actionNote: `سجّل موعد الإشعار (${noticeStr}) قبل انتهاء العقد لتجنب التجديد التلقائي.`,
      statuteRef: 'نظام المعاملات المدنية (م/94)',
    })
    alerts.push({
      title: 'شرط التجديد التلقائي',
      clauseRef: `البند ${clauses.length}`,
      detail: `يلزم توجيه إشعار كتابي قبل (${noticeStr}) لمنع التجديد التلقائي للعقد.`,
      severity: 'medium',
    })
    durations.push({
      label: 'مهلة إشعار عدم التجديد',
      value: noticeStr,
      warning: 'يتجدد العقد تلقائياً عند عدم الإخطار خلال المهلة',
    })
  }

  if (/غرامة|شرط جزائي|تعويض/.test(text)) {
    const uncapped = /دون حد|بلا حد|قطعي|لا يحق للقضاء|دون حاجة لإثبات الضرر/.test(text)
    clauses.push({
      number: clauses.length + 1,
      tag: uncapped ? 'risk' : 'attention',
      tagLabel: uncapped ? 'مخاطرة محتملة' : 'يحتاج انتباهاً',
      title: 'غرامة التأخير والشرط الجزائي',
      summary: uncapped
        ? 'بند غرامة أو شرط جزائي دون سقف أعلى أو مع استبعاد رقابة القضاء.'
        : 'يتضمن العقد تنظيماً لغرامات التأخير أو التعويض الاتفاقي.',
      actionNote: uncapped ? 'قيد الغرامة بسقف أقصى واحذف أي نص يمنع رقابة المحكمة.' : undefined,
      statuteRef: 'نظام المعاملات المدنية (م/179)',
    })
    if (uncapped) {
      alerts.push({
        title: 'غرامة تأخير دون سقف أو استبعاد للقضاء',
        clauseRef: `البند ${clauses.length}`,
        detail: 'الشرط الجزائي المفتوح أو المانع لتدخل المحكمة عرضة للتعديل القضائي وفق المادة (179) من نظام المعاملات المدنية.',
        severity: 'high',
      })
    }
  }

  if (/منافس|عدم المنافسة|عدم العمل/.test(text)) {
    const overLimit = /خمس|ثلاث|أربع|[3-9]\s*سنوات|كامل المملكة|دون قيد/.test(text)
    clauses.push({
      number: clauses.length + 1,
      tag: overLimit ? 'risk' : 'attention',
      tagLabel: overLimit ? 'مخاطرة محتملة' : 'يحتاج انتباهاً',
      title: 'شرط عدم المنافسة وحماية الأسرار',
      summary: overLimit
        ? 'شرط عدم منافسة يتجاوز السنتين أو غير محدد مكانياً ونوعياً.'
        : 'ينظم العقد التزام عدم المنافسة وحفظ الأسرار التجارية.',
      statuteRef: 'نظام العمل السعودي (م/83)',
    })
    if (overLimit) {
      alerts.push({
        title: 'تجاوز الحد النظامي لعدم المنافسة',
        clauseRef: `البند ${clauses.length}`,
        detail: 'المادة (83) من نظام العمل تشترط ألا تتجاوز مدة المنع سنتين مع تحديد المكان ونوع العمل.',
        severity: 'high',
      })
    }
  }

  if (/حدود المسؤولية|سقف المسؤولية|تقتصر المسؤولية|إعفاء من المسؤولية/.test(text)) {
    clauses.push({
      number: clauses.length + 1,
      tag: 'attention',
      tagLabel: 'يحتاج انتباهاً',
      title: 'حدود المسؤولية والضمان',
      summary: 'يتضمن العقد تقييداً لسقف المسؤولية التعاقدية؛ يجب التأكد من توازنه بين الطرفين.',
      statuteRef: 'نظام المعاملات المدنية (م/173)',
    })
    alerts.push({
      title: 'مراجعة توازن سقف المسؤولية',
      clauseRef: `البند ${clauses.length}`,
      detail: 'تحقق من أن سقف المسؤولية متبادل ولا يعفي من الغش أو الخطأ الجسيم (م/173 معاملات مدنية).',
      severity: 'medium',
    })
  }

  clauses.push({
    number: clauses.length + 1,
    tag: 'safe',
    tagLabel: 'سليم',
    title: 'النظام الواجب التطبيق وتسوية النزاعات',
    summary: /المحاكم|تحكيم|الرياض|المملكة/.test(text)
      ? 'تم النص على مرجعية الأنظمة السعودية وجهة الفصل في النزاعات.'
      : 'يخضع العقد للقواعد العامة للاختصاص القضائي في المملكة العربية السعودية.',
    statuteRef: 'نظام المحاكم التجارية ونظام المرافعات الشرعية',
  })

  const attentionCount = clauses.filter((c) => c.tag === 'attention' || c.tag === 'risk').length

  return {
    contractTitle,
    estimatedPages: estPages,
    focus,
    executiveSummary: {
      headline: `${clauses.length} بنود جوهرية مستخرجة، منها ${attentionCount} تحتاج انتباهاً قبل الاعتماد.`,
      totalClauses: clauses.length,
      attentionCount,
      alerts,
      closingNote: 'كل نقطة في الملخص مربوطة بمرجعها النظامي للتحقق المباشر.',
    },
    clauses,
    obligations: {
      firstParty: ['الوفاء بالالتزامات المالية في مواعيد استحقاقها.', 'مراعاة مدد الإشعارات الكتابية المنصوص عليها في العقد.'],
      secondParty: ['تنفيذ محل العقد وفق المواصفات والجداول الزمنية المتفق عليها.', 'الالتزام بضوابط السرية والضمان النظامي.'],
    },
    durationsAndNotices:
      durations.length > 0
        ? durations
        : [{ label: 'المدد والإشعارات', value: 'راجِع مواعيد التسليم والإخطار الكتابي المحددة في متن العقد' }],
    engine: 'rule',
    isSample: false,
  }
}
