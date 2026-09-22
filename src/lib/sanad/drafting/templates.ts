import type { DocumentTemplate, TemplateId } from './types'
import { GLOBAL_SAFEGUARDS } from './regulatorySafeguards'

// ==========================================
// Generator Functions
// ==========================================

export function generateEmploymentContract(a: Record<string, any>): string {
  const totalSalary = Number(a.basicSalary || 0) + Number(a.housingAllowance || 0) + Number(a.transportAllowance || 0)
  const nonCompeteSection = a.hasNonCompete === 'yes'
    ? `### المادة الخامسة: عدم المنافسة وسرية المعلومات (م/83)\nنظراً لاطلاع الطرف الثاني على أسرار عمل الطرف الأول وقواعد بيانات عملائه، يلتزم الطرف الثاني بعدم منافسة الطرف الأول أو العمل لدى أي منافس داخل نطاق: **(${a.nonCompeteScope || 'المملكة العربية السعودية'})** وذلك لمدة **(سنة واحدة)** من تاريخ انتهاء العلاقة العمالية.\n\n`
    : ''

  return `# عقد عمل محدد المدة

بعون الله تعالى، تم إبرام هذا العقد في يوم ${new Date().toLocaleDateString('ar-SA')} بمدينة ${a.workCity || 'الرياض'} بين كل من:

**الطرف الأول (صاحب العمل):** ${a.employerName || '—'}، سجل تجاري رقم: (${a.employerCr || '—'})، ويمثلها في التوقيع الممثل النظامي.  
**الطرف الثاني (الموظف):** ${a.employeeName || '—'}، حامل هوية/إقامة رقم: (${a.employeeId || '—'}).

---

### التمهيد
حيث إن الطرف الأول منشأة مرخصة ترغب في الاستفادة من خبرات الطرف الثاني، وحيث أبدى الطرف الثاني استعداده التام للعمل لدى الطرف الأول بموجب أحكام نظام العمل السعودي ولائحته التنفيذية، فقد اتفق الطرفان على ما يلي:

### المادة الأولى: المسمى الوظيفي ونطاق العمل
يعمل الطرف الثاني لدى الطرف الأول بمهنة **(${a.jobTitle || 'موظف'})** في مدينة ${a.workCity || 'الرياض'}، ويلتزم بأداء المهام الموكلة إليه بإخلاص وفق تعليمات المنشأة والأنظمة المرعية.

### المادة الثانية: مدة العقد وفترة التجربة
1. مدة هذا العقد **(${a.contractDurationMonths || 12}) شهراً** تبدأ من تاريخ مباشرة العمل الفعلي وتتجدد تلقائياً لمدة مماثلة ما لم يشعر أحد الطرفين الآخر خطياً بعدم الرغبة في التجديد قبل 60 يوماً من انتهائه.
2. يخضع الطرف الثاني لفترة تجربة مدتها **(${a.probationPeriod || 90}) يوماً** وفقاً للمادة (53) من نظام العمل السعودي، ويحق لأي من الطرفين إنهاء العقد خلالها دون مكافأة أو تعويض.

### المادة الثالثة: الأجر والبدلات
يلتزم الطرف الأول بدفع أجر شهري للطرف الثاني في نهاية كل شهر ميلادي مفصلاً كالتالي:
- الراتب الأساسي: **${Number(a.basicSalary || 0).toLocaleString()} ريال سعودي**.
- بدل السكن: **${Number(a.housingAllowance || 0).toLocaleString()} ريال سعودي**.
- بدل النقل: **${Number(a.transportAllowance || 0).toLocaleString()} ريال سعودي**.
- **إجمالي الأجر الشهري: ${totalSalary.toLocaleString()} ريال سعودي**.

### المادة الرابعة: ساعات العمل والإجازات
تحدد ساعات العمل بـ (8) ساعات يومياً بما لا يتجاوز (48) ساعة أسبوعياً وفق أحكام المادة (98) من نظام العمل. يستحق الطرف الثاني إجازة سنوية مدفوعة الأجر قدرها (21) يوماً تزداد إلى (30) يوماً بعد إتمام خمس سنوات متصلة.

${nonCompeteSection}### المادة ${a.hasNonCompete === 'yes' ? 'السادسة' : 'الخامسة'}: أحكام عامة والنظام الواجب التطبيق
يخضع هذا العقد ويفسر وفقاً لنظام العمل السعودي والقرارات واللوائح الصادرة بموجبه، وتختص المحاكم العمالية في المملكة العربية السعودية بنظر أي نزاع قد ينشأ عنه بعد استنفاد مراحل التسوية الودية.

**حرر هذا العقد من نسختين أصليتين، استلم كل طرف نسخته للعمل بموجبها.**

**الطرف الأول (صاحب العمل)**: ___________________  
**الطرف الثاني (الموظف)**: ___________________
`
}

