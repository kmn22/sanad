

export interface DailyBriefItem {
  id: string
  title: string
  summary: string
  source: string
  category: string
  url?: string | null
  publishedAt: string
  createdAt: string
  readTimeMin?: number
  gazetteIssue?: string
  practicalImpact?: string
}

export const CATEGORY_MAP: Record<string, { labelAr: string; labelEn: string; color: string }> = {
  regulation: { labelAr: 'أنظمة ولوائح', labelEn: 'Regulations', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  labor: { labelAr: 'العمل والتوطين', labelEn: 'Labor & HR', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  tax: { labelAr: 'الزكاة والضريبة', labelEn: 'ZATCA & Tax', color: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30' },
  commercial: { labelAr: 'المعاملات التجارية', labelEn: 'Commercial', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  corporate: { labelAr: 'الشركات والاستثمار', labelEn: 'Corporate', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' },
  ip: { labelAr: 'الملكية الفكرية', labelEn: 'IP & Patents', color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' },
}

export interface NewsletterIssue {
  id: string
  issueNumber: number
  title: string
  dateHijri: string
  dateGregorian: string
  summary: string
  leadTopic: string
  highlights: string[]
  readTime: string
}

export const NEWSLETTER_ISSUES: NewsletterIssue[] = [
  {
    id: 'issue-12',
    issueNumber: 12,
    title: 'العدد الثاني عشر: الدليل الشامل لتعديلات نظام المحاكم التجارية ولائحة الوساطة الإلزامية',
    dateHijri: '24 ربيع الأول 1448هـ',
    dateGregorian: '25 سبتمبر 2026م',
    summary: 'قراءة تحليلية في القرارات الوزارية المحدثة لاختصاصات الدوائر التجارية، معايير جلسات التهيئة والتحضير خلال 20 يوماً، والشروط الشكلية لقبول الدعوى عبر منصة تراضي.',
    leadTopic: 'إلزامية اللجوء إلى المصالحة قبل قيد الدعاوى دون مليون ريال وعواقب إغفال الإخطار الكتابي.',
    highlights: [
      'وجوب إخطار المدعى عليه كتابةً قبل 15 يوماً من قيد الدعوى التجارية.',
      'تفعيل مسار تسوية المنازعات عبر منصة تراضي كشرط شكلي لسماع الدعوى.',
      'صلاحيات القاضي المشرف في شطب الدعوى لعدم الجدية أو تخلف الأطراف.',
    ],
    readTime: '3 دقائق',
  },
  {
    id: 'issue-11',
    issueNumber: 11,
    title: 'العدد الحادي عشر: الجاهزية الفنية والضريبية للمرحلة الثانية من الفوترة الإلكترونية (ZATCA)',
    dateHijri: '17 ربيع الأول 1448هـ',
    dateGregorian: '18 سبتمبر 2026م',
    summary: 'استعراض متطلبات الربط والتكامل المباشر مع منصة فاتورة وتشفير الأختام الرقمية وفق معايير هيئة الزكاة والضريبة والجمارك وتجنب الغرامات.',
    leadTopic: 'الالتزام بإصدار فواتير ضريبية بصيغة XML المعتمدة وتوليد رمز الاستجابة السريع TLV المشفر.',
    highlights: [
      'شمول المجموعة الحادية عشرة من المنشآت التي تتجاوز إيراداتها 15 مليون ريال.',
      'غرامات مخالفة إصدار الفواتير الإلكترونية تبدأ من 1,000 ريال وتتصاعد إلى 50,000 ريال.',
      'حظر إصدار فواتير يدوية للمنشآت المشمولة بالربط المباشر.',
    ],
    readTime: '4 دقائق',
  },
  {
    id: 'issue-10',
    issueNumber: 10,
    title: 'العدد العاشر: الحماية النظامية للأسرار التجارية وضوابط شروط عدم المنافسة في عقود العمل',
    dateHijri: '10 ربيع الأول 1448هـ',
    dateGregorian: '11 سبتمبر 2026م',
    summary: 'تحليل مشروع نظام حماية الأسرار التجارية الجديد عبر منصة استطلاع ومواءمته مع المادة (83) من نظام العمل واللائحة التنفيذية.',
    leadTopic: 'تشديد عقوبات إفشاء الأسرار التقنية والصناعية لتصل للسجن 5 سنوات وغرامات تصل لـ 5 ملايين ريال.',
    highlights: [
      'بطلان شرط عدم المنافسة إذا تجاوز سنتين أو كان غير محدد النطاق الجغرافي والنوعي.',
      'إلزامية قيد العقود الوظيفية عبر منصة قوى كمرجع إثبات وحيد أمام اللجان العمالية.',
      'أفضل ممارسات صياغة اتفاقيات عدم الإفصاح (NDA) للمنشآت والمحامين.',
    ],
    readTime: '3 دقائق',
  },
]
