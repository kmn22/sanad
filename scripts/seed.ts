// Seed Sanad with Arabic demo data — solo practitioner context
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(0, 0, 0, 0)
  return d
}

async function main() {
  await db.dailyBrief.deleteMany()
  await db.timeEntry.deleteMany()
  await db.task.deleteMany()
  await db.legalDocument.deleteMany()
  await db.legalCase.deleteMany()
  await db.complianceItem.deleteMany()
  await db.user.deleteMany()

  // Demo user — solo lawyer
  await db.user.create({
    data: { email: 'ahmed@sanad.sa', name: 'أحمد القحطاني', role: 'lawyer' },
  })

  // Compliance items — Arabic, solo practice context
  const complianceItems = [
    { title: 'تجديد إقامة', category: 'ikama', entityName: 'محمد سعيد (محاسب)', issueDate: daysFromNow(-365), expiryDate: daysFromNow(18), status: 'expiring', notes: 'يحتاج موعد جوازات + فحص طبي', notifyDays: 30 },
    { title: 'تجديد إقامة', category: 'ikama', entityName: 'ليلى حسن (موارد بشرية)', issueDate: daysFromNow(-360), expiryDate: daysFromNow(45), status: 'expiring', notifyDays: 30 },
    { title: 'السجل التجاري', category: 'cr', entityName: 'مكتب أحمد القحطاني للمحاماة', issueDate: daysFromNow(-700), expiryDate: daysFromNow(72), status: 'active', notes: 'تجديد عبر بوابة وزارة التجارة', notifyDays: 60 },
    { title: 'عقد عمل', category: 'contract', entityName: 'خالد العتيبي (سائق)', issueDate: daysFromNow(-330), expiryDate: daysFromNow(35), status: 'expiring', notifyDays: 30 },
    { title: 'عقد عمل', category: 'contract', entityName: 'نورة الدوسري (تسويق)', issueDate: daysFromNow(-200), expiryDate: daysFromNow(165), status: 'active', notifyDays: 30 },
    { title: 'اشتراك التأمينات الاجتماعية', category: 'gosi', entityName: 'مكتب أحمد القحطاني للمحاماة', issueDate: daysFromNow(-30), expiryDate: daysFromNow(7), status: 'expiring', notes: 'الاشتراك الشهري مستحق', notifyDays: 15 },
    { title: 'ضريبة القيمة المضافة Q2', category: 'tax', entityName: 'مكتب أحمد القحطاني للمحاماة', issueDate: daysFromNow(-90), expiryDate: daysFromNow(28), status: 'expiring', notifyDays: 30 },
    { title: 'رخصة مزاولة المهنة', category: 'license', entityName: 'أحمد القحطاني', issueDate: daysFromNow(-300), expiryDate: daysFromNow(220), status: 'active', notifyDays: 60 },
    { title: 'تجديد إقامة', category: 'ikama', entityName: 'يوسف الحربي (عمليات)', issueDate: daysFromNow(-200), expiryDate: daysFromNow(165), status: 'active', notifyDays: 30 },
    { title: 'السجل التجاري', category: 'cr', entityName: 'منشأة الخليج التقنية', issueDate: daysFromNow(-720), expiryDate: daysFromNow(8), status: 'expiring', notifyDays: 60 },
  ]
  for (const c of complianceItems) {
    await db.complianceItem.create({ data: c })
  }

  // Cases — Arabic
  const cases = [
    { title: 'نزاع عقد الفيصلية', clientName: 'مجموعة الفيصلية', caseType: 'litigation', stage: 'drafting', priority: 'high', dueDate: daysFromNow(14), value: 450000, notes: 'صياغة صحيفة الدعوى' },
    { title: 'مراجعة اتفاقية سرية — تكو', clientName: 'تكو الرياض', caseType: 'contract', stage: 'drafting', priority: 'normal', dueDate: daysFromNow(5), value: 0, notes: 'اتفاقية سرية متبادلة لشراكة' },
    { title: 'استحواذ صيدليات الخليج', clientName: 'صيدليات الخليج', caseType: 'corporate', stage: 'client_review', priority: 'urgent', dueDate: daysFromNow(3), value: 1200000, notes: 'بانتظار ملاحظات العميل على اتفاقية الشراء' },
    { title: 'علامة برايتسعود التجارية', clientName: 'برايتسعود التجارية', caseType: 'ip', stage: 'client_review', priority: 'normal', dueDate: daysFromNow(10), value: 8500, notes: 'مستندات طلب العلامة لدى العميل' },
    { title: 'قضية ميراث آل سليمان #218', clientName: 'عائلة آل سليمان', caseType: 'litigation', stage: 'filed', priority: 'high', dueDate: daysFromNow(30), value: 0, notes: 'مرفوعة في المحكمة العامة بالرياض' },
    { title: 'نزاع عمالي', clientName: 'سعود المطيري', caseType: 'litigation', stage: 'filed', priority: 'normal', dueDate: daysFromNow(21), value: 0, notes: 'بانتظار موعد الجلسة الأولى' },
    { title: 'سياسة توظيف جلف تك', clientName: 'جلف تك', caseType: 'consultation', stage: 'closed', priority: 'low', value: 15000, notes: 'تم تسليم دليل الموظفين واعتماده' },
  ]
  const createdCases = []
  for (const c of cases) {
    createdCases.push(await db.legalCase.create({ data: c }))
  }

  // Documents — Arabic
  const docs = [
    { title: 'اتفاقية سرية مشتركة — تكو', docType: 'nda', status: 'sent', parties: 'مكتب أحمد القحطاني ↔ تكو', signedDate: daysFromNow(-5), expiryDate: daysFromNow(355), notes: 'مُرسلة للتوقيع', caseId: createdCases[1].id },
    { title: 'عقد عمل — نورة', docType: 'employment', status: 'active', parties: 'مكتب أحمد القحطاني ↔ نورة الدوسري', signedDate: daysFromNow(-200), expiryDate: daysFromNow(165), caseId: null },
    { title: 'اتفاقية عدم منافسة — خالد', docType: 'non_compete', status: 'active', parties: 'مكتب أحمد القحطاني ↔ خالد العتيبي', signedDate: daysFromNow(-330), expiryDate: daysFromNow(35), notes: 'دور السائق، تقييد سنتان', caseId: null },
    { title: 'اتفاقية خدمات — الفيصلية', docType: 'msa', status: 'draft', parties: 'مكتب أحمد القحطاني ↔ مجموعة الفيصلية', signedDate: null, expiryDate: null, caseId: createdCases[0].id },
    { title: 'عقد مقاول فرعي — جلف تك', docType: 'subcontract', status: 'sent', parties: 'جلف تك ↔ مكتب أحمد القحطاني', signedDate: null, expiryDate: null, notes: 'بانتظار التوقيع', caseId: null },
    { title: 'دليل الموظفين v2', docType: 'policy', status: 'active', parties: 'مكتب أحمد القحطاني داخلي', signedDate: daysFromNow(-90), expiryDate: null, caseId: createdCases[6].id },
    { title: 'اتفاقية سرية قديمة — 2023', docType: 'nda', status: 'expired', parties: 'مكتب أحمد القحطاني ↔ عميل سابق', signedDate: daysFromNow(-400), expiryDate: daysFromNow(-35), caseId: null },
    { title: 'اتفاقية تسوية — آل سليمان', docType: 'msa', status: 'draft', parties: 'ورثة آل سليمان', signedDate: null, expiryDate: null, caseId: createdCases[4].id },
  ]
  for (const d of docs) {
    await db.legalDocument.create({ data: d })
  }

  // Tasks — Arabic, some auto-generated
  const tasks = [
    { title: 'متابعة توقيع اتفاقية السرية', description: 'اتفاقية تكو مُرسلة منذ 5 أيام — تابع التوقيع', status: 'todo', priority: 'high', dueDate: daysFromNow(-1), relatedDoc: 'اتفاقية سرية مشتركة — تكو', autoGen: true },
    { title: 'جدولة دفع التأمينات الاجتماعية', description: 'الاشتراك الشهري مستحق خلال 7 أيام', status: 'todo', priority: 'high', dueDate: daysFromNow(5), autoGen: false },
    { title: 'صياغة مراجعات اتفاقية الاستحواذ', description: 'دمج ملاحظات العميل على استحواذ صيدليات الخليج', status: 'in_progress', priority: 'urgent', dueDate: daysFromNow(3), caseId: createdCases[2].id },
    { title: 'تجهيز ملف الجلسة', description: 'ميراث آل سليمان — جمع صكوك الملكية', status: 'todo', priority: 'high', dueDate: daysFromNow(15), caseId: createdCases[4].id },
    { title: 'تجديد عقد الموظف — خالد', description: 'العقد ينتهي خلال 35 يوماً، صُغ التجديد', status: 'todo', priority: 'normal', dueDate: daysFromNow(10), relatedDoc: 'اتفاقية عدم منافسة — خالد', autoGen: true },
    { title: 'تقديم إقرار ضريبة القيمة المضافة', description: 'إرسال عبر بوابة هيئة الزكاة قبل الموعد النهائي', status: 'todo', priority: 'high', dueDate: daysFromNow(28), autoGen: false },
    { title: 'إرسال حقيبة الترحيب للعميل الجديد', description: 'مستندات تأهيل جلف تك', status: 'done', priority: 'low', dueDate: daysFromNow(-3) },
    { title: 'مراجعة تحديث قانون العمل', description: 'مرسوم جديد حول العمل عن بُعد — راجع الأثر', status: 'todo', priority: 'normal', dueDate: daysFromNow(7), autoGen: false },
    { title: 'تأكيد موعد الجلسة', description: 'اتصل بالمحكمة لجدولة جلسة آل سليمان', status: 'todo', priority: 'high', dueDate: daysFromNow(2), caseId: createdCases[4].id },
    { title: 'تحديث العميل بشأن صيدليات الخليج', description: 'بريد إلكتروني بالحالة والجدول الزمني المُعدّل', status: 'todo', priority: 'urgent', dueDate: daysFromNow(1), caseId: createdCases[2].id },
  ]
  for (const t of tasks) {
    await db.task.create({ data: t })
  }

  // Time entries — Arabic descriptions
  const timeEntries = [
    { caseId: createdCases[2].id, description: 'مراجعات اتفاقية الاستحواذ — صيدليات الخليج', durationSec: 5400, billable: true, hourlyRate: 850, sessionType: 'billable', date: daysFromNow(0) },
    { caseId: createdCases[0].id, description: 'صياغة صحيفة الدعوى', durationSec: 7200, billable: true, hourlyRate: 850, sessionType: 'billable', date: daysFromNow(-1) },
    { caseId: null, description: 'عمل عميق — مراجعة اتفاقية سرية', durationSec: 2700, billable: false, sessionType: 'focus', date: daysFromNow(0) },
    { caseId: createdCases[4].id, description: 'مراجعة صكوك الملكية', durationSec: 3600, billable: true, hourlyRate: 750, sessionType: 'billable', date: daysFromNow(-2) },
    { caseId: createdCases[1].id, description: 'تعديلات اتفاقية السرية', durationSec: 1800, billable: true, hourlyRate: 850, sessionType: 'billable', date: daysFromNow(-1) },
    { caseId: null, description: 'جلسة تركيز — بحث مرسوم الموارد البشرية', durationSec: 3300, billable: false, sessionType: 'focus', date: daysFromNow(-3) },
    { caseId: createdCases[2].id, description: 'مكالمة عميل — صيدليات الخليج', durationSec: 2400, billable: true, hourlyRate: 850, sessionType: 'meeting', date: daysFromNow(-2) },
  ]
  for (const te of timeEntries) {
    await db.timeEntry.create({ data: te })
  }

  // Daily brief — Arabic
  const briefs = [
    { title: 'وزارة العدل تطلق بوابة التقاضي الإلكتروني v3', summary: 'أطلقت وزارة العدل بوابة تقاضي إلكترونية محسّنة مع صياغة مساعدة بالذكاء الاصطناعي. إلزامية لجميع القضايا المدنية الجديدة اعتباراً من الشهر القادم.', source: 'MoJ', category: 'regulation', url: 'https://www.moj.gov.sa', publishedAt: daysFromNow(0) },
    { title: 'وزارة الموارد البشرية تحدّث سياسة العمل عن بُعد', summary: 'مرسوم جديد يوضح التزامات صاحب العمل في ترتيبات العمل الهجين. وثّق سياسة العمل عن بُعد في دليل الموظفين.', source: 'MHRSD', category: 'labor', url: 'https://www.hrsd.gov.sa', publishedAt: daysFromNow(-1) },
    { title: 'تذكير: إقرار ضريبة القيمة المضافة — الربع الثاني', summary: 'إقرارات ضريبة القيمة المضافة للربع الثاني مستحقة خلال 30 يوماً للمُكلين القياسيين. غرامة التأخير: 5% من الضريبة غير المدفوعة شهرياً.', source: 'VAT', category: 'tax', publishedAt: daysFromNow(-1) },
    { title: 'تعديل قانون التجارة السعودي — المادة 18', summary: 'متطلبات إفصاح محدّثة لمساهمي المنشآت الصغيرة اعتباراً من الربع الثالث. راجع اتفاقيات المساهمين.', source: 'MoJ', category: 'corporate', publishedAt: daysFromNow(-2) },
    { title: 'نصيحة: تشديد فترة السماح لتجديد الإقامة', summary: 'تطبّق الجوازات الآن فترة سماح صارمة لمدة 3 أيام بعد انتهاء الإقامة. احجز المواعيد قبل 30 يوماً لتجنب الغرامات.', source: 'local_tip', category: 'labor', publishedAt: daysFromNow(-2) },
    { title: 'تخفيض رسوم تسجيل العلامات التجارية', summary: 'خفّضت الهيئة السعودية للملكية الفكرية رسوم تسجيل العلامة التجارية لفئة واحدة بنسبة 15% للمنشآت الصغيرة المسجلة في منشآت.', source: 'MoJ', category: 'ip', publishedAt: daysFromNow(-3) },
  ]
  for (const b of briefs) {
    await db.dailyBrief.create({ data: b })
  }

  console.log('Seed complete (Arabic)')
}

main().then(() => db.$disconnect()).catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