export function generateNda(a: Record<string, any>): string {
  const penaltySection = a.penaltyClause
    ? `### المادة الرابعة: التعويض عن الإخلال\nفي حال ثبوت إخلال الطرف المتلقي بأي من التزاماته، يلتزم بدفع تعويض اتفاقي قدره **(${Number(a.penaltyClause).toLocaleString()} ريال سعودي)** للطرف المفصح، مع عدم الإخلال بحق الطرف المفصح في المطالبة بالتعويض عن كامل الضرر المحقق استناداً لأحكام نظام المعاملات المدنية والنظام الجزائي لحماية الأسرار التجارية.\n\n`
    : ''

  return `# اتفاقية عدم إفصاح وسرية معلومات (NDA)

في يوم ${new Date().toLocaleDateString('ar-SA')} بمدينة ${a.city || 'الرياض'}، تم الاتفاق والتراضي بين كل من:

**الطرف الأول (الطرف المفصح):** ${a.disclosingParty || '—'}، سجل رقم (${a.disclosingCr || '—'}).  
**الطرف الثاني (الطرف المتلقي):** ${a.receivingParty || '—'}، سجل رقم (${a.receivingCr || '—'}).

---

### التمهيد
حيث إن الطرفين بصدد مناقشة وبحث: **(${a.purpose || 'فرصة تعاون تجاري واستثماري'})**، وحيث تتطلب هذه المباحثات كشف معلومات فنية وسرية وبيانات تجارية وبيانات شخصية، فقد اتفق الطرفان على إبرام هذه الاتفاقية بالشروط التالية:

### المادة الأولى: تعريف المعلومات السرية
تشمل "المعلومات السرية" كافة البيانات التقنية والمالية، الأسرار التجارية، الشيفرات البرمجية، قوائم العملاء، والبيانات الشخصية المحمية بنظام حماية البيانات الشخصية الصادر بالمرسوم الملكي (م/148)، سواء كانت شفهية أو مكتوبة أو إلكترونية.

### المادة الثانية: التزامات الطرف المتلقي
1. يلتزم الطرف المتلقي بالحفاظ التام على سرية المعلومات وبذل أقصى درجات العناية (على ألا تقل عن العناية التي يبذلها لحماية معلوماته السرية الخاصة).
2. عدم استخدام المعلومات المفصحة إلا حصراً لتحقيق الغرض المحدد في التمهيد أعلاه.
3. قصر الاطلاع على موظفيه ومستشاريه الذين تقتضي طبيعة عملهم معرفتها بعد توقيعهم تعهدات سرية مماثلة.

### المادة الثالثة: مدة سريان السرية
تسري التزامات السرية المنصوص عليها في هذه الاتفاقية لمدة **(${a.confidentialityYears || 3}) سنوات** تبدأ من تاريخ توقيعها، وتظل سارية المفعول حتى بعد انتهاء المباحثات أو عدم التوصل إلى اتفاق نهائي.

${penaltySection}### المادة ${a.penaltyClause ? 'الخامسة' : 'الرابعة'}: الاختصاص القضائي والنظام المطبق
تخضع هذه الاتفاقية وتفسر وفقاً للأنظمة واللوائح المعمول بها في المملكة العربية السعودية، وتختص المحكمة التجارية بمدينة ${a.city || 'الرياض'} بالنظر في أي نزاع ينشأ عنها.

**الطرف الأول (المفصح)**: ___________________  
**الطرف الثاني (المتلقي)**: ___________________
`
}

export function generateServicesContract(a: Record<string, any>): string {
  const delaySection = a.penaltyClause
    ? `### المادة الرابعة: غرامة التأخير\nإذا تأخر الطرف الثاني عن تسليم الأعمال في الموعد المحدد لأسباب راجعة إليه دون عذر نظامي مقبول، يلتزم بدفع غرامة تأخير قدرها **(${Number(a.penaltyClause).toLocaleString()} ريال)** عن كل يوم تأخير، على ألا تتجاوز الغرامة 10% من إجمالي قيمة العقد وفقاً لأحكام المادة (179) من نظام المعاملات المدنية.\n\n`
    : ''

  return `# عقد تقديم خدمات واستشارات مهنية

بعون الله تعالى وتوفيقه، اتفق كل من:

1. **الطرف الأول (العميل):** ${a.clientName || '—'}، سجل تجاري رقم (${a.clientCr || '—'}).  
2. **الطرف الثاني (مقدم الخدمة):** ${a.providerName || '—'}، سجل تجاري/ترخيص رقم (${a.providerCr || '—'}).

---

### التمهيد
حيث إن الطرف الثاني يمتلك الخبرة المهنية والتراخيص اللازمة لتقديم الخدمات المطلوبة، وحيث رغب الطرف الأول في التعاقد معه، فقد اتفقا وفقاً لأحكام عقد المقاولة في **نظام المعاملات المدنية السعودي (المرسوم م/191)** على ما يلي:

### المادة الأولى: نطاق الخدمات
يلتزم الطرف الثاني بتقديم الخدمات التالية وفق أعلى المعايير المهنية:
**${a.scopeOfWork || 'تقديم الخدمات الاستشارية والمهنية المتفق عليها'}**.

### المادة الثانية: مدة الإنجاز والتسليم
يلتزم الطرف الثاني بإنجاز وتسليم كامل الأعمال المحددة خلال مدة أقصاها **(${a.durationDays || 60}) يوماً تقويمياً** تبدأ من تاريخ توقيع هذا العقد واستلام الدفعة الأولى.

### المادة الثالثة: المقابل المالي وطريقة الدفع
1. يلتزم الطرف الأول بدفع مبلغ إجمالي قدره: **(${Number(a.totalFee || 0).toLocaleString()} ريال سعودي)** غير شامل ضريبة القيمة المضافة.
2. يتم سداد الأتعاب وفق الآلية التالية: **${a.paymentTerms || 'وفق المستخلصات المعتمدة'}**.

${delaySection}### المادة ${a.penaltyClause ? 'الخامسة' : 'الرابعة'}: إنهاء العقد والقوة القاهرة
تطبق أحكام القوة القاهرة والظروف الطارئة المنصوص عليها في المادتين (174) و (471) من نظام المعاملات المدنية في حال تعذر تنفيذ الالتزامات لأسباب خارجة عن إرادة أي من الطرفين.

### المادة ${a.penaltyClause ? 'السادسة' : 'الخامسة'}: تسوية المنازعات
أي خلاف ينشأ عن تنفيذ هذا العقد يحل ودياً، وفي حال تعذر ذلك تختص المحكمة التجارية بمدينة الرياض بنظر النزاع.

**الطرف الأول (العميل)**: ___________________  
**الطرف الثاني (مقدم الخدمة)**: ___________________
`
}

