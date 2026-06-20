// Seed Sanad with realistic Saudi-context demo data
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

  await db.user.create({
    data: { email: 'ahmed@sanad.sa', name: 'Ahmed Al-Qahtani', role: 'lawyer' },
  })

  const complianceItems = [
    { title: 'Iqama Renewal', category: 'ikama', entityName: 'Mohammed Saeed (Accountant)', issueDate: daysFromNow(-365), expiryDate: daysFromNow(18), status: 'expiring', notes: 'Requires jawazat appointment + medical', notifyDays: 30 },
    { title: 'Iqama Renewal', category: 'ikama', entityName: 'Layla Hassan (HR)', issueDate: daysFromNow(-360), expiryDate: daysFromNow(45), status: 'expiring', notifyDays: 30 },
    { title: 'Commercial Registration', category: 'cr', entityName: 'Sanad Legal LLC', issueDate: daysFromNow(-700), expiryDate: daysFromNow(72), status: 'active', notes: 'Renew via MCI portal', notifyDays: 60 },
    { title: 'Employment Contract', category: 'contract', entityName: 'Khalid Al-Otaibi (Driver)', issueDate: daysFromNow(-330), expiryDate: daysFromNow(35), status: 'expiring', notifyDays: 30 },
    { title: 'Employment Contract', category: 'contract', entityName: 'Noura Al-Dossari (Marketing)', issueDate: daysFromNow(-200), expiryDate: daysFromNow(165), status: 'active', notifyDays: 30 },
    { title: 'GOSI Filing', category: 'gosi', entityName: 'Sanad Legal LLC', issueDate: daysFromNow(-30), expiryDate: daysFromNow(7), status: 'expiring', notes: 'Monthly contribution due', notifyDays: 15 },
    { title: 'VAT Return Q2', category: 'tax', entityName: 'Sanad Legal LLC', issueDate: daysFromNow(-90), expiryDate: daysFromNow(28), status: 'expiring', notifyDays: 30 },
    { title: 'Professional License', category: 'license', entityName: 'Ahmed Al-Qahtani', issueDate: daysFromNow(-300), expiryDate: daysFromNow(220), status: 'active', notifyDays: 60 },
    { title: 'Iqama Renewal', category: 'ikama', entityName: 'Yousef Al-Harbi (Operations)', issueDate: daysFromNow(-200), expiryDate: daysFromNow(165), status: 'active', notifyDays: 30 },
    { title: 'Commercial Registration', category: 'cr', entityName: 'Gulf Tech SME', issueDate: daysFromNow(-720), expiryDate: daysFromNow(8), status: 'expiring', notifyDays: 60 },
  ]
  for (const c of complianceItems) {
    await db.complianceItem.create({ data: c })
  }

  const cases = [
    { title: 'Al-Faisaliah Contract Dispute', clientName: 'Al-Faisaliah Group', caseType: 'litigation', stage: 'drafting', priority: 'high', dueDate: daysFromNow(14), value: 450000, notes: 'Drafting statement of claim' },
    { title: 'TechCo NDA Review', clientName: 'TechCo Riyadh', caseType: 'contract', stage: 'drafting', priority: 'normal', dueDate: daysFromNow(5), value: 0, notes: 'Mutual NDA for partnership talks' },
    { title: 'Gulf Pharma M&A', clientName: 'Gulf Pharmaceutical', caseType: 'corporate', stage: 'client_review', priority: 'urgent', dueDate: daysFromNow(3), value: 1200000, notes: 'Awaiting client feedback on SPA' },
    { title: 'BrightSaud Trademark', clientName: 'BrightSaud Retail', caseType: 'ip', stage: 'client_review', priority: 'normal', dueDate: daysFromNow(10), value: 8500, notes: 'Trademark application docs with client' },
    { title: 'Family Inheritance Case #218', clientName: 'Al-Sulaiman Family', caseType: 'litigation', stage: 'filed', priority: 'high', dueDate: daysFromNow(30), value: 0, notes: 'Filed at Riyadh General Court' },
    { title: 'MHRSD Labor Dispute', clientName: 'Saud Al-Mutairi', caseType: 'litigation', stage: 'filed', priority: 'normal', dueDate: daysFromNow(21), value: 0, notes: 'Awaiting first hearing date' },
    { title: 'GulfTech Employment Policy', clientName: 'GulfTech', caseType: 'consultation', stage: 'closed', priority: 'low', value: 15000, notes: 'Handbook delivered and approved' },
  ]
  const createdCases = []
  for (const c of cases) {
    createdCases.push(await db.legalCase.create({ data: c }))
  }

  const docs = [
    { title: 'Mutual NDA — TechCo', docType: 'nda', status: 'sent', parties: 'Sanad Legal ↔ TechCo', signedDate: daysFromNow(-5), expiryDate: daysFromNow(355), notes: 'Sent for signature', caseId: createdCases[1].id },
    { title: 'Employment Contract — Noura', docType: 'employment', status: 'active', parties: 'Sanad Legal ↔ Noura Al-Dossari', signedDate: daysFromNow(-200), expiryDate: daysFromNow(165), caseId: null },
    { title: 'Non-Compete — Khalid', docType: 'non_compete', status: 'active', parties: 'Sanad Legal ↔ Khalid Al-Otaibi', signedDate: daysFromNow(-330), expiryDate: daysFromNow(35), notes: 'Driver role, 2yr restriction', caseId: null },
    { title: 'MSA — Al-Faisaliah', docType: 'msa', status: 'draft', parties: 'Sanad Legal ↔ Al-Faisaliah Group', signedDate: null, expiryDate: null, caseId: createdCases[0].id },
    { title: 'Subcontract — GulfTech', docType: 'subcontract', status: 'sent', parties: 'GulfTech ↔ Sanad Legal', signedDate: null, expiryDate: null, notes: 'Pending signature', caseId: null },
    { title: 'Employee Handbook v2', docType: 'policy', status: 'active', parties: 'Sanad Legal internal', signedDate: daysFromNow(-90), expiryDate: null, caseId: createdCases[6].id },
    { title: 'Old NDA — 2023', docType: 'nda', status: 'expired', parties: 'Sanad Legal ↔ Legacy Client', signedDate: daysFromNow(-400), expiryDate: daysFromNow(-35), caseId: null },
    { title: 'Settlement Agreement — Al-Sulaiman', docType: 'msa', status: 'draft', parties: 'Al-Sulaiman heirs', signedDate: null, expiryDate: null, caseId: createdCases[4].id },
  ]
  for (const d of docs) {
    await db.legalDocument.create({ data: d })
  }

  const tasks = [
    { title: 'Follow up on NDA signature', description: 'TechCo NDA sent 5 days ago — chase signature', status: 'todo', priority: 'high', dueDate: daysFromNow(-1), relatedDoc: 'Mutual NDA — TechCo', autoGen: true },
    { title: 'Schedule GOSI payment', description: 'Monthly GOSI contribution due in 7 days', status: 'todo', priority: 'high', dueDate: daysFromNow(5), autoGen: false },
    { title: 'Draft SPA revisions', description: 'Incorporate client comments on Gulf Pharma M&A', status: 'in_progress', priority: 'urgent', dueDate: daysFromNow(3), caseId: createdCases[2].id },
    { title: 'Prepare hearing bundle', description: 'Al-Sulaiman inheritance — gather title deeds', status: 'todo', priority: 'high', dueDate: daysFromNow(15), caseId: createdCases[4].id },
    { title: 'Renew employee contract — Khalid', description: 'Contract expires in 35 days, draft renewal', status: 'todo', priority: 'normal', dueDate: daysFromNow(10), relatedDoc: 'Non-Compete — Khalid', autoGen: true },
    { title: 'File VAT return Q2', description: 'Submit via ZATCA portal before deadline', status: 'todo', priority: 'high', dueDate: daysFromNow(28), autoGen: false },
    { title: 'Send welcome packet to new client', description: 'GulfTech onboarding docs', status: 'done', priority: 'low', dueDate: daysFromNow(-3) },
    { title: 'Review MHRSD labor law update', description: 'New decree on remote work — review impact', status: 'todo', priority: 'normal', dueDate: daysFromNow(7), autoGen: false },
    { title: 'Confirm hearing date', description: 'Call court for Al-Sulaiman hearing schedule', status: 'todo', priority: 'high', dueDate: daysFromNow(2), caseId: createdCases[4].id },
    { title: 'Update client on Gulf Pharma', description: 'Status email with revised timeline', status: 'todo', priority: 'urgent', dueDate: daysFromNow(1), caseId: createdCases[2].id },
  ]
  for (const t of tasks) {
    await db.task.create({ data: t })
  }

  const timeEntries = [
    { caseId: createdCases[2].id, description: 'SPA revisions — Gulf Pharma', durationSec: 5400, billable: true, hourlyRate: 850, sessionType: 'billable', date: daysFromNow(0) },
    { caseId: createdCases[0].id, description: 'Statement of claim drafting', durationSec: 7200, billable: true, hourlyRate: 850, sessionType: 'billable', date: daysFromNow(-1) },
    { caseId: null, description: 'Deep work — NDA review', durationSec: 2700, billable: false, sessionType: 'focus', date: daysFromNow(0) },
    { caseId: createdCases[4].id, description: 'Title deeds review', durationSec: 3600, billable: true, hourlyRate: 750, sessionType: 'billable', date: daysFromNow(-2) },
    { caseId: createdCases[1].id, description: 'NDA markup', durationSec: 1800, billable: true, hourlyRate: 850, sessionType: 'billable', date: daysFromNow(-1) },
    { caseId: null, description: 'Focus block — research MHRSD decree', durationSec: 3300, billable: false, sessionType: 'focus', date: daysFromNow(-3) },
    { caseId: createdCases[2].id, description: 'Client call — Gulf Pharma', durationSec: 2400, billable: true, hourlyRate: 850, sessionType: 'meeting', date: daysFromNow(-2) },
  ]
  for (const te of timeEntries) {
    await db.timeEntry.create({ data: te })
  }

  const briefs = [
    { title: 'MoJ Launches E-Litigation Portal v3', summary: 'Ministry of Justice rolls out enhanced e-filing with AI-assisted statement drafting. Mandatory for all new civil cases from next month.', source: 'MoJ', category: 'regulation', url: 'https://www.moj.gov.sa', publishedAt: daysFromNow(0) },
    { title: 'MHRSD Updates Remote Work Policy', summary: 'New decree clarifies employer obligations for hybrid work arrangements. Document remote work policy in employee handbook.', source: 'MHRSD', category: 'labor', url: 'https://www.hrsd.gov.sa', publishedAt: daysFromNow(-1) },
    { title: 'ZATCA VAT Return Reminder — Q2', summary: 'Q2 VAT returns due within 30 days for standard filers. Late filing penalty: 5% of unpaid tax per month.', source: 'VAT', category: 'tax', publishedAt: daysFromNow(-1) },
    { title: 'Saudi Commercial Law Amendment — Clause 18', summary: 'Updated disclosure requirements for SME shareholders effective Q3. Review shareholder agreements.', source: 'MoJ', category: 'corporate', publishedAt: daysFromNow(-2) },
    { title: 'Tip: Iqama Renewal Grace Period Tightened', summary: 'Jawazat now enforces strict 3-day grace period after expiry. Schedule appointments 30+ days ahead to avoid penalties.', source: 'local_tip', category: 'labor', publishedAt: daysFromNow(-2) },
    { title: 'Trademark Filing Fee Reduction', summary: 'SAIP reduces single-class trademark filing fee by 15% for SMEs registered with Monsha\'at.', source: 'MoJ', category: 'ip', publishedAt: daysFromNow(-3) },
  ]
  for (const b of briefs) {
    await db.dailyBrief.create({ data: b })
  }

  console.log('Seed complete')
}

main().then(() => db.$disconnect()).catch(async (e) => {
  console.error(e)
  await db.$disconnect()
  process.exit(1)
})
