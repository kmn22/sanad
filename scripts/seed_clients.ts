// Seed Clients + link existing cases + seed sample communications + invoices
import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

function daysFromNow(days: number): Date {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(0, 0, 0, 0)
  return d
}

async function main() {
  // Create clients from existing case data
  const clients = [
    { name: 'مجموعة الفيصلية', type: 'corporate', phone: '011-456-7890', email: 'legal@alfaisaliah.com', nationalId: '1010234567', address: 'الرياض، حي العليا', company: 'مجموعة الفيصلية القابضة', notes: 'عميل استراتيجي — تعامل منذ 2020' },
    { name: 'تكو الرياض', type: 'corporate', phone: '011-876-5432', email: 'info@techco.sa', nationalId: '1010987654', address: 'الرياض، حي جرير', company: 'تكو للحلول التقنية', notes: 'شركة ناشئة — شراكات محتملة' },
    { name: 'صيدليات الخليج', type: 'corporate', phone: '012-345-6789', email: 'legal@gulfpharma.sa', nationalId: '1010456789', address: 'جدة، حي الروضة', company: 'صيدليات الخليج', notes: 'استحواذ كبير — سرية تامة' },
    { name: 'برايتسعود التجارية', type: 'corporate', phone: '011-234-5678', email: 'trademark@brightsaud.sa', nationalId: '1010567890', address: 'الرياض، حي النخيل', company: 'برايتسعود', notes: 'ملفات علامات تجارية' },
    { name: 'عائلة آل سليمان', type: 'individual', phone: '050-123-4567', email: 'alsulaiman.family@gmail.com', nationalId: '1098234567', address: 'الرياض، حي الملقا', notes: 'قضية ميراث — 4 ورثة' },
    { name: 'سعود المطيري', type: 'individual', phone: '055-987-6543', email: 'saud.mutairi@email.com', nationalId: '1098765432', address: 'الرياض، حي السلي', notes: 'نزاع عمالي مع صاحب عمل سابق' },
    { name: 'جلف تك', type: 'corporate', phone: '011-345-6789', email: 'hr@gulftech.sa', nationalId: '1010678901', address: 'الرياض، حي الواحة', company: 'جلف تك للبرمجيات', notes: 'سياسات توظيف + عقود فرعية' },
  ]
  const createdClients: any[] = []
  for (const c of clients) {
    createdClients.push(await db.client.create({ data: c }))
  }

  // Link existing cases to clients
  const cases = await db.legalCase.findMany()
  const linkMap: Record<string, string> = {
    'نزاع عقد الفيصلية': createdClients[0].id,
    'مراجعة اتفاقية سرية — تكو': createdClients[1].id,
    'استحواذ صيدليات الخليج': createdClients[2].id,
    'علامة برايتسعود التجارية': createdClients[3].id,
    'قضية ميراث آل سليمان #218': createdClients[4].id,
    'نزاع عمالي': createdClients[5].id,
    'سياسة توظيف جلف تك': createdClients[6].id,
  }
  for (const c of cases) {
    const clientId = linkMap[c.title]
    if (clientId) {
      await db.legalCase.update({ where: { id: c.id }, data: { clientId } })
    }
  }

  // Link documents to clients where possible
  const docs = await db.legalDocument.findMany()
  const docLinkMap: Record<string, string> = {
    'اتفاقية سرية مشتركة — تكو': createdClients[1].id,
    'اتفاقية خدمات — الفيصلية': createdClients[0].id,
    'عقد مقاول فرعي — جلف تك': createdClients[6].id,
    'اتفاقية تسوية — آل سليمان': createdClients[4].id,
  }
  for (const d of docs) {
    const clientId = docLinkMap[d.title]
    if (clientId) {
      await db.legalDocument.update({ where: { id: d.id }, data: { clientId } })
    }
  }

  // Create sample communications
  const communications = [
    { clientId: createdClients[0].id, caseId: cases.find(c => c.title === 'نزاع عقد الفيصلية')?.id, type: 'call', direction: 'outgoing', subject: 'مكالمة متابعة', body: 'تم الاتصال بالأستاذ خالد لمناقشة المستندات المطلوبة. وعد بتجهيزها خلال 3 أيام.', durationMin: 12, date: daysFromNow(-2) },
    { clientId: createdClients[2].id, caseId: cases.find(c => c.title === 'استحواذ صيدليات الخليج')?.id, type: 'meeting', direction: 'incoming', subject: 'اجتماع مراجعة SPA', body: 'اجتماع مع فريق صيدليات الخليج لمراجعة المسودة المعدلة. تم الاتفاق على 3 تعديلات رئيسية.', durationMin: 90, date: daysFromNow(-1) },
    { clientId: createdClients[1].id, caseId: cases.find(c => c.title === 'مراجعة اتفاقية سرية — تكو')?.id, type: 'email', direction: 'outgoing', subject: 'إرسال المسودة المعدلة', body: 'تم إرسال النسخة المعدلة من اتفاقية السرية مع التعليقات. بانتظار المراجعة والتوقيع.', date: daysFromNow(-3) },
    { clientId: createdClients[4].id, caseId: cases.find(c => c.title === 'قضية ميراث آل سليمان #218')?.id, type: 'call', direction: 'incoming', subject: 'استفسار عن موعد الجلسة', body: 'اتصل الأستاذ عبدالله مستفسراً عن موعد الجلسة القادمة. تم إعلامه بأنه بانتظار تحديد الموعد من المحكمة.', durationMin: 8, date: daysFromNow(-4) },
    { clientId: createdClients[2].id, caseId: cases.find(c => c.title === 'استحواذ صيدليات الخليج')?.id, type: 'email', direction: 'incoming', subject: 'ملاحظات على المسودة', body: 'وصلت ملاحظات فريق الخليج على اتفاقية الاستحواذ. تحتاج مراجعة قانونية معمقة.', date: daysFromNow(0) },
    { clientId: createdClients[5].id, caseId: cases.find(c => c.title === 'نزاع عمالي')?.id, type: 'sms', direction: 'outgoing', subject: 'تأكيد موعد', body: 'تذكير بموعد اللقاء يوم الأحد الساعة 10 صباحاً.', date: daysFromNow(-1) },
    { clientId: createdClients[3].id, caseId: cases.find(c => c.title === 'علامة برايتسعود التجارية')?.id, type: 'note', direction: 'outgoing', subject: 'ملاحظة داخلية', body: 'العميل يفضل التواصل عبر البريد الإلكتروني فقط. تجنب المكالمات الهاتفية إلا في حالات الطوارئ.', date: daysFromNow(-5) },
  ]
  for (const c of communications) {
    await db.communication.create({ data: c as any })
  }

  // Create one sample invoice (from the Gulf Pharma billable time entries)
  const billableEntries = await db.timeEntry.findMany({
    where: { billable: true, invoiced: false, caseId: cases.find(c => c.title === 'استحواذ صيدليات الخليج')?.id }
  })
  if (billableEntries.length > 0) {
    const subtotal = billableEntries.reduce((s, t) => s + (t.durationSec / 3600) * (t.hourlyRate || 0), 0)
    const vatAmount = subtotal * 0.15
    const total = subtotal + vatAmount

    const invoice = await db.invoice.create({
      data: {
        number: 'INV-2026-001',
        clientId: createdClients[2].id,
        caseId: cases.find(c => c.title === 'استحواذ صيدليات الخليج')?.id,
        issueDate: new Date(),
        dueDate: daysFromNow(30),
        status: 'sent',
        subtotal,
        vatRate: 15,
        vatAmount,
        total,
        notes: 'فاتورة خدمات قانونية — استحواذ صيدليات الخليج',
      },
    })

    // Mark time entries as invoiced
    for (const te of billableEntries) {
      await db.timeEntry.update({
        where: { id: te.id },
        data: { invoiced: true, invoiceId: invoice.id },
      })
    }
  }

  // Create a second paid invoice for variety
  const alFaisaliahEntries = await db.timeEntry.findMany({
    where: { billable: true, invoiced: false, caseId: cases.find(c => c.title === 'نزاع عقد الفيصلية')?.id }
  })
  if (alFaisaliahEntries.length > 0) {
    const subtotal = alFaisaliahEntries.reduce((s, t) => s + (t.durationSec / 3600) * (t.hourlyRate || 0), 0)
    const vatAmount = subtotal * 0.15
    const total = subtotal + vatAmount

    const invoice2 = await db.invoice.create({
      data: {
        number: 'INV-2026-002',
        clientId: createdClients[0].id,
        caseId: cases.find(c => c.title === 'نزاع عقد الفيصلية')?.id,
        issueDate: daysFromNow(-15),
        dueDate: daysFromNow(15),
        status: 'paid',
        subtotal,
        vatRate: 15,
        vatAmount,
        total,
        paidAmount: total,
        paidAt: daysFromNow(-2),
        notes: 'صحيفة الدعوى — نزاع عقد الفيصلية',
      },
    })

    for (const te of alFaisaliahEntries) {
      await db.timeEntry.update({
        where: { id: te.id },
        data: { invoiced: true, invoiceId: invoice2.id },
      })
    }
  }

  console.log('Clients + communications + invoices seed complete')
  console.log(`Created ${createdClients.length} clients`)
}

main().then(() => db.$disconnect()).catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