export function generateSettlementAgreement(a: Record<string, any>): string {
  return `# اتفاقية تسوية ودية وإنهاء نزاع (عقد صلح)

الحمد لله وحده والصلاة والسلام على من لا نبي بعده، أما بعد:  
تم في يوم ${new Date().toLocaleDateString('ar-SA')} إبرام اتفاقية الصلح هذه بين كل من:

1. **الطرف الأول:** ${a.firstParty || '—'}.  
2. **الطرف الثاني:** ${a.secondParty || '—'}.

---

### التمهيد
حيث نشأ خلاف بين الطرفين بخصوص: **(${a.disputeSummary || 'مطالبات ومستحقات مالية'})**، ورغبةً منهما في قطع دابر الخصومة وإنهاء النزاع رضاءً وصلحاً عملاً بقوله تعالى: ﴿وَالصُّلْحُ خَيْرٌ﴾ واستناداً إلى أحكام **عقد الصلح في نظام المعاملات المدنية (المواد 477 - 485)**، فقد اتفق الطرفان على ما يلي:

### المادة الأولى: اعتبار التمهيد
يعتبر التمهيد السابق جزءاً لا يتجزأ من هذه الاتفاقية ومفسراً لبنودها.

### المادة الثانية: مبلغ التسوية والإبراء
اتفق الطرفان على أن يدفع الطرف الثاني للطرف الأول مبلغاً مقطوعاً ونهائياً قدره: **(${Number(a.settlementAmount || 0).toLocaleString()} ريال سعودي)** يتم سداده كالتالي: **(${a.settlementTerms || 'سداد فوري'})**.

### المادة الثالثة: إسقاط الدعاوى وإبراء الذمة النهائي
بمجرد تحصيل الطرف الأول لمبلغ التسوية المذكور في المادة الثانية، يقر الطرف الأول بإبراء ذمة الطرف الثاني إبراءً عاماً وشاملاً ونهائياً لا رجعة فيه من أي حق أو دعوى أو مطالبة تتعلق بموضوع النزاع، ويلتزم الطرفان بالتنازل عن أي دعاوى أو طلبات قضائية مقامة أمام المحاكم.

### المادة الرابعة: حجية الاتفاقية
تعد هذه الاتفاقية سنداً قاطعاً للنزاع وملزمة لكلا الطرفين وخلفائهما النظاميين، ولا يجوز لأي منهما الرجوع عما تم الاتفاق عليه استناداً للمادة (482) من نظام المعاملات المدنية.

**الطرف الأول**: ___________________  
**الطرف الثاني**: ___________________
`
}

