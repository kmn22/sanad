// Sanad — Arabic demo seed for the solo Saudi lawyer persona.
// Generates a lived-in dataset: clients, cases, documents, invoices,
// compliance, tasks, time entries, communications, and daily briefs.
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

function daysFromNow(days: number, hour = 0): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, 0, 0, 0)
  return d
}

async function main() {
  // Wipe in dependency order
  await db.communication.deleteMany()
  await db.timeEntry.deleteMany()
  await db.invoice.deleteMany()
  await db.dailyBrief.deleteMany()
  await db.task.deleteMany()
  await db.legalDocument.deleteMany()
  await db.legalCase.deleteMany()
  await db.complianceItem.deleteMany()
  await db.client.deleteMany()
  await db.user.deleteMany()

  await db.user.create({
    data: { email: 'ahmed@sanad.sa', name: 'أحمد القحطاني', role: 'lawyer' },
  })

  // ─── Clients (15: mix of individuals + corporates) ────────────────
  const clientSeeds = [
    { name: 'مجموعة الفيصلية القابضة', type: 'corporate', company: 'مجموعة الفيصلية القابضة', nationalId: '1010234567', phone: '+966112345001', email: 'legal@faisaliah.sa', address: 'الرياض، طريق الملك فهد', notes: 'عميل استراتيجي — عقود تجارية متعددة' },
    { name: 'صيدليات الخليج', type: 'corporate', company: 'صيدليات الخليج المتحدة', nationalId: '2050098712', phone: '+966138812345', email: 'cfo@gulfpharma.com', address: 'الدمام، حي الفيصلية', notes: 'استحواذ نشط — صفقة 1.2م ر.س' },
    { name: 'تكو الرياض', type: 'corporate', company: 'شركة تكو للحلول التقنية', nationalId: '1010876543', phone: '+966112999812', email: 'partnerships@teco.sa', address: 'الرياض، الملقا', notes: 'شراكة تقنية محتملة' },
    { name: 'برايتسعود التجارية', type: 'corporate', company: 'مؤسسة برايتسعود', nationalId: '4030567890', phone: '+966126733201', email: 'info@brightsaud.sa', address: 'جدة، شارع التحلية', notes: 'تسجيل علامة تجارية' },
    { name: 'جلف تك', type: 'corporate', company: 'جلف تك للأنظمة', nationalId: '1010445566', phone: '+966114002211', email: 'hr@gulftech.sa', address: 'الرياض، حي العليا', notes: 'استشارات موارد بشرية' },
    { name: 'عائلة آل سليمان', type: 'individual', nationalId: '1095432187', phone: '+966555123456', email: 'sulaiman.family@gmail.com', address: 'الرياض، حي الورود', notes: 'قضية ميراث ممتدة' },
    { name: 'سعود المطيري', type: 'individual', nationalId: '1056789012', phone: '+966503456789', email: 'saud.almutairi@outlook.sa', address: 'الرياض، حي السليمانية', notes: 'نزاع عمالي — موكل من قِبل المحامي العام' },
    { name: 'منشأة الخليج التقنية', type: 'corporate', company: 'منشأة الخليج التقنية', nationalId: '2050778901', phone: '+966138777234', email: 'legal@gulftech-est.sa', address: 'الخبر، الكورنيش', notes: 'تجديد سجل تجاري عاجل' },
    { name: 'محمد عبدالله الحارثي', type: 'individual', nationalId: '1087654321', phone: '+966551234987', email: 'mohammed.h@gmail.com', address: 'مكة، العزيزية', notes: 'استشارة قانون أحوال شخصية' },
    { name: 'شركة أرامكو السعودية للخدمات', type: 'corporate', company: 'شركة أرامكو السعودية للخدمات', nationalId: '1010001122', phone: '+966138712345', email: 'legal-services@aramco.com', address: 'الظهران', notes: 'مراجعة عقود موردين' },
    { name: 'نورة الدوسري', type: 'individual', nationalId: '1078123456', phone: '+966500112233', email: 'noura.d@sanad.sa', address: 'الرياض', notes: 'موظفة المكتب — عقد التسويق' },
    { name: 'مطعم الديوانية', type: 'corporate', company: 'مطعم الديوانية الشعبي', nationalId: '4030112334', phone: '+966126889912', email: 'manager@diwanieh.sa', address: 'جدة، شارع الأمير سلطان', notes: 'نزاع إيجار محل تجاري' },
    { name: 'سارة بنت فهد', type: 'individual', nationalId: '1098765432', phone: '+966502345678', email: 'sara.f@hotmail.com', address: 'الرياض، حي الياسمين', notes: 'وكالة شرعية ومستندات شخصية' },
    { name: 'مؤسسة النخيل للمقاولات', type: 'corporate', company: 'مؤسسة النخيل للمقاولات', nationalId: '4030998877', phone: '+966114556677', email: 'projects@palmcontracting.sa', address: 'الرياض، الصناعية الثانية', notes: 'مطالبات مالية مع مقاول من الباطن' },
    { name: 'خالد العتيبي', type: 'individual', nationalId: '1067891234', phone: '+966554567123', email: 'khaled.utibi@gmail.com', address: 'الرياض', notes: 'سائق المكتب — عقد عمل' },
  ]
  const clients = await Promise.all(clientSeeds.map((c) => db.client.create({ data: c })))
  const C = Object.fromEntries(clients.map((c, i) => [clientSeeds[i].name, c.id]))

  // ─── Compliance items (12: varied expiry windows) ────────────────
  const complianceItems = [
    { title: 'تجديد إقامة', category: 'iqama', entityName: 'محمد سعيد (محاسب)', issueDate: daysFromNow(-365), expiryDate: daysFromNow(18), status: 'expiring', notes: 'يحتاج موعد جوازات + فحص طبي', notifyDays: 30 },
    { title: 'تجديد إقامة', category: 'iqama', entityName: 'ليلى حسن (موارد بشرية)', issueDate: daysFromNow(-360), expiryDate: daysFromNow(45), status: 'expiring', notifyDays: 30 },
    { title: 'السجل التجاري', category: 'cr', entityName: 'مكتب أحمد القحطاني للمحاماة', issueDate: daysFromNow(-700), expiryDate: daysFromNow(72), status: 'active', notes: 'تجديد عبر بوابة وزارة التجارة', notifyDays: 60 },
    { title: 'عقد عمل — سائق', category: 'contract', entityName: 'خالد العتيبي', issueDate: daysFromNow(-330), expiryDate: daysFromNow(35), status: 'expiring', notifyDays: 30 },
    { title: 'عقد عمل — تسويق', category: 'contract', entityName: 'نورة الدوسري', issueDate: daysFromNow(-200), expiryDate: daysFromNow(165), status: 'active', notifyDays: 30 },
    { title: 'اشتراك التأمينات الاجتماعية', category: 'gosi', entityName: 'مكتب أحمد القحطاني للمحاماة', issueDate: daysFromNow(-30), expiryDate: daysFromNow(7), status: 'expiring', notes: 'الاشتراك الشهري مستحق', notifyDays: 15 },
    { title: 'ضريبة القيمة المضافة Q2', category: 'tax', entityName: 'مكتب أحمد القحطاني للمحاماة', issueDate: daysFromNow(-90), expiryDate: daysFromNow(28), status: 'expiring', notifyDays: 30 },
    { title: 'رخصة مزاولة المهنة', category: 'license', entityName: 'أحمد القحطاني', issueDate: daysFromNow(-300), expiryDate: daysFromNow(220), status: 'active', notifyDays: 60 },
    { title: 'تجديد إقامة', category: 'iqama', entityName: 'يوسف الحربي (عمليات)', issueDate: daysFromNow(-200), expiryDate: daysFromNow(165), status: 'active', notifyDays: 30 },
    { title: 'السجل التجاري', category: 'cr', entityName: 'منشأة الخليج التقنية', issueDate: daysFromNow(-720), expiryDate: daysFromNow(8), status: 'expiring', notifyDays: 60 },
    { title: 'تأمين طبي للموظفين', category: 'license', entityName: 'مكتب أحمد القحطاني للمحاماة', issueDate: daysFromNow(-180), expiryDate: daysFromNow(185), status: 'active', notifyDays: 45 },
    { title: 'تجديد جواز سفر', category: 'license', entityName: 'أحمد القحطاني', issueDate: daysFromNow(-1800), expiryDate: daysFromNow(-10), status: 'expired', notes: 'انتهى — للتجديد فوراً', notifyDays: 60 },
  ]
  for (const c of complianceItems) await db.complianceItem.create({ data: c })

  // ─── Cases (18: across all stages, with court details) ───────────
  const caseSeeds: Array<any> = [
    { title: 'نزاع عقد الفيصلية', clientId: C['مجموعة الفيصلية القابضة'], clientName: 'مجموعة الفيصلية القابضة', caseType: 'litigation', stage: 'drafting', priority: 'high', dueDate: daysFromNow(14), value: 450000, notes: 'صياغة صحيفة الدعوى', caseNumber: 'M-2026-4471', court: 'المحكمة التجارية بالرياض', opposingParty: 'شركة الأنظمة الذكية', hearingDate: daysFromNow(45) },
    { title: 'مراجعة اتفاقية سرية — تكو', clientId: C['تكو الرياض'], clientName: 'تكو الرياض', caseType: 'contract', stage: 'drafting', priority: 'normal', dueDate: daysFromNow(5), value: 12000, notes: 'اتفاقية سرية متبادلة لشراكة' },
    { title: 'استحواذ صيدليات الخليج', clientId: C['صيدليات الخليج'], clientName: 'صيدليات الخليج', caseType: 'corporate', stage: 'client_review', priority: 'urgent', dueDate: daysFromNow(3), value: 1200000, notes: 'بانتظار ملاحظات العميل على اتفاقية الشراء' },
    { title: 'علامة برايتسعود التجارية', clientId: C['برايتسعود التجارية'], clientName: 'برايتسعود التجارية', caseType: 'ip', stage: 'client_review', priority: 'normal', dueDate: daysFromNow(10), value: 8500, notes: 'مستندات طلب العلامة لدى العميل' },
    { title: 'قضية ميراث آل سليمان #218', clientId: C['عائلة آل سليمان'], clientName: 'عائلة آل سليمان', caseType: 'litigation', stage: 'filed', priority: 'high', dueDate: daysFromNow(30), value: 0, notes: 'مرفوعة في المحكمة العامة بالرياض', caseNumber: 'G-2026-218', court: 'المحكمة العامة بالرياض', opposingParty: 'الوريث الثاني', hearingDate: daysFromNow(22) },
    { title: 'نزاع عمالي — المطيري', clientId: C['سعود المطيري'], clientName: 'سعود المطيري', caseType: 'litigation', stage: 'filed', priority: 'normal', dueDate: daysFromNow(21), value: 65000, notes: 'بانتظار موعد الجلسة الأولى', caseNumber: 'L-2026-1129', court: 'محكمة العمل بالرياض', opposingParty: 'صاحب العمل السابق', hearingDate: daysFromNow(18) },
    { title: 'سياسة توظيف جلف تك', clientId: C['جلف تك'], clientName: 'جلف تك', caseType: 'consultation', stage: 'closed', priority: 'low', value: 15000, notes: 'تم تسليم دليل الموظفين واعتماده' },
    { title: 'مراجعة عقود موردي أرامكو', clientId: C['شركة أرامكو السعودية للخدمات'], clientName: 'شركة أرامكو السعودية للخدمات', caseType: 'contract', stage: 'drafting', priority: 'high', dueDate: daysFromNow(20), value: 75000, notes: 'مراجعة 12 عقد توريد' },
    { title: 'استشارة أحوال شخصية — الحارثي', clientId: C['محمد عبدالله الحارثي'], clientName: 'محمد عبدالله الحارثي', caseType: 'consultation', stage: 'closed', priority: 'low', value: 3500, notes: 'استشارة وكالة شرعية' },
    { title: 'نزاع إيجار محل الديوانية', clientId: C['مطعم الديوانية'], clientName: 'مطعم الديوانية', caseType: 'litigation', stage: 'drafting', priority: 'high', dueDate: daysFromNow(7), value: 35000, notes: 'صياغة دعوى إخلاء — مماطلة المالك', caseNumber: 'R-2026-2204', court: 'المحكمة العامة بجدة', opposingParty: 'مالك العقار', hearingDate: daysFromNow(40) },
    { title: 'وكالة سارة بنت فهد', clientId: C['سارة بنت فهد'], clientName: 'سارة بنت فهد', caseType: 'consultation', stage: 'closed', priority: 'low', value: 1500, notes: 'وكالة عامة موثقة' },
    { title: 'مطالبات النخيل ضد مقاول', clientId: C['مؤسسة النخيل للمقاولات'], clientName: 'مؤسسة النخيل للمقاولات', caseType: 'litigation', stage: 'filed', priority: 'high', dueDate: daysFromNow(28), value: 220000, notes: 'مطالبة بـ220 ألف ر.س عن أعمال غير منجزة', caseNumber: 'M-2026-3318', court: 'المحكمة التجارية بالرياض', opposingParty: 'مقاول الباطن السابق', hearingDate: daysFromNow(35) },
    { title: 'تجديد عقد عمل خالد العتيبي', clientId: C['خالد العتيبي'], clientName: 'خالد العتيبي', caseType: 'contract', stage: 'drafting', priority: 'normal', dueDate: daysFromNow(25), value: 0, notes: 'تجديد عقد سائق المكتب' },
    { title: 'اتفاقية موزعين — برايتسعود', clientId: C['برايتسعود التجارية'], clientName: 'برايتسعود التجارية', caseType: 'contract', stage: 'drafting', priority: 'normal', dueDate: daysFromNow(15), value: 18000, notes: 'صياغة اتفاقية موزعين 3 مدن' },
    { title: 'مراجعة بنود NDA — تكو', clientId: C['تكو الرياض'], clientName: 'تكو الرياض', caseType: 'contract', stage: 'closed', priority: 'low', value: 5000, notes: 'تم التوقيع' },
    { title: 'تأسيس فرع جدة — الفيصلية', clientId: C['مجموعة الفيصلية القابضة'], clientName: 'مجموعة الفيصلية القابضة', caseType: 'corporate', stage: 'client_review', priority: 'normal', dueDate: daysFromNow(12), value: 28000, notes: 'مستندات التأسيس مع العميل' },
    { title: 'تعديل عقد تأسيس — الخليج التقنية', clientId: C['منشأة الخليج التقنية'], clientName: 'منشأة الخليج التقنية', caseType: 'corporate', stage: 'drafting', priority: 'normal', dueDate: daysFromNow(40), value: 9000, notes: 'تعديل نسب الملكية' },
    { title: 'استشارة عقد عمل — الدوسري', clientId: C['نورة الدوسري'], clientName: 'نورة الدوسري', caseType: 'consultation', stage: 'closed', priority: 'low', value: 0, notes: 'مراجعة عقد التسويق' },
  ]
  const createdCases = await Promise.all(caseSeeds.map((c) => db.legalCase.create({ data: c })))

  // ─── Documents (14: varied types & statuses) ─────────────────────
  const docs = [
    { title: 'اتفاقية سرية مشتركة — تكو', docType: 'nda', status: 'sent', parties: 'مكتب أحمد القحطاني ↔ تكو', signedDate: daysFromNow(-5), expiryDate: daysFromNow(355), notes: 'مُرسلة للتوقيع', caseId: createdCases[1].id, clientId: C['تكو الرياض'] },
    { title: 'عقد عمل — نورة', docType: 'employment', status: 'active', parties: 'مكتب أحمد القحطاني ↔ نورة الدوسري', signedDate: daysFromNow(-200), expiryDate: daysFromNow(165), clientId: C['نورة الدوسري'] },
    { title: 'اتفاقية عدم منافسة — خالد', docType: 'non_compete', status: 'active', parties: 'مكتب أحمد القحطاني ↔ خالد العتيبي', signedDate: daysFromNow(-330), expiryDate: daysFromNow(35), notes: 'دور السائق، تقييد سنتان', clientId: C['خالد العتيبي'] },
    { title: 'اتفاقية خدمات — الفيصلية', docType: 'msa', status: 'draft', parties: 'مكتب أحمد القحطاني ↔ مجموعة الفيصلية', signedDate: null, expiryDate: null, caseId: createdCases[0].id, clientId: C['مجموعة الفيصلية القابضة'] },
    { title: 'عقد مقاول فرعي — جلف تك', docType: 'subcontract', status: 'sent', parties: 'جلف تك ↔ مكتب أحمد القحطاني', notes: 'بانتظار التوقيع', clientId: C['جلف تك'] },
    { title: 'دليل الموظفين v2', docType: 'policy', status: 'active', parties: 'مكتب أحمد القحطاني داخلي', signedDate: daysFromNow(-90), caseId: createdCases[6].id, clientId: C['جلف تك'] },
    { title: 'اتفاقية سرية قديمة — 2023', docType: 'nda', status: 'expired', parties: 'مكتب أحمد القحطاني ↔ عميل سابق', signedDate: daysFromNow(-400), expiryDate: daysFromNow(-35) },
    { title: 'اتفاقية تسوية — آل سليمان', docType: 'msa', status: 'draft', parties: 'ورثة آل سليمان', caseId: createdCases[4].id, clientId: C['عائلة آل سليمان'] },
    { title: 'صحيفة دعوى — الفيصلية', docType: 'court_filing', status: 'draft', parties: 'الفيصلية ↔ شركة الأنظمة الذكية', caseId: createdCases[0].id, clientId: C['مجموعة الفيصلية القابضة'], notes: 'المسودة الثالثة' },
    { title: 'اتفاقية الشراء — صيدليات الخليج', docType: 'contract_draft', status: 'sent', parties: 'صيدليات الخليج ↔ صيدلية البائع', caseId: createdCases[2].id, clientId: C['صيدليات الخليج'], notes: 'بانتظار توقيع الطرفين' },
    { title: 'طلب تسجيل علامة — برايتسعود', docType: 'pleading', status: 'sent', parties: 'برايتسعود ↔ الهيئة السعودية للملكية الفكرية', caseId: createdCases[3].id, clientId: C['برايتسعود التجارية'] },
    { title: 'دعوى إخلاء — الديوانية', docType: 'court_filing', status: 'draft', parties: 'مطعم الديوانية ↔ مالك العقار', caseId: createdCases[9].id, clientId: C['مطعم الديوانية'] },
    { title: 'عقود التوريد — أرامكو (دفعة 1)', docType: 'msa', status: 'active', parties: 'أرامكو ↔ 4 موردين', signedDate: daysFromNow(-60), expiryDate: daysFromNow(305), caseId: createdCases[7].id, clientId: C['شركة أرامكو السعودية للخدمات'] },
    { title: 'اتفاقية موزعين — برايتسعود (مسودة)', docType: 'contract_draft', status: 'draft', parties: 'برايتسعود ↔ موزعون 3 مدن', caseId: createdCases[13].id, clientId: C['برايتسعود التجارية'] },
  ]
  for (const d of docs) await db.legalDocument.create({ data: d })

  // ─── Tasks (22) ──────────────────────────────────────────────────
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
    { title: 'صياغة دعوى الإخلاء — الديوانية', description: 'إنهاء المسودة قبل الجمعة', status: 'in_progress', priority: 'high', dueDate: daysFromNow(4), caseId: createdCases[9].id },
    { title: 'مراجعة 12 عقد توريد — أرامكو', description: 'دفعة أولى — 4 عقود', status: 'in_progress', priority: 'high', dueDate: daysFromNow(8), caseId: createdCases[7].id },
    { title: 'تجديد جواز السفر — أحمد', description: 'الجواز منتهي منذ 10 أيام — موعد عاجل', status: 'todo', priority: 'high', dueDate: daysFromNow(3), autoGen: true },
    { title: 'إعداد فاتورة المطيري', description: 'فوترة 65 ألف ر.س للقضية العمالية', status: 'todo', priority: 'normal', dueDate: daysFromNow(6), caseId: createdCases[5].id },
    { title: 'جمع شهود قضية النخيل', description: '3 شهود لإثبات أعمال غير منجزة', status: 'todo', priority: 'high', dueDate: daysFromNow(20), caseId: createdCases[11].id },
    { title: 'متابعة دفع الفاتورة #INV-2025-024', description: 'متأخرة 12 يوماً — الفيصلية', status: 'todo', priority: 'high', dueDate: daysFromNow(-12), autoGen: true },
    { title: 'إرسال طلب العلامة لبرايتسعود', description: 'بعد تأكيد العميل', status: 'done', priority: 'normal', dueDate: daysFromNow(-7), caseId: createdCases[3].id },
    { title: 'مراجعة بنود اتفاقية الموزعين', description: 'برايتسعود — 3 بنود مفتاحية', status: 'in_progress', priority: 'normal', dueDate: daysFromNow(11), caseId: createdCases[13].id },
    { title: 'تجديد رخصة المهنة — تحضير المستندات', description: 'تنتهي خلال 220 يوماً — استباقي', status: 'todo', priority: 'low', dueDate: daysFromNow(180), autoGen: false },
    { title: 'استكمال تعديل عقد التأسيس', description: 'الخليج التقنية — نسب ملكية جديدة', status: 'todo', priority: 'normal', dueDate: daysFromNow(35), caseId: createdCases[16].id },
    { title: 'تحضير لقاء الفيصلية', description: 'لقاء الأسبوع المقبل — تحضير ملخص قضايا', status: 'todo', priority: 'normal', dueDate: daysFromNow(5) },
    { title: 'أرشفة قضية الحارثي', description: 'مغلقة — أرشفة في النظام', status: 'done', priority: 'low', dueDate: daysFromNow(-5), caseId: createdCases[8].id },
  ]
  for (const t of tasks) await db.task.create({ data: t })

  // ─── Time entries (35: spread across last 14 days) ───────────────
  const timeEntries: Array<any> = []
  const baseEntries = [
    { caseIdx: 2, description: 'مراجعات اتفاقية الاستحواذ — صيدليات الخليج', durationSec: 5400, billable: true, hourlyRate: 850, sessionType: 'billable' },
    { caseIdx: 0, description: 'صياغة صحيفة الدعوى — الفيصلية', durationSec: 7200, billable: true, hourlyRate: 850, sessionType: 'billable' },
    { caseIdx: null, description: 'عمل عميق — مراجعة اتفاقية سرية', durationSec: 2700, billable: false, sessionType: 'focus' },
    { caseIdx: 4, description: 'مراجعة صكوك الملكية', durationSec: 3600, billable: true, hourlyRate: 750, sessionType: 'billable' },
    { caseIdx: 1, description: 'تعديلات اتفاقية السرية', durationSec: 1800, billable: true, hourlyRate: 850, sessionType: 'billable' },
    { caseIdx: null, description: 'جلسة تركيز — بحث مرسوم الموارد البشرية', durationSec: 3300, billable: false, sessionType: 'focus' },
    { caseIdx: 2, description: 'مكالمة عميل — صيدليات الخليج', durationSec: 2400, billable: true, hourlyRate: 850, sessionType: 'meeting' },
    { caseIdx: 7, description: 'مراجعة عقود موردي أرامكو — دفعة 1', durationSec: 6300, billable: true, hourlyRate: 950, sessionType: 'billable' },
    { caseIdx: 9, description: 'صياغة دعوى الإخلاء — الديوانية', durationSec: 4200, billable: true, hourlyRate: 750, sessionType: 'billable' },
    { caseIdx: 11, description: 'بحث قانوني — مطالبات النخيل', durationSec: 5100, billable: true, hourlyRate: 850, sessionType: 'billable' },
    { caseIdx: null, description: 'استراحة قهوة', durationSec: 900, billable: false, sessionType: 'break' },
    { caseIdx: 5, description: 'إعداد ملف نزاع المطيري العمالي', durationSec: 3000, billable: true, hourlyRate: 750, sessionType: 'billable' },
    { caseIdx: null, description: 'عمل عميق — كتابة مذكرة قانونية', durationSec: 4500, billable: false, sessionType: 'focus' },
    { caseIdx: 13, description: 'صياغة اتفاقية موزعين — برايتسعود', durationSec: 3900, billable: true, hourlyRate: 850, sessionType: 'billable' },
    { caseIdx: 15, description: 'مستندات فرع جدة — الفيصلية', durationSec: 2700, billable: true, hourlyRate: 850, sessionType: 'billable' },
  ]
  for (let day = 0; day >= -14; day--) {
    // 2-3 entries per workday
    const count = (day % 7 === -5 || day % 7 === -6) ? 0 : Math.floor(Math.random() * 2) + 2
    for (let i = 0; i < count; i++) {
      const e = baseEntries[Math.floor(Math.random() * baseEntries.length)]
      timeEntries.push({
        caseId: e.caseIdx !== null ? createdCases[e.caseIdx].id : null,
        description: e.description,
        durationSec: e.durationSec,
        billable: e.billable,
        hourlyRate: e.hourlyRate ?? null,
        sessionType: e.sessionType,
        date: daysFromNow(day, 10 + i * 2),
      })
    }
  }
  for (const te of timeEntries) await db.timeEntry.create({ data: te })

  // ─── Invoices (12: draft/sent/paid/overdue) ──────────────────────
  function inv(n: number, opts: any) {
    const subtotal = opts.subtotal
    const vatRate = 15
    const vatAmount = subtotal * (vatRate / 100)
    const total = subtotal + vatAmount
    return {
      number: `INV-2026-${String(n).padStart(3, '0')}`,
      subtotal, vatRate, vatAmount, total,
      ...opts,
    }
  }
  const invoices = [
    inv(1, { clientId: C['مجموعة الفيصلية القابضة'], caseId: createdCases[0].id, status: 'paid', subtotal: 25000, issueDate: daysFromNow(-90), dueDate: daysFromNow(-60), paidAt: daysFromNow(-55), paidAmount: 28750, notes: 'الدفعة الأولى — صياغة' }),
    inv(2, { clientId: C['صيدليات الخليج'], caseId: createdCases[2].id, status: 'paid', subtotal: 80000, issueDate: daysFromNow(-75), dueDate: daysFromNow(-45), paidAt: daysFromNow(-40), paidAmount: 92000 }),
    inv(3, { clientId: C['جلف تك'], caseId: createdCases[6].id, status: 'paid', subtotal: 15000, issueDate: daysFromNow(-60), dueDate: daysFromNow(-30), paidAt: daysFromNow(-25), paidAmount: 17250 }),
    inv(4, { clientId: C['مجموعة الفيصلية القابضة'], caseId: createdCases[0].id, status: 'overdue', subtotal: 35000, issueDate: daysFromNow(-45), dueDate: daysFromNow(-12), notes: 'دفعة ثانية — متأخرة' }),
    inv(5, { clientId: C['شركة أرامكو السعودية للخدمات'], caseId: createdCases[7].id, status: 'sent', subtotal: 40000, issueDate: daysFromNow(-15), dueDate: daysFromNow(15) }),
    inv(6, { clientId: C['محمد عبدالله الحارثي'], caseId: createdCases[8].id, status: 'paid', subtotal: 3500, issueDate: daysFromNow(-40), dueDate: daysFromNow(-25), paidAt: daysFromNow(-23), paidAmount: 4025 }),
    inv(7, { clientId: C['برايتسعود التجارية'], caseId: createdCases[3].id, status: 'sent', subtotal: 8500, issueDate: daysFromNow(-10), dueDate: daysFromNow(20) }),
    inv(8, { clientId: C['مطعم الديوانية'], caseId: createdCases[9].id, status: 'draft', subtotal: 12000, issueDate: daysFromNow(0), dueDate: daysFromNow(30) }),
    inv(9, { clientId: C['سعود المطيري'], caseId: createdCases[5].id, status: 'draft', subtotal: 18000, issueDate: daysFromNow(0), dueDate: daysFromNow(30), notes: 'فاتورة جزئية — الجلسة الأولى' }),
    inv(10, { clientId: C['تكو الرياض'], caseId: createdCases[14].id, status: 'paid', subtotal: 5000, issueDate: daysFromNow(-30), dueDate: daysFromNow(-15), paidAt: daysFromNow(-14), paidAmount: 5750 }),
    inv(11, { clientId: C['مؤسسة النخيل للمقاولات'], caseId: createdCases[11].id, status: 'sent', subtotal: 28000, issueDate: daysFromNow(-5), dueDate: daysFromNow(25) }),
    inv(12, { clientId: C['سارة بنت فهد'], caseId: createdCases[10].id, status: 'paid', subtotal: 1500, issueDate: daysFromNow(-20), dueDate: daysFromNow(-5), paidAt: daysFromNow(-3), paidAmount: 1725 }),
  ]
  for (const i of invoices) await db.invoice.create({ data: i })

  // ─── Communications (24) ─────────────────────────────────────────
  const comms: Array<any> = [
    { clientId: C['صيدليات الخليج'], caseId: createdCases[2].id, type: 'call', direction: 'outgoing', subject: 'تحديث الاستحواذ', body: 'مكالمة 40 دقيقة لمراجعة ملاحظات اتفاقية الشراء', durationMin: 40, date: daysFromNow(-1, 11) },
    { clientId: C['مجموعة الفيصلية القابضة'], caseId: createdCases[0].id, type: 'email', direction: 'outgoing', subject: 'مسودة صحيفة الدعوى للمراجعة', body: 'مرفق المسودة الثالثة — يرجى المراجعة قبل الاثنين', date: daysFromNow(-2, 14) },
    { clientId: C['تكو الرياض'], caseId: createdCases[1].id, type: 'email', direction: 'incoming', subject: 'ملاحظات على اتفاقية السرية', body: 'تعديلات على البندين 4 و7', date: daysFromNow(-3, 9) },
    { clientId: C['عائلة آل سليمان'], caseId: createdCases[4].id, type: 'meeting', direction: 'incoming', subject: 'اجتماع الورثة', body: 'اجتماع 90 دقيقة في المكتب — تم الاتفاق على خطة التسوية', durationMin: 90, date: daysFromNow(-5, 16) },
    { clientId: C['برايتسعود التجارية'], caseId: createdCases[3].id, type: 'email', direction: 'outgoing', subject: 'تأكيد إرسال طلب العلامة', body: 'تم الإرسال بتاريخ اليوم — في انتظار الرد من الهيئة', date: daysFromNow(-7, 10) },
    { clientId: C['شركة أرامكو السعودية للخدمات'], caseId: createdCases[7].id, type: 'call', direction: 'incoming', subject: 'استفسار عن الجدول الزمني', body: 'مكالمة سريعة — متى تكتمل مراجعة العقود؟', durationMin: 15, date: daysFromNow(-1, 9) },
    { clientId: C['سعود المطيري'], caseId: createdCases[5].id, type: 'meeting', direction: 'incoming', subject: 'مراجعة موقف القضية', body: 'لقاء 60 دقيقة — توضيح الخطوات قبل الجلسة الأولى', durationMin: 60, date: daysFromNow(-4, 11) },
    { clientId: C['مطعم الديوانية'], caseId: createdCases[9].id, type: 'note', direction: 'outgoing', subject: 'ملاحظة داخلية', body: 'تذكير: التأكد من سند الإيجار الأصلي قبل تقديم الدعوى', date: daysFromNow(-1, 17) },
    { clientId: C['مجموعة الفيصلية القابضة'], type: 'sms', direction: 'outgoing', subject: 'تذكير بدفع الفاتورة', body: 'تذكير ودي — الفاتورة #INV-2026-004 متأخرة 12 يوماً', date: daysFromNow(0, 9) },
    { clientId: C['صيدليات الخليج'], caseId: createdCases[2].id, type: 'email', direction: 'incoming', subject: 'موافقة على المسودة الأخيرة', body: 'الموافقة النهائية — يرجى تحضير نسخة التوقيع', date: daysFromNow(0, 12) },
    { clientId: C['جلف تك'], caseId: createdCases[6].id, type: 'email', direction: 'outgoing', subject: 'تسليم دليل الموظفين', body: 'تم التسليم — انتهت الاستشارة', date: daysFromNow(-30, 10) },
    { clientId: C['مؤسسة النخيل للمقاولات'], caseId: createdCases[11].id, type: 'call', direction: 'outgoing', subject: 'مناقشة الشهود', body: 'مكالمة 25 دقيقة لتحديد قائمة الشهود', durationMin: 25, date: daysFromNow(-6, 14) },
    { clientId: C['محمد عبدالله الحارثي'], caseId: createdCases[8].id, type: 'meeting', direction: 'incoming', subject: 'استشارة الأحوال الشخصية', body: 'لقاء قصير — تم تسليم الوكالة', durationMin: 30, date: daysFromNow(-40, 10) },
    { clientId: C['سارة بنت فهد'], caseId: createdCases[10].id, type: 'note', direction: 'outgoing', subject: 'انتهاء الوكالة', body: 'تم تسليم الوكالة بنجاح', date: daysFromNow(-21, 13) },
    { clientId: C['تكو الرياض'], caseId: createdCases[14].id, type: 'email', direction: 'outgoing', subject: 'إغلاق ملف الاستشارة', body: 'شكراً على التعاون — الملف مغلق', date: daysFromNow(-28, 11) },
    { clientId: C['مجموعة الفيصلية القابضة'], caseId: createdCases[15].id, type: 'meeting', direction: 'incoming', subject: 'بدء مشروع فرع جدة', body: 'لقاء افتتاحي للمشروع — تحديد متطلبات التأسيس', durationMin: 75, date: daysFromNow(-8, 15) },
    { clientId: C['منشأة الخليج التقنية'], caseId: createdCases[16].id, type: 'email', direction: 'incoming', subject: 'مستندات تعديل الملكية', body: 'مرفق المستندات المطلوبة', date: daysFromNow(-2, 15) },
    { clientId: C['نورة الدوسري'], caseId: createdCases[17].id, type: 'note', direction: 'outgoing', subject: 'مراجعة العقد الداخلي', body: 'تم — عقد نظيف', date: daysFromNow(-200, 10) },
    { clientId: C['برايتسعود التجارية'], caseId: createdCases[13].id, type: 'call', direction: 'outgoing', subject: 'مناقشة اتفاقية الموزعين', body: 'مكالمة لمناقشة الفروقات بين 3 مدن', durationMin: 35, date: daysFromNow(-3, 13) },
    { clientId: C['شركة أرامكو السعودية للخدمات'], caseId: createdCases[7].id, type: 'email', direction: 'outgoing', subject: 'تحديث أسبوعي — دفعة 1', body: 'تم الانتهاء من 4 عقود — البدء بالدفعة الثانية الأسبوع المقبل', date: daysFromNow(-2, 16) },
    { clientId: C['عائلة آل سليمان'], caseId: createdCases[4].id, type: 'sms', direction: 'outgoing', subject: 'تذكير بالموعد', body: 'موعد الجلسة بعد 22 يوماً — التحضير جارٍ', date: daysFromNow(0, 8) },
    { clientId: C['خالد العتيبي'], caseId: createdCases[12].id, type: 'note', direction: 'outgoing', subject: 'تجديد العقد', body: 'تحضير مسودة التجديد قبل انتهاء العقد بأسبوعين', date: daysFromNow(-1, 11) },
    { clientId: C['مطعم الديوانية'], caseId: createdCases[9].id, type: 'call', direction: 'incoming', subject: 'تحديث من العميل', body: 'مكالمة 12 دقيقة — تأكيد رغبة العميل في المضي قُدماً', durationMin: 12, date: daysFromNow(-2, 17) },
    { clientId: C['سعود المطيري'], caseId: createdCases[5].id, type: 'sms', direction: 'outgoing', subject: 'تأكيد الموعد', body: 'تذكير بالجلسة الأولى بعد 18 يوماً', date: daysFromNow(0, 9) },
  ]
  for (const c of comms) await db.communication.create({ data: c })

  // ─── Daily briefs (8) ─────────────────────────────────────────────
  const briefs = [
    { title: 'وزارة العدل تطلق بوابة التقاضي الإلكتروني v3', summary: 'بوابة تقاضي إلكترونية محسّنة مع صياغة مساعدة بالذكاء الاصطناعي. إلزامية لجميع القضايا المدنية الجديدة اعتباراً من الشهر القادم.', source: 'MoJ', category: 'regulation', url: 'https://www.moj.gov.sa', publishedAt: daysFromNow(0) },
    { title: 'وزارة الموارد البشرية تحدّث سياسة العمل عن بُعد', summary: 'مرسوم جديد يوضح التزامات صاحب العمل في ترتيبات العمل الهجين. وثّق سياسة العمل عن بُعد في دليل الموظفين.', source: 'MHRSD', category: 'labor', url: 'https://www.hrsd.gov.sa', publishedAt: daysFromNow(-1) },
    { title: 'تذكير: إقرار ضريبة القيمة المضافة — الربع الثاني', summary: 'إقرارات Q2 مستحقة خلال 30 يوماً للمُكلين القياسيين. غرامة التأخير: 5% من الضريبة غير المدفوعة شهرياً.', source: 'VAT', category: 'tax', publishedAt: daysFromNow(-1) },
    { title: 'تعديل قانون التجارة السعودي — المادة 18', summary: 'متطلبات إفصاح محدّثة لمساهمي المنشآت الصغيرة اعتباراً من الربع الثالث. راجع اتفاقيات المساهمين.', source: 'MoJ', category: 'corporate', publishedAt: daysFromNow(-2) },
    { title: 'نصيحة: تشديد فترة السماح لتجديد الإقامة', summary: 'تطبّق الجوازات فترة سماح 3 أيام بعد انتهاء الإقامة. احجز قبل 30 يوماً لتجنب الغرامات.', source: 'local_tip', category: 'labor', publishedAt: daysFromNow(-2) },
    { title: 'تخفيض رسوم تسجيل العلامات التجارية', summary: 'خفّضت الهيئة السعودية للملكية الفكرية رسوم التسجيل لفئة واحدة بنسبة 15% للمنشآت الصغيرة المسجلة في منشآت.', source: 'MoJ', category: 'ip', publishedAt: daysFromNow(-3) },
    { title: 'منصة ناجز تضيف خاصية تتبع القضايا اللحظي', summary: 'تحديث جديد على ناجز يسمح بمتابعة حالة القضية وتلقي إشعارات الجلسات لحظياً. مُفعّل تلقائياً لجميع الحسابات.', source: 'MoJ', category: 'regulation', url: 'https://najiz.sa', publishedAt: daysFromNow(-4) },
    { title: 'هيئة الزكاة: تفاصيل جديدة عن فوترة المرحلة الثانية', summary: 'إيضاح حول الفوترة الإلكترونية المرحلة الثانية لقطاع المهن الحرة. مكاتب المحاماة ضمن نطاق التطبيق.', source: 'VAT', category: 'tax', url: 'https://zatca.gov.sa', publishedAt: daysFromNow(-5) },
  ]
  for (const b of briefs) await db.dailyBrief.create({ data: b })

  console.log(`Seed complete (Arabic)
  ${clients.length} clients
  ${createdCases.length} cases
  ${docs.length} documents
  ${tasks.length} tasks
  ${timeEntries.length} time entries
  ${invoices.length} invoices
  ${comms.length} communications
  ${briefs.length} daily briefs
  ${complianceItems.length} compliance items`)
}

main().then(() => db.$disconnect()).catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
