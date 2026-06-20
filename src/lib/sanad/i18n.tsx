'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Lang = 'ar' | 'en'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  toggle: () => void
  t: (key: string, vars?: Record<string, string | number>) => string
}

const Ctx = createContext<LangCtx | null>(null)

const STORAGE_KEY = 'sanad.lang'

// ---- Translation catalogs ----
const translations: Record<Lang, Record<string, string>> = {
  ar: {
    // Brand
    'brand.name': 'سند',
    'brand.tagline': 'العمليات اليومية',
    'brand.full': 'سند — لوحة العمليات اليومية للامتثال والمحاماة',

    // Greetings
    'greeting.morning': 'صباح الخير، أحمد.',
    'greeting.afternoon': 'مساء الخير، أحمد.',
    'greeting.evening': 'مساء الخير، أحمد.',

    // Nav
    'nav.dashboard': 'لوحة التحكم',
    'nav.compliance': 'الامتثال',
    'nav.cases': 'لوحة القضايا',
    'nav.deepwork': 'العمل العميق',
    'nav.tasks': 'المهام',
    'nav.documents': 'المستندات',

    // Dashboard
    'dash.start_focus': 'ابدأ تركيز',
    'dash.tasks_count': '{n} مهمة',
    'dash.overdue_tasks': 'مهام متأخرة',
    'dash.needs_attention': 'تحتاج اهتمام فوري',
    'dash.expiring_soon': 'تنتهي قريباً',
    'dash.compliance_30': 'بنود الامتثال < 30 يوماً',
    'dash.urgent_cases': 'قضايا عاجلة',
    'dash.same_day': 'تتطلب إجراءً اليوم',
    'dash.active_cases': 'القضايا النشطة',
    'dash.open_tasks': 'المهام المفتوحة',
    'dash.due_today': 'مستحقة اليوم',
    'dash.billable_today': 'ساعات الفوترة اليوم',
    'dash.focus_today': 'ساعات التركيز اليوم',
    'dash.todays_priorities': 'أولويات اليوم',
    'dash.view_all': 'عرض الكل',
    'dash.no_tasks_today': 'لا مهام مستحقة اليوم. يوم مثالي للعمل العميق.',
    'dash.expiring_compliance': 'الامتثال الذي ينتهي قريباً',
    'dash.nothing_expiring': 'لا يوجد ما ينتهي خلال 30 يوماً.',
    'dash.daily_brief': 'الموجز اليومي',
    'dash.brief_subtitle': 'تحديثات وزارة العدل والموارد البشرية وهيئة الزكاة',
    'dash.read_more': 'اقرأ المزيد',
    'dash.docs_expiring': 'مستندات تنتهي هذا الشهر',
    'dash.d_left': '{n} يوم متبقٍ',
    'dash.d_overdue': 'متأخرة {n} يوم',
    'dash.no_data': 'لا توجد بيانات',
    'dash.failed_load': 'فشل تحميل البيانات.',
    'dash.retry': 'إعادة المحاولة',

    // Compliance
    'comp.title': 'متتبع الامتثال',
    'comp.subtitle': 'الإقامة، السجل التجاري، العقود، التأمينات، الضريبة — لا تفوّت أي تجديد.',
    'comp.add': 'إضافة بند',
    'comp.expired': 'منتهي',
    'comp.30days': 'أقل من 30 يوماً',
    'comp.90days': '30-90 يوماً',
    'comp.safe': 'سليم',
    'comp.filter': 'تصفية:',
    'comp.all': 'الكل ({n})',
    'comp.empty': 'لا توجد بنود في هذه الفئة.',
    'comp.expiry': 'الانتهاء',
    'comp.time_remaining': 'الوقت المتبقي',
    'comp.days_overdue': '{n} يوم متأخرة',
    'comp.days_left': '{n} يوم متبقٍ',
    'comp.mark_renewed': 'تحديد كمجدّد',
    'comp.renewed': 'تم التجديد لسنة إضافية',
    'comp.add_item': 'إضافة بند امتثال',
    'comp.f_title': 'العنوان',
    'comp.f_title_ph': 'مثال: تجديد إقامة',
    'comp.f_category': 'الفئة',
    'comp.f_entity': 'الكيان / الموظف',
    'comp.f_entity_ph': 'مثال: محمد سعيد',
    'comp.f_issue': 'تاريخ الإصدار',
    'comp.f_expiry': 'تاريخ الانتهاء',
    'comp.f_notes': 'ملاحظات',
    'comp.f_notes_ph': 'ملاحظات اختيارية',
    'comp.save': 'حفظ البند',
    'comp.cancel': 'إلغاء',
    'comp.req_fields': 'العنوان والكيان وتاريخ الانتهاء مطلوبة',

    // Cases
    'cases.title': 'لوحة القضايا',
    'cases.subtitle': 'اسحب القضايا بين المراحل. {n} نشطة.',
    'cases.new': 'قضية جديدة',
    'cases.drop_here': 'أفلت القضايا هنا',
    'cases.due': 'الاستحقاق',
    'cases.create': 'إنشاء قضية',
    'cases.f_title': 'عنوان القضية',
    'cases.f_client': 'العميل',
    'cases.f_type': 'النوع',
    'cases.f_stage': 'المرحلة',
    'cases.f_priority': 'الأولوية',
    'cases.f_due': 'تاريخ الاستحقاق',
    'cases.f_value': 'القيمة (ريال)',
    'cases.f_notes': 'ملاحظات',
    'cases.req_fields': 'العنوان والعميل مطلوبان',
    'cases.moved': 'تم النقل إلى {stage}',
    'cases.added': 'تمت إضافة القضية',

    // Case stages
    'stage.drafting': 'قيد الصياغة',
    'stage.client_review': 'مراجعة العميل',
    'stage.filed': 'مرفوعة',
    'stage.closed': 'مغلقة',

    // Case types
    'ctype.litigation': 'تقاضٍ',
    'ctype.contract': 'عقود',
    'ctype.consultation': 'استشارة',
    'ctype.ip': 'ملكية فكرية',
    'ctype.corporate': 'شركات',

    // Priorities
    'prio.low': 'منخفضة',
    'prio.normal': 'عادية',
    'prio.high': 'عالية',
    'prio.urgent': 'عاجلة',

    // Deep Work
    'dw.title': 'العمل العميق والفوترة',
    'dw.subtitle': 'جلسات تركيز بومودورو + ساعات قابلة للفوترة مرتبطة بملفات العملاء. حالة المؤقت محفوظة محلياً بين الزيارات.',
    'dw.active_session': 'الجلسة الحالية',
    'dw.mode_focus': 'تركيز عميق',
    'dw.mode_billable': 'قابل للفوترة',
    'dw.mode_break': 'استراحة',
    'dw.what_working': 'بمَ تعمل؟',
    'dw.what_ph': 'مثال: صياغة مراجعات اتفاقية الاستحواذ — صيدليات الخليج',
    'dw.bill_to_case': 'فوترة إلى قضية',
    'dw.select_case': 'اختر قضية',
    'dw.hourly_rate': 'السعر بالساعة (ريال)',
    'dw.start': 'ابدأ',
    'dw.pause': 'إيقاف مؤقت',
    'dw.stop_save': 'إيقاف وحفظ',
    'dw.in_progress': 'قيد التنفيذ',
    'dw.paused': 'متوقف مؤقتاً',
    'dw.today': 'اليوم',
    'dw.billable_hours': 'ساعات الفوترة',
    'dw.focus_time': 'وقت التركيز',
    'dw.focus_sessions': 'جلسات التركيز',
    'dw.billable_revenue': 'إيرادات الفوترة اليوم',
    'dw.recent_sessions': 'الجلسات الأخيرة',
    'dw.no_sessions': 'لم يتم تسجيل أي جلسات بعد.',
    'dw.session_complete': 'اكتملت جلسة {mode}!',
    'dw.stopped': 'تم إيقاف الجلسة',
    'dw.failed_save': 'فشل حفظ الجلسة',

    // Tasks
    'tasks.title': 'المهام',
    'tasks.subtitle': 'قوائم يومية + متابعات تلقائية من دورة حياة المستندات.',
    'tasks.new': 'مهمة جديدة',
    'tasks.all': 'الكل ({n})',
    'tasks.today': 'اليوم ({n})',
    'tasks.overdue': 'متأخرة ({n})',
    'tasks.auto': 'تلقائية ({n})',
    'tasks.from': 'من:',
    'tasks.auto_badge': 'تلقائي',
    'tasks.empty': 'لا توجد مهام هنا.',
    'tasks.create': 'إنشاء مهمة',
    'tasks.f_title': 'المهمة',
    'tasks.f_title_ph': 'مثال: تقديم إقرار ضريبة القيمة المضافة',
    'tasks.f_desc': 'الوصف',
    'tasks.f_priority': 'الأولوية',
    'tasks.f_due': 'تاريخ الاستحقاق',
    'tasks.f_case': 'ربط بقضية (اختياري)',
    'tasks.none': 'بدون',
    'tasks.added': 'تمت إضافة المهمة',
    'tasks.completed': 'تم إنجاز المهمة',
    'tasks.reopened': 'تمت إعادة فتح المهمة',

    // Documents
    'docs.title': 'المستندات',
    'docs.subtitle': 'تتبع كل مستند عبر دورة حياته كاملة — مسودة → مُرسل → ساري → منتهي.',
    'docs.add': 'إضافة مستند',
    'docs.set_status': 'تعيين الحالة',
    'docs.signed': 'موقّع',
    'docs.expires': 'ينتهي',
    'docs.d_overdue': 'متأخرة {n} يوم',
    'docs.empty': 'لا توجد مستندات بهذه الحالة.',
    'docs.added': 'تمت إضافة المستند — تم إنشاء المهام التلقائية عند الحاجة',
    'docs.autonote': 'إرسال اتفاقية سرية (NDA) ينشئ تلقائياً مهمة "متابعة التوقيع" خلال 3 أيام. العقود المنتهية الصلاحية تنشئ تذكيرات تجديد قبل 30 يوماً.',
    'docs.create': 'إضافة مستند',
    'docs.f_title': 'العنوان',
    'docs.f_title_ph': 'مثال: اتفاقية سرية مشتركة — تكو',
    'docs.f_type': 'النوع',
    'docs.f_status': 'الحالة',
    'docs.f_parties': 'الأطراف',
    'docs.f_parties_ph': 'مثال: سند القانوني ↔ تكو',
    'docs.f_signed': 'تاريخ التوقيع',
    'docs.f_expiry': 'تاريخ الانتهاء',
    'docs.f_case': 'ربط بقضية (اختياري)',
    'docs.f_notes': 'ملاحظات',
    'docs.req_fields': 'العنوان والأطراف مطلوبان',

    // Doc statuses
    'dstatus.draft': 'مسودة',
    'dstatus.sent': 'مُرسل للتوقيع',
    'dstatus.active': 'ساري',
    'dstatus.expiring': 'ينتهي قريباً',
    'dstatus.expired': 'منتهي',

    // Doc types
    'dtype.nda': 'اتفاقية سرية',
    'dtype.employment': 'عقد عمل',
    'dtype.non_compete': 'عدم منافسة',
    'dtype.msa': 'اتفاقية / تسوية',
    'dtype.subcontract': 'عقد مقاول فرعي',
    'dtype.policy': 'سياسة',

    // Compliance categories
    'cat.ikama': 'إقامة',
    'cat.cr': 'سجل تجاري',
    'cat.contract': 'عقد',
    'cat.license': 'رخصة',
    'cat.tax': 'ضريبة',
    'cat.gosi': 'تأمينات',

    // Brief sources
    'src.MoJ': 'وزارة العدل',
    'src.MHRSD': 'الموارد البشرية',
    'src.VAT': 'هيئة الزكاة',
    'src.local_tip': 'نصيحة محلية',

    // Common
    'common.refresh': 'تحديث',
    'common.theme': 'تبديل المظهر',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.create': 'إنشاء',
    'common.add': 'إضافة',
    'common.none': '—',
    'common.pwa_note': 'مثبت كتطبيق PWA. ثبّته على سطح المكتب للوصول اليومي.',
    'common.cache_note': 'المؤقت والواجهة محفوظة محلياً — عبء خادم ضئيل.',
    'common.footer_left': 'سند — لوحة العمليات اليومية للمحامين والمنشآت الصغيرة في السعودية',
    'common.footer_right': 'محسّن للخادم المنزلي · PWA مفعّل',
    'common.failed_load': 'فشل تحميل البيانات',

    // Session types
    'session.focus': 'تركيز',
    'session.billable': 'قابل للفوترة',
    'session.meeting': 'اجتماع',
  },

  en: {
    'brand.name': 'Sanad',
    'brand.tagline': 'Daily Operations',
    'brand.full': 'Sanad — Daily Legal & Compliance Dashboard',

    'greeting.morning': 'Good morning, Ahmed.',
    'greeting.afternoon': 'Good afternoon, Ahmed.',
    'greeting.evening': 'Good evening, Ahmed.',

    'nav.dashboard': 'Dashboard',
    'nav.compliance': 'Compliance',
    'nav.cases': 'Case Board',
    'nav.deepwork': 'Deep Work',
    'nav.tasks': 'Tasks',
    'nav.documents': 'Documents',

    'dash.start_focus': 'Start focus',
    'dash.tasks_count': '{n} tasks',
    'dash.overdue_tasks': 'Overdue tasks',
    'dash.needs_attention': 'Needs immediate attention',
    'dash.expiring_soon': 'Expiring soon',
    'dash.compliance_30': 'Compliance items < 30 days',
    'dash.urgent_cases': 'Urgent cases',
    'dash.same_day': 'Need same-day action',
    'dash.active_cases': 'Active cases',
    'dash.open_tasks': 'Open tasks',
    'dash.due_today': 'due today',
    'dash.billable_today': 'Billable today',
    'dash.focus_today': 'Focus today',
    'dash.todays_priorities': "Today's priorities",
    'dash.view_all': 'View all',
    'dash.no_tasks_today': 'No tasks due today. Perfect day for deep work.',
    'dash.expiring_compliance': 'Expiring compliance',
    'dash.nothing_expiring': 'Nothing expiring in the next 30 days.',
    'dash.daily_brief': 'Daily Brief',
    'dash.brief_subtitle': 'MoJ, MHRSD & ZATCA updates',
    'dash.read_more': 'Read more',
    'dash.docs_expiring': 'Documents expiring this month',
    'dash.d_left': '{n}d left',
    'dash.d_overdue': '{n}d overdue',
    'dash.no_data': 'No data',
    'dash.failed_load': 'Failed to load data.',
    'dash.retry': 'Retry',

    'comp.title': 'Compliance Tracker',
    'comp.subtitle': 'Iqama, CR, contracts, GOSI, VAT — never miss a renewal deadline.',
    'comp.add': 'Add item',
    'comp.expired': 'Expired',
    'comp.30days': '< 30 days',
    'comp.90days': '30-90 days',
    'comp.safe': 'Safe',
    'comp.filter': 'Filter:',
    'comp.all': 'All ({n})',
    'comp.empty': 'No items in this category.',
    'comp.expiry': 'Expiry',
    'comp.time_remaining': 'Time remaining',
    'comp.days_overdue': '{n} days overdue',
    'comp.days_left': '{n} days left',
    'comp.mark_renewed': 'Mark renewed',
    'comp.renewed': 'Renewed for another year',
    'comp.add_item': 'Add compliance item',
    'comp.f_title': 'Title',
    'comp.f_title_ph': 'e.g. Iqama Renewal',
    'comp.f_category': 'Category',
    'comp.f_entity': 'Entity / Employee',
    'comp.f_entity_ph': 'e.g. Mohammed Saeed',
    'comp.f_issue': 'Issue date',
    'comp.f_expiry': 'Expiry date',
    'comp.f_notes': 'Notes',
    'comp.f_notes_ph': 'Optional notes',
    'comp.save': 'Save item',
    'comp.cancel': 'Cancel',
    'comp.req_fields': 'Title, entity, and expiry date are required',

    'cases.title': 'Case Board',
    'cases.subtitle': 'Drag cases across stages. {n} active.',
    'cases.new': 'New case',
    'cases.drop_here': 'Drop cases here',
    'cases.due': 'Due',
    'cases.create': 'Create case',
    'cases.f_title': 'Case title',
    'cases.f_client': 'Client',
    'cases.f_type': 'Type',
    'cases.f_stage': 'Stage',
    'cases.f_priority': 'Priority',
    'cases.f_due': 'Due date',
    'cases.f_value': 'Value (SAR)',
    'cases.f_notes': 'Notes',
    'cases.req_fields': 'Title and client are required',
    'cases.moved': 'Moved to {stage}',
    'cases.added': 'Case added to board',

    'stage.drafting': 'Drafting',
    'stage.client_review': 'Client Review',
    'stage.filed': 'Filed',
    'stage.closed': 'Closed',

    'ctype.litigation': 'Litigation',
    'ctype.contract': 'Contract',
    'ctype.consultation': 'Consultation',
    'ctype.ip': 'IP / Trademark',
    'ctype.corporate': 'Corporate / M&A',

    'prio.low': 'Low',
    'prio.normal': 'Normal',
    'prio.high': 'High',
    'prio.urgent': 'Urgent',

    'dw.title': 'Deep Work & Billing',
    'dw.subtitle': 'Pomodoro focus sessions + billable hours tied to client files. Timer state persists locally between visits.',
    'dw.active_session': 'Active session',
    'dw.mode_focus': 'Deep Focus',
    'dw.mode_billable': 'Billable',
    'dw.mode_break': 'Break',
    'dw.what_working': 'What are you working on?',
    'dw.what_ph': 'e.g. Drafting SPA revisions — Gulf Pharma',
    'dw.bill_to_case': 'Bill to case',
    'dw.select_case': 'Select case',
    'dw.hourly_rate': 'Hourly rate (SAR)',
    'dw.start': 'Start',
    'dw.pause': 'Pause',
    'dw.stop_save': 'Stop & save',
    'dw.in_progress': 'In progress',
    'dw.paused': 'Paused',
    'dw.today': 'Today',
    'dw.billable_hours': 'Billable hours',
    'dw.focus_time': 'Focus time',
    'dw.focus_sessions': 'Focus sessions',
    'dw.billable_revenue': 'Billable revenue today',
    'dw.recent_sessions': 'Recent sessions',
    'dw.no_sessions': 'No sessions logged yet.',
    'dw.session_complete': '{mode} session complete!',
    'dw.stopped': 'Session stopped',
    'dw.failed_save': 'Failed to save session',

    'tasks.title': 'Tasks',
    'tasks.subtitle': 'Daily to-dos + auto-generated follow-ups from document lifecycle events.',
    'tasks.new': 'New task',
    'tasks.all': 'All ({n})',
    'tasks.today': 'Today ({n})',
    'tasks.overdue': 'Overdue ({n})',
    'tasks.auto': 'Auto-generated ({n})',
    'tasks.from': 'from:',
    'tasks.auto_badge': 'auto',
    'tasks.empty': 'No tasks here.',
    'tasks.create': 'Create task',
    'tasks.f_title': 'Task',
    'tasks.f_title_ph': 'e.g. File VAT return Q2',
    'tasks.f_desc': 'Description',
    'tasks.f_priority': 'Priority',
    'tasks.f_due': 'Due date',
    'tasks.f_case': 'Link to case (optional)',
    'tasks.none': 'None',
    'tasks.added': 'Task added',
    'tasks.completed': 'Task completed',
    'tasks.reopened': 'Task reopened',

    'docs.title': 'Documents',
    'docs.subtitle': 'Track every document across its full lifecycle — Draft → Sent → Active → Expired.',
    'docs.add': 'Add document',
    'docs.set_status': 'Set status',
    'docs.signed': 'Signed',
    'docs.expires': 'Expires',
    'docs.d_overdue': '{n}d overdue',
    'docs.empty': 'No documents in this status.',
    'docs.added': 'Document added — auto-tasks created if applicable',
    'docs.autonote': 'Sending an NDA auto-creates a "Follow up on signature" task in 3 days. Expiring contracts auto-create renewal reminders 30 days before expiry.',
    'docs.create': 'Add document',
    'docs.f_title': 'Title',
    'docs.f_title_ph': 'e.g. Mutual NDA — TechCo',
    'docs.f_type': 'Type',
    'docs.f_status': 'Status',
    'docs.f_parties': 'Parties',
    'docs.f_parties_ph': 'e.g. Sanad Legal ↔ TechCo',
    'docs.f_signed': 'Signed date',
    'docs.f_expiry': 'Expiry date',
    'docs.f_case': 'Link to case (optional)',
    'docs.f_notes': 'Notes',
    'docs.req_fields': 'Title and parties are required',

    'dstatus.draft': 'Draft',
    'dstatus.sent': 'Sent for Signature',
    'dstatus.active': 'Active',
    'dstatus.expiring': 'Expiring',
    'dstatus.expired': 'Expired',

    'dtype.nda': 'NDA',
    'dtype.employment': 'Employment',
    'dtype.non_compete': 'Non-Compete',
    'dtype.msa': 'MSA / Settlement',
    'dtype.subcontract': 'Subcontract',
    'dtype.policy': 'Policy',

    'cat.ikama': 'Iqama',
    'cat.cr': 'Commercial Reg.',
    'cat.contract': 'Contract',
    'cat.license': 'License',
    'cat.tax': 'Tax',
    'cat.gosi': 'GOSI',

    'src.MoJ': 'Ministry of Justice',
    'src.MHRSD': 'MHRSD',
    'src.VAT': 'ZATCA',
    'src.local_tip': 'Local Tip',

    'common.refresh': 'Refresh',
    'common.theme': 'Toggle theme',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.create': 'Create',
    'common.add': 'Add',
    'common.none': '—',
    'common.pwa_note': 'PWA-enabled. Install to desktop for daily access.',
    'common.cache_note': 'Timer & UI state cached locally — minimal server load.',
    'common.footer_left': 'Sanad — Operational dashboard for Saudi legal & SME professionals',
    'common.footer_right': 'Home-server optimized · PWA enabled',
    'common.failed_load': 'Failed to load data',

    'session.focus': 'focus',
    'session.billable': 'billable',
    'session.meeting': 'meeting',
  },
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Lazy initializer reads localStorage once on first client render — no effect needed
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'ar'
    const saved = window.localStorage.getItem(STORAGE_KEY)
    return saved === 'ar' || saved === 'en' ? saved : 'ar'
  })

  // Sync html lang + dir attributes
  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, l)
  }

  const toggle = () => setLang(lang === 'ar' ? 'en' : 'ar')

  const t = (key: string, vars?: Record<string, string | number>) => {
    let str = translations[lang][key] ?? translations.en[key] ?? key
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        str = str.replace(`{${k}}`, String(v))
      })
    }
    return str
  }

  return (
    <Ctx.Provider value={{ lang, setLang, toggle, t }}>
      {children}
    </Ctx.Provider>
  )
}

export function useLang() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}