export function generateClaimPleading(a: Record<string, any>): string {
  const courtMap: Record<string, string> = {
    commercial: 'المحكمة التجارية',
    general: 'المحكمة العامة',
    labor: 'المحكمة العمالية',
    admin: 'المحكمة الإدارية بديوان المظالم',
  }

  return `# صحيفة دعوى افتتاحية

**إلى فضيلة رئيس وأعضاء الدائرة القضائية بـ ${courtMap[a.courtName] || 'المحكمة المختصة'} الموقرين**  
السلام عليكم ورحمة الله وبركاته، أما بعد:

**المدعي:** ${a.plaintiffName || '—'}، سجل/هوية رقم (${a.plaintiffId || '—'}).  
**ضـــد**  
**المدعى عليه:** ${a.defendantName || '—'}، سجل/هوية رقم (${a.defendantId || '—'}).

---

### أولاً: وقائع الدعوى وتحرير النزاع
${a.facts || 'تتلخص وقائع الدعوى في قيام علاقة تعاقدية بين المدعي والمدعى عليه، حيث أوفى المدعي بجميع التزاماته التعاقدية في حين تخلف المدعى عليه عن أداء ما عليه دون مسوغ نظامي.'}

### ثانياً: الأسانيد الشرعية والنظامية
تتأسس هذه الدعوى على الأسانيد التالية:
1. **الأصل الشرعي:** قوله تعالى: ﴿يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ﴾، وقول النبي ﷺ: «المسلمون على شروطهم».
2. **الأسانيد النظامية:**
${a.legalGrounds || 'نظام المعاملات المدنية ونظام المحاكم التجارية ولائحته التنفيذية.'}
3. ثبوت العلاقة التعاقدية واستقرار الدين في ذمة المدعى عليه بموجب المستندات والفواتير المرفقة بصحيفة القيد.

### ثالثاً: الطلبات الختامية
بناءً على ما تقدم من وقائع وأسانيد، نطلب من فضيلتكم الحكم بما يلي:
${a.requests || '1. إلزام المدعى عليه بأداء الحق المطالب به.\n2. إلزامه بأتعاب المحاماة والتقاضي.'}

**وتفضلوا بقبول فائق الاحترام والتقدير،،**  
**مقدمه لفضيلتكم / وكيل المدعي**
`
}

export function generateDefensePleading(a: Record<string, any>): string {
  const hasFormal = a.formalDefenses && a.formalDefenses.trim() !== ''
  const formalSection = hasFormal
    ? `### أولاً: الدفوع الشكلية (م/75 مرافعات شرعية)\nقبل الخوض في موضوع الدعوى، نتمسك بالدفوع الشكلية التالية:\n${a.formalDefenses}\n\n`
    : ''
  const substantiveTitle = hasFormal ? 'ثانياً' : 'أولاً'
  const requestsTitle = hasFormal ? 'ثالثاً' : 'ثانياً'

  return `# مذكرة جوابية ورد على دعوى

**لدى فضيلة الدائرة القضائية الموقرة بـ ${a.courtCircuit || 'المحكمة المختصة'}**  
في القضية المقيدة برقم: **(${a.caseNumber || '—'})**  

**المقدمة من / المدعى عليه:** ${a.defendantName || '—'}.  
**ضـــــد / المدعــــي:** ${a.plaintiffName || '—'}.

---

السلام عليكم ورحمة الله وبركاته،،  
يطيب لنا أن نتقدم لفضيلتكم بمذكرتنا الجوابية رداً على لائحة دعوى المدعي كما يلي:

${formalSection}### ${substantiveTitle}: الدفوع والردود الموضوعية
بالنظر إلى ما ساقه المدعي من ادعاءات عارية عن الصحة، نوضح لفضيلتكم الحقائق التالية:
${a.substantiveDefenses || 'ادعاءات المدعي تفتقر إلى البينة المؤيدة، وحقيقة الأمر هي براءة ذمة موكلي من المبالغ المدعى بها، استناداً إلى المخالصة والمستندات المقدمة رفق هذه المذكرة.'}

### ${requestsTitle}: الطلبات الختامية
تأسيساً على ما سلف بيانه، نلتمس من عدالة الدائرة الحكم بما يلي:
${a.counterRequests || '1. الحكم برد الدعوى وبطلان طلبات المدعي.\n2. إلزام المدعي بأتعاب المحاماة والتعويض عن أضرار التقاضي الكيدي.'}

**سائلين الله لفضيلتكم العون والسداد،،**  
**وكيل المدعى عليه**
`
}

export function generateAppealPleading(a: Record<string, any>): string {
  return `# لائحة اعتراضية (استئناف حكم)

**لدى أصحاب الفضيلة رئيس وأعضاء محكمة الاستئناف الموقرين**  
**المستأنف:** ${a.appellantName || '—'}.  
**المستأنف ضده:** ${a.appelleeName || '—'}.  
**موضوع الاعتراض:** استئناف الحكم الصادر برقم: **(${a.judgmentNumber || '—'})** عن: **(${a.issuingCourt || 'المحكمة المختصة'})**.

---

السلام عليكم ورحمة الله وبركاته،،  
نرفع لفضيلتكم هذه اللائحة الاعتراضية استناداً للمادة (176) وما بعدها من نظام المرافعات الشرعية، للأسباب التالية:

### أولاً: من حيث الشكل
قُدم هذا الاستئناف خلال المهلة النظامية المحددة بثلاثين يوماً من تاريخ استلام صك الحكم، فهو مقبول شكلاً.

### ثانياً: من حيث الموضوع (أسباب الاستئناف)
شاب الحكم المستأنف عيوب جوهرية توجب نقضه، وبيان ذلك كالتالي:
${a.appealGrounds || '1. القصور في التسبيب والفساد في الاستدلال: حيث التفتت الدائرة عن الدفاع الجوهري المقدم من المستأنف.\n2. الخطأ في تطبيق وتأويل القواعد النظامية واجبة التطبيق.'}

### ثالثاً: الطلبات
بناءً على ما سلف بيانه، يلتمس المستأنف من عدالة المحكمة:
${a.appellantRequests || '1. قبول الاستئناف شكلاً.\n2. في الموضوع: إلغاء الحكم المستأنف والقضاء مجدداً برفض الدعوى.'}

**وفقكم الله وسدد خطاكم،،**  
**وكيل المستأنف**
`
}

