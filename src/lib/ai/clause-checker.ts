export interface ClauseCheckResult {
  valid: boolean
  status: 'flagged' | 'valid' | 'needs_lawyer_review'
  score: number
  law: string
  article: string
  violation: string
  recommendation: string
  engine: 'rule' | 'ollama'
}

export function runDeterministicClauseRules(rawText: string): ClauseCheckResult & { matchedRule: boolean } {
  const text = rawText.trim()

  // 1. Non-compete (Saudi Labor Law Art. 83)
  if (/منافس|عدم العمل|عدم المنافسة/.test(text)) {
    const hasOverLimit = /خمس|ثلاث|أربع|عشر|[3-9]\s*سنوات|مدى الحياة|دون قيد|كامل المملكة/.test(text)
    if (hasOverLimit) {
      return {
        valid: false,
        status: 'flagged',
        score: 42,
        law: 'نظام العمل (م/83)',
        article: 'المادة (83) من نظام العمل السعودي',
        violation:
          'اشتراط عدم المنافسة لمدة تتجاوز الحد الأقصى النظامي (سنتان)، أو إطلاق المنع في كامل المملكة دون تحديد مكاني ونوعي صريح يجعله عرضة للبطلان القضائي.',
        recommendation:
          'يلتزم الطرف الثاني بعدم منافسة الطرف الأول في نشاط (المقاولات) داخل مدينة (الرياض) لمدة (سنة واحدة) تبدأ من تاريخ انتهاء عقد العمل، حفظاً لأسرار العمل المشروعة.',
        engine: 'rule',
        matchedRule: true,
      }
    }
    return {
      valid: true,
      status: 'valid',
      score: 94,
      law: 'نظام العمل (م/83)',
      article: 'المادة (83) من نظام العمل السعودي',
      violation: 'لم يرصد الفحص الأولي تجاوزاً للحد الأقصى النظامي (سنتان) أو إطلاقاً غير مقيد للمنع المكاني والنوعي.',
      recommendation: text,
      engine: 'rule',
      matchedRule: true,
    }
  }

  // 2. Probation period (Saudi Labor Law Art. 53 — amended effective Feb 2025 via Royal Decree M/44:
  //    up to 180 days total allowed directly in the written employment contract)
  if (/تجربة|فترة التجربة/.test(text)) {
    const exceeds180 =
      /(?:18[1-9]|19\d|[2-9]\d{2})\s*يوم|سبعة أشهر|ثمانية أشهر|تسعة أشهر|عشرة أشهر|سنة|سنتين|سنتان|(?:[7-9]|1[0-2])\s*(?:أشهر|شهور|شهر)/.test(
        text,
      )
    if (exceeds180) {
      return {
        valid: false,
        status: 'flagged',
        score: 45,
        law: 'نظام العمل (م/53 المعدلة 2025)',
        article: 'المادة (53) من نظام العمل السعودي — تعديلات المرسوم الملكي م/44',
        violation:
          'الحد الأقصى النظامي لفترة التجربة وفق التعديلات السارية من فبراير 2025 هو 180 يوماً كحد أقصى مكتوب في عقد العمل؛ وما زاد على 180 يوماً مخالف للنظام.',
        recommendation:
          'يخضع الطرف الثاني لفترة تجربة لا تتجاوز (180) يوماً من تاريخ مباشرة العمل، وتُثبت مدتها كتابةً في عقد العمل الموحد وفق المادة (53) من نظام العمل المعدلة.',
        engine: 'rule',
        matchedRule: true,
      }
    }
    return {
      valid: true,
      status: 'valid',
      score: 94,
      law: 'نظام العمل (م/53 المعدلة 2025)',
      article: 'المادة (53) من نظام العمل السعودي — تعديلات المرسوم الملكي م/44',
      violation:
        'فترة التجربة لا تتجاوز الحد الأقصى النظامي الساري (180 يوماً). يُوصى بالتحقق من خلو العقد من أي استثناءات إجازات غير محتسبة ومراجعته مع محامٍ عند الحاجة.',
      recommendation: text,
      engine: 'rule',
      matchedRule: true,
    }
  }

  // 3. Liquidated damages / judicial review waiver (Civil Transactions Law Art. 179)
  if (/شرط جزائي|غرامة قطعية|تعويض قطعي|لا يحق للقضاء|دون سلطة للمحكمة|دون رقابة القضاء/.test(text)) {
    const waivesCourt = /قطعية|قطعي|لا يحق للقضاء|دون سلطة للمحكمة|دون حاجة لإثبات الضرر/.test(text)
    if (waivesCourt) {
      return {
        valid: false,
        status: 'flagged',
        score: 55,
        law: 'المعاملات المدنية (م/179)',
        article: 'المادة (179) من نظام المعاملات المدنية',
        violation:
          'النص على عدم جواز تدخل القضاء باطل نظاماً؛ إذ للمحكمة بناءً على طلب المدين تخفيض التعويض المتفق عليه إذا ثبت أن التعويض كان مبالغاً فيه أو أن الالتزام نُفذ جزئياً.',
        recommendation:
          'في حال إخلال المدين بالتزامه في الموعد المحدد، يستحق الدائن تعويضاً اتفاقياً عن الضرر الفعلي، وتخضع تقديرات التعويض للضوابط النظامية المقررة بالمادة 179 من نظام المعاملات المدنية.',
        engine: 'rule',
        matchedRule: true,
      }
    }
  }

  // 4. Unlawful wage deductions (Saudi Labor Law Arts. 91–93)
  if (/حسم|خصم|اقتطاع/.test(text) && /أجر|راتب/.test(text)) {
    const unlawfulDeduction =
      /دون موافقة|بدون موافقة|([6-9]\d|100)\s*%|كامل الأجر|نصف الأجر/.test(text)
    if (unlawfulDeduction) {
      return {
        valid: false,
        status: 'flagged',
        score: 38,
        law: 'نظام العمل (م/91–93)',
        article: 'المواد (91، 92، 93) من نظام العمل السعودي',
        violation:
          'لا يجوز حسم أي مبلغ من أجور العامل لقاء حقوق خاصة دون موافقة خطية منه إلا في الحالات المحددة نظاماً بالمادة (92)، ولا يجوز في جميع الأحوال أن تزيد نسبة المبالغ المحسومة على نصف أجر العامل المستحق (50%) وفق المادة (93).',
        recommendation:
          'لا يجوز حسم أي مبالغ من أجر العامل إلا بموجب موافقة كتابية صريحة منه أو في الحالات المنصوص عليها في المادة (92) من نظام العمل، وبما لا يتجاوز في جميع الأحوال سقف الـ (50%) المقرر بالمادة (93).',
        engine: 'rule',
        matchedRule: true,
      }
    }
  }

  // 5. Retaining passport / residency ID (Saudi Labor Law Art. 61 & Ministerial Circulars)
  if (/احتجاز.*جواز|حفظ.*جواز السفر|تسليم جواز السفر|احتجاز.*هوية|احتجاز.*إقامة/.test(text)) {
    return {
      valid: false,
      status: 'flagged',
      score: 25,
      law: 'نظام العمل (م/61)',
      article: 'المادة (61) من نظام العمل السعودي والقرارات الوزارية',
      violation:
        'يُحظر نظاماً على صاحب العمل احتجاز جواز سفر العامل أو إقامته أو وثائقه الرسمية أو إجباره على تسليمها كضمان.',
      recommendation:
        'يحتفظ الطرف الثاني بكافة وثائقه الثبوتية وجواز سفره، ويلتزم بإبرازها عند الحاجة لإتمام الإجراءات النظامية الرسمية فقط.',
      engine: 'rule',
      matchedRule: true,
    }
  }

  // 6. Unilateral termination without notice/compensation (Labor Law Art. 75/77/80)
  if (/إنهاء العقد.*دون إشعار|فصل.*دون تعويض|إنهاء فوري دون مكافأة/.test(text) && !/المادة 80|م80/.test(text)) {
    return {
      valid: false,
      status: 'flagged',
      score: 46,
      law: 'نظام العمل (م/75 و م/77 و م/80)',
      article: 'المواد (75، 77، 80) من نظام العمل السعودي',
      violation:
        'لا يجوز حرمان العامل من مهلة الإشعار أو مكافأة نهاية الخدمة إلا في الحالات الحصرية الواردة بالمادة (80) من نظام العمل وبعد إتاحة حق سماع أقواله.',
      recommendation:
        'يحق لأي من الطرفين إنهاء العقد غير المحدد المدة لسبب مشروع بموجب إشعار كتابي وفق المهلة النظامية، مع حفظ كامل الحقوق النظامية ومكافأة نهاية الخدمة وفق نظام العمل.',
      engine: 'rule',
      matchedRule: true,
    }
  }

  // 7. Cross-border personal data transfer (PDPL Art. 29)
  if (/خارج المملكة|خوادم خارجية|نقل البيانات.*دولياً/.test(text) && !/المادة 29|سدايا|ضمانات كافية/.test(text)) {
    return {
      valid: false,
      status: 'flagged',
      score: 50,
      law: 'نظام حماية البيانات الشخصية (م/29)',
      article: 'المادة (29) من نظام حماية البيانات الشخصية (PDPL)',
      violation:
        'نقل البيانات الشخصية خارج المملكة مقيد بوجود مستوى حماية كافٍ واستيفاء الضوابط والاشتراطات الصادرة عن (سدايا) وتقييم أثر النقل.',
      recommendation:
        'تُحفظ وتُعالج كافة البيانات الشخصية وفق ضوابط النظام، ولا يجوز نقلها خارج المملكة إلا بعد استيفاء متطلبات المادة (29) من نظام حماية البيانات الشخصية ولوائحه التنفيذية.',
      engine: 'rule',
      matchedRule: true,
    }
  }

  return {
    valid: false,
    status: 'needs_lawyer_review',
    score: 0,
    law: 'خارج قواعد الفحص الأولي الثابتة',
    article: 'يتطلب مراجعة محامٍ مختص',
    violation:
      'لم ينطبق أي نمط معروف من قائمة الفحص الأولي على هذا النص. عدم ظهور تنبيه آلي لا يعني سلامة البند نظامياً؛ يُوصى بمراجعته مع محامٍ مرخّص.',
    recommendation: text,
    engine: 'rule',
    matchedRule: false,
  }
}