// ==========================================
// Template Registry
// ==========================================

export const TEMPLATES: Record<TemplateId, DocumentTemplate> = {
  employment: {
    id: 'employment',
    category: 'contract',
    titleAr: 'عقد عمل سعودي محدد المدة',
    titleEn: 'Saudi Fixed-Term Employment Contract',
    descriptionAr: 'عقد عمل متوافق مع نظام العمل السعودي واللوائح التنفيذية ومنصة قوى',
    descriptionEn: 'Compliant with Saudi Labor Law, implementing regulations, and Qiwa platform standards',
    defaultDocType: 'employment',
    safeguards: GLOBAL_SAFEGUARDS.filter((s) => ['labor-probation-max', 'labor-non-compete', 'civil-penalty-clause'].includes(s.id)),
    fields: [
      { id: 'employerName', labelAr: 'اسم صاحب العمل / المنشأة', labelEn: 'Employer / Company Name', type: 'text', required: true, placeholderAr: 'شركة سند للخدمات التقنية' },
      { id: 'employerCr', labelAr: 'رقم السجل التجاري', labelEn: 'Commercial Registration (CR)', type: 'text', required: true, placeholderAr: '1010XXXXXX' },
      { id: 'employeeName', labelAr: 'اسم الموظف الثلاثي', labelEn: 'Employee Full Name', type: 'text', required: true, placeholderAr: 'عبدالله بن فهد المنصور' },
      { id: 'employeeId', labelAr: 'رقم الهوية الوطنية / الإقامة', labelEn: 'National ID / Iqama', type: 'text', required: true, placeholderAr: '1XXXXXXXXX' },
      { id: 'jobTitle', labelAr: 'المسمى الوظيفي', labelEn: 'Job Title', type: 'text', required: true, placeholderAr: 'مستشار قانوني أول' },
      { id: 'basicSalary', labelAr: 'الراتب الأساسي (ريال)', labelEn: 'Basic Salary (SAR)', type: 'number', required: true, defaultValue: 12000 },
      { id: 'housingAllowance', labelAr: 'بدل السكن (ريال)', labelEn: 'Housing Allowance (SAR)', type: 'number', defaultValue: 3000 },
      { id: 'transportAllowance', labelAr: 'بدل النقل (ريال)', labelEn: 'Transport Allowance (SAR)', type: 'number', defaultValue: 1000 },
      { id: 'contractDurationMonths', labelAr: 'مدة العقد (بالأشهر)', labelEn: 'Contract Duration (Months)', type: 'number', required: true, defaultValue: 12 },
      { id: 'probationPeriod', labelAr: 'فترة التجربة (بالأيام)', labelEn: 'Probation Period (Days)', type: 'number', defaultValue: 90, helpTextAr: 'الحد الأقصى 90 يوماً ويجوز تمديدها كتابة إلى 180 يوماً' },
      { id: 'workCity', labelAr: 'مدينة مقر العمل', labelEn: 'Work Location / City', type: 'text', defaultValue: 'الرياض' },
      { id: 'hasNonCompete', labelAr: 'إدراج شرط عدم المنافسة (م/83)', labelEn: 'Include Non-Compete Clause', type: 'select', defaultValue: 'yes', options: [{ value: 'yes', labelAr: 'نعم', labelEn: 'Yes' }, { value: 'no', labelAr: 'لا', labelEn: 'No' }] },
      { id: 'nonCompeteScope', labelAr: 'نطاق عدم المنافسة ومكانه', labelEn: 'Non-Compete Geographic Scope', type: 'text', placeholderAr: 'منطقة الرياض في قطاع التقنية القانونية لمدة سنة واحدة' },
    ],
    generateFallback: generateEmploymentContract,
  },

  nda: {
    id: 'nda',
    category: 'contract',
    titleAr: 'اتفاقية عدم إفصاح وسرية معلومات (NDA)',
    titleEn: 'Non-Disclosure & Confidentiality Agreement',
    descriptionAr: 'اتفاقية حماية الأسرار التجارية والبيانات الشخصية متوافقة مع الأنظمة السعودية',
    descriptionEn: 'Protects trade secrets and personal data under Saudi PDPL and commercial secrecy regulations',
    defaultDocType: 'nda',
    safeguards: GLOBAL_SAFEGUARDS.filter((s) => ['pdpl-data-confidentiality', 'civil-penalty-clause'].includes(s.id)),
    fields: [
      { id: 'disclosingParty', labelAr: 'الطرف المفصح', labelEn: 'Disclosing Party', type: 'text', required: true, placeholderAr: 'شركة التقنية المتقدمة' },
      { id: 'disclosingCr', labelAr: 'سجل تجاري / هوية المفصح', labelEn: 'Disclosing Party CR/ID', type: 'text', required: true, placeholderAr: '1010XXXXXX' },
      { id: 'receivingParty', labelAr: 'الطرف المتلقي', labelEn: 'Receiving Party', type: 'text', required: true, placeholderAr: 'شركة الاستشارات الرقمية' },
      { id: 'receivingCr', labelAr: 'سجل تجاري / هوية المتلقي', labelEn: 'Receiving Party CR/ID', type: 'text', required: true, placeholderAr: '1010YYYYYY' },
      { id: 'purpose', labelAr: 'الغرض من الإفصاح والتعامل', labelEn: 'Purpose of Disclosure', type: 'textarea', required: true, placeholderAr: 'تقييم فرصة الشراكة الاستثمارية وتطوير الحلول البرمجية المشتركة' },
      { id: 'confidentialityYears', labelAr: 'مدة الالتزام بالسرية (سنوات)', labelEn: 'Confidentiality Period (Years)', type: 'number', defaultValue: 3 },
      { id: 'penaltyClause', labelAr: 'التعويض الاتفاقي في حال الإخلال (ريال)', labelEn: 'Liquidated Damages (SAR)', type: 'number', placeholderAr: '100000' },
      { id: 'city', labelAr: 'مدينة الاختصاص القضائي', labelEn: 'Governing City', type: 'text', defaultValue: 'الرياض' },
    ],
    generateFallback: generateNda,
  },

  services: {
    id: 'services',
    category: 'contract',
    titleAr: 'عقد تقديم خدمات مهنية واستشارية',
    titleEn: 'Professional Services & Consulting Agreement',
    descriptionAr: 'عقد مقاولة وتقديم خدمات احترافي متوافق مع نظام المعاملات المدنية ونظام الشركات',
    descriptionEn: 'Professional contracting agreement under the Saudi Civil Transactions Law framework',
    defaultDocType: 'msa',
    safeguards: GLOBAL_SAFEGUARDS.filter((s) => ['civil-penalty-clause', 'civil-hardship-unforeseen'].includes(s.id)),
    fields: [
      { id: 'clientName', labelAr: 'اسم العميل (الطرف الأول)', labelEn: 'Client Name (First Party)', type: 'text', required: true, placeholderAr: 'شركة الرواد للتطوير' },
      { id: 'clientCr', labelAr: 'السجل التجاري للعميل', labelEn: 'Client CR', type: 'text', required: true, placeholderAr: '1010XXXXXX' },
      { id: 'providerName', labelAr: 'اسم مقدم الخدمة (الطرف الثاني)', labelEn: 'Service Provider Name', type: 'text', required: true, placeholderAr: 'مكتب الخبير للاستشارات' },
      { id: 'providerCr', labelAr: 'سجل / ترخيص مقدم الخدمة', labelEn: 'Provider CR/License', type: 'text', required: true, placeholderAr: '1010YYYYYY' },
      { id: 'scopeOfWork', labelAr: 'نطاق الخدمات والمهام المطلوبة', labelEn: 'Scope of Work', type: 'textarea', required: true, placeholderAr: 'تقديم استشارات التحول الرقمي وحوكمة البيانات وإعداد اللوائح الداخلية للمنشأة' },
      { id: 'totalFee', labelAr: 'إجمالي المقابل المالي (ريال)', labelEn: 'Total Fee (SAR)', type: 'number', required: true, defaultValue: 50000 },
      { id: 'paymentTerms', labelAr: 'جدول الدفعات', labelEn: 'Payment Terms', type: 'text', defaultValue: '50% دفعة مقدمة، و50% عند التسليم النهائي واعتماد المخرجات' },
      { id: 'durationDays', labelAr: 'مدة إنجاز الخدمات (أيام)', labelEn: 'Completion Duration (Days)', type: 'number', defaultValue: 60 },
      { id: 'penaltyClause', labelAr: 'غرامة التأخير عن كل يوم تأخير (ريال)', labelEn: 'Delay Liquidated Damages per Day', type: 'number', placeholderAr: '500' },
    ],
    generateFallback: generateServicesContract,
  },

  settlement: {
    id: 'settlement',
    category: 'contract',
    titleAr: 'اتفاقية تسوية ودية وإنهاء نزاع',
    titleEn: 'Settlement & Release Agreement',
    descriptionAr: 'اتفاقية صلح قانونية تنهي الخصومات وتبرئ الذمم وفق أحكام الصلح في نظام المعاملات المدنية',
    descriptionEn: 'Amicable settlement and full release under Saudi Civil Transactions Law conciliation provisions',
    defaultDocType: 'policy',
    safeguards: GLOBAL_SAFEGUARDS.filter((s) => ['civil-hardship-unforeseen'].includes(s.id)),
    fields: [
      { id: 'firstParty', labelAr: 'الطرف الأول (الدائن / المتنازل)', labelEn: 'First Party (Creditor / Claimant)', type: 'text', required: true, placeholderAr: 'مؤسسة البناء الحديث' },
      { id: 'secondParty', labelAr: 'الطرف الثاني (المدين / المستفيد)', labelEn: 'Second Party (Debtor)', type: 'text', required: true, placeholderAr: 'شركة المقاولات المتحدة' },
      { id: 'disputeSummary', labelAr: 'موضوع النزاع السابق أو رقم القضية', labelEn: 'Subject of Dispute or Case No.', type: 'textarea', required: true, placeholderAr: 'المطالبة بمستحقات مالية عن عقد توريد مؤرخ في 2024/01/15' },
      { id: 'settlementAmount', labelAr: 'مبلغ التسوية المتفق عليه (ريال)', labelEn: 'Settlement Amount (SAR)', type: 'number', required: true, defaultValue: 100000 },
      { id: 'settlementTerms', labelAr: 'شروط ومواعيد السداد', labelEn: 'Payment Terms / Milestones', type: 'text', defaultValue: 'حوالة بنكية واحدة فور توقيع هذه الاتفاقية' },
    ],
    generateFallback: generateSettlementAgreement,
  },

  claim: {
    id: 'claim',
    category: 'pleading',
    titleAr: 'صحيفة دعوى افتتاحية (ناجز)',
    titleEn: 'Statement of Claim (Najiz / Commercial & General Courts)',
    descriptionAr: 'تحرير وقائع الدعوى وأسانيدها الشرعية والنظامية وطلباتها الختامية وفق معايير المحاكم السعودية',
    descriptionEn: 'Structured initial statement of claim compliant with the Saudi Law of Procedure and Commercial Courts',
    defaultDocType: 'policy',
    safeguards: GLOBAL_SAFEGUARDS.filter((s) => ['civil-hardship-unforeseen'].includes(s.id)),
    fields: [
      { id: 'courtName', labelAr: 'المحكمة المختصة', labelEn: 'Competent Court', type: 'select', required: true, defaultValue: 'commercial', options: [
        { value: 'commercial', labelAr: 'المحكمة التجارية', labelEn: 'Commercial Court' },
        { value: 'general', labelAr: 'المحكمة العامة', labelEn: 'General Court' },
        { value: 'labor', labelAr: 'المحكمة العمالية', labelEn: 'Labor Court' },
        { value: 'admin', labelAr: 'المحكمة الإدارية (ديوان المظالم)', labelEn: 'Administrative Court (Board of Grievances)' },
      ]},
      { id: 'plaintiffName', labelAr: 'اسم المدعي / طالب القيد', labelEn: 'Plaintiff Name', type: 'text', required: true, placeholderAr: 'شركة النماء المحدودة' },
      { id: 'plaintiffId', labelAr: 'سجل تجاري / هوية المدعي', labelEn: 'Plaintiff CR/ID', type: 'text', required: true, placeholderAr: '1010XXXXXX' },
      { id: 'defendantName', labelAr: 'اسم المدعى عليه', labelEn: 'Defendant Name', type: 'text', required: true, placeholderAr: 'مؤسسة الأفق للتجارة' },
      { id: 'defendantId', labelAr: 'سجل تجاري / هوية المدعى عليه', labelEn: 'Defendant CR/ID', type: 'text', required: true, placeholderAr: '1010YYYYYY' },
      { id: 'facts', labelAr: 'وقائع الدعوى بالتسلسل الزمني', labelEn: 'Chronological Facts of the Claim', type: 'textarea', required: true, placeholderAr: 'بتاريخ 2024/02/01 تعاقد موكلي مع المدعى عليه لتوريد بضائع... وقد امتنع المدعى عليه عن السداد رغم استلامه للمبيع...' },
      { id: 'legalGrounds', labelAr: 'الأسانيد النظامية والشرعية', labelEn: 'Legal & Sharia Grounds', type: 'textarea', required: true, defaultValue: 'استناداً إلى المادة (80) من نظام المحاكم التجارية، وأحكام عقد البيع في نظام المعاملات المدنية، والقاعدة الشرعية: "المسلمون على شروطهم"' },
      { id: 'requests', labelAr: 'الطلبات الختامية الجازمة', labelEn: 'Final Claims / Remedies Sought', type: 'textarea', required: true, placeholderAr: '1. إلزام المدعى عليه بسداد أصل المبلغ وقدره (500,000) ريال.\n2. إلزامه بأتعاب المحاماة وقدرها (50,000) ريال.' },
    ],
    generateFallback: generateClaimPleading,
  },

  defense: {
    id: 'defense',
    category: 'pleading',
    titleAr: 'مذكرة جوابية ورد دفوع',
    titleEn: 'Statement of Defense & Answer to Pleadings',
    descriptionAr: 'مذكرة رد قانونية مفصلة تبدأ بالدفوع الشكلية ثم الموضوعية مع الطلبات المقابلة',
    descriptionEn: 'Detailed formal and substantive legal defense memorandum organized by statutory defenses',
    defaultDocType: 'policy',
    safeguards: GLOBAL_SAFEGUARDS.filter((s) => ['pleading-formal-defenses-order'].includes(s.id)),
    fields: [
      { id: 'caseNumber', labelAr: 'رقم القضية في ناجز', labelEn: 'Najiz Case Number', type: 'text', required: true, placeholderAr: '4510XXXXXX' },
      { id: 'courtCircuit', labelAr: 'المحكمة والدائرة القضائية', labelEn: 'Court & Judicial Circuit', type: 'text', required: true, placeholderAr: 'المحكمة التجارية بالرياض - الدائرة الخامسة' },
      { id: 'defendantName', labelAr: 'اسم المدعى عليه (موكلي)', labelEn: 'Defendant Name (My Client)', type: 'text', required: true, placeholderAr: 'شركة الوفاق للصناعة' },
      { id: 'plaintiffName', labelAr: 'اسم المدعي (الخصم)', labelEn: 'Plaintiff / Opposing Party', type: 'text', required: true, placeholderAr: 'مؤسسة التوريد العالمية' },
      { id: 'formalDefenses', labelAr: 'الدفوع الشكلية (إن وجدت)', labelEn: 'Formal / Jurisdictional Defenses', type: 'textarea', placeholderAr: 'الدفع بعدم الاختصاص النوعي / انعدام صفة المدعي استناداً للمادة 75 من نظام المرافعات الشرعية' },
      { id: 'substantiveDefenses', labelAr: 'الدفوع والردود الموضوعية', labelEn: 'Substantive Defenses on Merits', type: 'textarea', required: true, placeholderAr: 'تفنيد ادعاءات الخصم: المدعي لم يلتزم بالمواصفات المتفق عليها وتم إخطاره بذلك رسمياً، مع تقديم مستندات الفحص' },
      { id: 'counterRequests', labelAr: 'الطلبات الختامية', labelEn: 'Final Relief Requested', type: 'textarea', required: true, defaultValue: 'أصلياً: رد الدعوى وإخلاء سبيل موكلي منها لعدم الصحة.\nاحتياطياً: إلزام المدعي بأتعاب المحاماة وتحميله مصاريف التقاضي.' },
    ],
    generateFallback: generateDefensePleading,
  },

  appeal: {
    id: 'appeal',
    category: 'pleading',
    titleAr: 'لائحة اعتراضية واستئناف حكم',
    titleEn: 'Appeal Memorandum (Grounds of Appeal)',
    descriptionAr: 'لائحة استئناف تركز على عيوب الحكم: القصور في التسبيب، الخطأ في تطبيق النظام، الإخلال بحق الدفاع',
    descriptionEn: 'Formal appellate brief focusing on judicial reasoning defects, statutory misapplication, or defense violations',
    defaultDocType: 'policy',
    safeguards: GLOBAL_SAFEGUARDS.filter((s) => ['pleading-appeal-deadlines'].includes(s.id)),
    fields: [
      { id: 'judgmentNumber', labelAr: 'رقم صك الحكم المستأنف وتاريخه', labelEn: 'Judgment Number & Date', type: 'text', required: true, placeholderAr: 'صك رقم 453000000 وتاريخ 1446/02/10هـ' },
      { id: 'issuingCourt', labelAr: 'المحكمة مصدرة الحكم', labelEn: 'Issuing Court / Circuit', type: 'text', required: true, placeholderAr: 'المحكمة التجارية بالرياض - الدائرة الابتدائية الثالثة' },
      { id: 'appellantName', labelAr: 'اسم المستأنف (موكلي)', labelEn: 'Appellant Name', type: 'text', required: true, placeholderAr: 'شركة الأفق للاستثمار' },
      { id: 'appelleeName', labelAr: 'اسم المستأنف ضده', labelEn: 'Appellee Name', type: 'text', required: true, placeholderAr: 'مؤسسة النور' },
      { id: 'appealGrounds', labelAr: 'أوجه الاعتراض ومواطن القصور في الحكم', labelEn: 'Grounds of Appeal (Defects in Reasoning/Law)', type: 'textarea', required: true, placeholderAr: '1. القصور في التسبيب: إغفال الدائرة لمستند الدفع بالسداد.\n2. الخطأ في تطبيق النظام: مخالفة نص المادة (174) من نظام المعاملات المدنية.' },
      { id: 'appellantRequests', labelAr: 'الطلبات في الاستئناف', labelEn: 'Appellate Relief Sought', type: 'textarea', required: true, defaultValue: 'أولاً: قبول الاستئناف شكلاً لتقديمه في الميعاد النظامي.\nثانياً: في الموضوع: نقض الحكم المستأنف والحكم مجدداً برد دعوى المستأنف ضده.' },
    ],
    generateFallback: generateAppealPleading,
  },
}
