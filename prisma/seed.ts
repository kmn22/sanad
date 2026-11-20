/**
 * ============================================================================
 * Maqar (مقر) — Unified Legal Operations, CLM & Governance SaaS Platform
 * Production-Grade Idempotent Multi-Tenant Database Seed (`prisma/seed.ts`)
 * ============================================================================
 *
 * Seeds three deterministic, isolated tenant profiles:
 *   A. Tenant 1 (Corporate Entity): الشركة الوطنية للتقنية
 *   B. Tenant 2 (Law Firm): شركة خالد وشركاؤه للمحاماة والاستشارات القانونية
 *   C. Tenant 3 (Academic & Student Lab): المقر الأكاديمي
 *
 * Safe to re-run repeatedly: every entity uses deterministic IDs/unique keys
 * with `prisma.<model>.upsert(...)`.
 */

import {
  PrismaClient,
  OrganizationType,
  SubscriptionTier,
  UserType,
  MembershipRole,
  ContractStatus,
  RiskLevel,
  CaseStatus,
  ComplianceStatus,
  KnowledgeCategory,
} from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password'

const prisma = new PrismaClient()

function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * 24 * 60 * 60 * 1000)
}

async function seedMaqarMultiTenantPlatform() {
  const now = new Date()
  const defaultPasswordHash = hashPassword('MaqarEnterprise2026!')

  console.log('🚀 [Maqar Seed] Starting idempotent multi-tenant seeding...')

  // ==========================================================================
  // TENANT 1: CORPORATE ENTITY — الشركة الوطنية للتقنية
  // ==========================================================================
  console.log('🏢 Seeding Tenant 1: الشركة الوطنية للتقنية (ENTERPRISE_CORP)...')

  const orgCorp = await prisma.organization.upsert({
    where: { slug: 'national-tech-corp' },
    update: {
      name: 'الشركة الوطنية للتقنية',
      type: OrganizationType.ENTERPRISE_CORP,
      tier: SubscriptionTier.ENTERPRISE,
      isActive: true,
    },
    create: {
      id: 'org-maqar-national-tech',
      name: 'الشركة الوطنية للتقنية',
      slug: 'national-tech-corp',
      type: OrganizationType.ENTERPRISE_CORP,
      tier: SubscriptionTier.ENTERPRISE,
      isActive: true,
    },
  })

  const wsCorp = await prisma.workspace.upsert({
    where: { id: 'ws-maqar-national-tech-clm' },
    update: {
      orgId: orgCorp.id,
      name: 'الإدارة القانونية وحوكمة العقود والامتثال — الشركة الوطنية للتقنية',
      type: 'corporate_clm',
      status: 'active',
      onboardingStatus: 'completed',
      settings: {
        locale: 'ar-SA',
        timezone: 'Asia/Riyadh',
        rlsEnforced: true,
        dlpPolicy: 'STRICT_SOVEREIGN',
        approvalMatrix: {
          clmHighRiskRequiresGeneralCounsel: true,
          pdplTransferRequiresDpoSignoff: true,
        },
      },
    },
    create: {
      id: 'ws-maqar-national-tech-clm',
      orgId: orgCorp.id,
      name: 'الإدارة القانونية وحوكمة العقود والامتثال — الشركة الوطنية للتقنية',
      type: 'corporate_clm',
      status: 'active',
      onboardingStatus: 'completed',
      settings: {
        locale: 'ar-SA',
        timezone: 'Asia/Riyadh',
        rlsEnforced: true,
        dlpPolicy: 'STRICT_SOVEREIGN',
        approvalMatrix: {
          clmHighRiskRequiresGeneralCounsel: true,
          pdplTransferRequiresDpoSignoff: true,
        },
      },
    },
  })

  // 1 Admin (Corporate Legal Director)
  const corpDirector = await prisma.user.upsert({
    where: { email: 'legal.director@nationaltech.sa' },
    update: {
      name: 'المستشار سلطان بن فهد العريفي',
      fullName: 'المستشار سلطان بن فهد العريفي (مدير الإدارة القانونية والحوكمة)',
      userType: UserType.CORPORATE_COUNSEL,
      role: 'admin',
      accountType: 'firm',
      workspaceId: wsCorp.id,
      emailVerified: now,
    },
    create: {
      id: 'user-maqar-corp-director',
      email: 'legal.director@nationaltech.sa',
      name: 'المستشار سلطان بن فهد العريفي',
      fullName: 'المستشار سلطان بن فهد العريفي (مدير الإدارة القانونية والحوكمة)',
      userType: UserType.CORPORATE_COUNSEL,
      password: defaultPasswordHash,
      role: 'admin',
      accountType: 'firm',
      workspaceId: wsCorp.id,
      emailVerified: now,
    },
  })

  await prisma.membership.upsert({
    where: {
      userId_orgId: {
        userId: corpDirector.id,
        orgId: orgCorp.id,
      },
    },
    update: {
      role: MembershipRole.SUPER_ADMIN,
      isActive: true,
      permissions: {
        'clm:create': true,
        'clm:approve': true,
        'clm:sign_dispatch': true,
        'grc:audit': true,
        'board:resolutions': true,
      },
    },
    create: {
      id: 'mem-maqar-corp-director',
      userId: corpDirector.id,
      orgId: orgCorp.id,
      role: MembershipRole.SUPER_ADMIN,
      isActive: true,
      permissions: {
        'clm:create': true,
        'clm:approve': true,
        'clm:sign_dispatch': true,
        'grc:audit': true,
        'board:resolutions': true,
      },
    },
  })

  await prisma.workspaceMembership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: wsCorp.id,
        userId: corpDirector.id,
      },
    },
    update: { role: 'admin', status: 'active', isOwner: true },
    create: {
      workspaceId: wsCorp.id,
      userId: corpDirector.id,
      role: 'admin',
      status: 'active',
      isOwner: true,
    },
  })

  // Contract 1: "اتفاقية عدم إفصاح وحماية بيانات سرية (NDA)" - Status: 'ACTIVE'
  await prisma.contractLifecycle.upsert({
    where: { id: 'clm-national-tech-nda-01' },
    update: {
      workspaceId: wsCorp.id,
      orgId: orgCorp.id,
      title: 'اتفاقية عدم إفصاح وحماية بيانات سرية (NDA)',
      contractType: 'NDA',
      status: ContractStatus.ACTIVE,
      riskLevel: RiskLevel.LOW,
      effectiveDate: addDays(now, -60),
      expiryDate: addDays(now, 305),
      content:
        'اتفاقية عدم إفصاح متبادلة خاضعة لنظام المعاملات المدنية السعودي (المرسوم الملكي م/191) ونظام حماية البيانات الشخصية (PDPL). يلتزم الطرفان بالمحافظة على سرية الخوارزميات والبيانات الفنية والتجارية لمدة ثلاث سنوات من تاريخ الإفصاح.',
      metadata: {
        counterparty: 'شركة الرواد لحلول الذكاء الاصطناعي',
        governingLaw: 'أنظمة المملكة العربية السعودية — الاختصاص القضائي: المحكمة التجارية بالرياض',
        clmStateMachineStage: 'ACTIVE',
        signatureEnvelopeId: 'ENV-NAFATH-NDA-2026-001',
        valueSar: 0,
        autoRenewal: false,
      },
    },
    create: {
      id: 'clm-national-tech-nda-01',
      workspaceId: wsCorp.id,
      orgId: orgCorp.id,
      title: 'اتفاقية عدم إفصاح وحماية بيانات سرية (NDA)',
      contractType: 'NDA',
      status: ContractStatus.ACTIVE,
      riskLevel: RiskLevel.LOW,
      effectiveDate: addDays(now, -60),
      expiryDate: addDays(now, 305),
      content:
        'اتفاقية عدم إفصاح متبادلة خاضعة لنظام المعاملات المدنية السعودي (المرسوم الملكي م/191) ونظام حماية البيانات الشخصية (PDPL). يلتزم الطرفان بالمحافظة على سرية الخوارزميات والبيانات الفنية والتجارية لمدة ثلاث سنوات من تاريخ الإفصاح.',
      metadata: {
        counterparty: 'شركة الرواد لحلول الذكاء الاصطناعي',
        governingLaw: 'أنظمة المملكة العربية السعودية — الاختصاص القضائي: المحكمة التجارية بالرياض',
        clmStateMachineStage: 'ACTIVE',
        signatureEnvelopeId: 'ENV-NAFATH-NDA-2026-001',
        valueSar: 0,
        autoRenewal: false,
      },
    },
  })

  // Contract 2: "عقد توريد وخدمات سحابية" - Status: 'LEGAL_REVIEW' with identified risk flags
  await prisma.contractLifecycle.upsert({
    where: { id: 'clm-national-tech-cloud-02' },
    update: {
      workspaceId: wsCorp.id,
      orgId: orgCorp.id,
      title: 'عقد توريد وخدمات سحابية',
      contractType: 'CLOUD_MSA_SLA',
      status: ContractStatus.LEGAL_REVIEW,
      riskLevel: RiskLevel.HIGH,
      effectiveDate: addDays(now, 7),
      expiryDate: addDays(now, 372),
      content:
        'يلتزم المورد بتقديم خدمات البنية التحتية السحابية وتوريد الخوادم. يتضمن البند الثامن شرطاً جزائياً قطعياً لا يخضع لرقابة القضاء، كما ينص البند الثاني عشر على إمكانية معالجة النسخ الاحتياطية في مراكز بيانات خارج المملكة دون تقييم أثر نقل البيانات.',
      metadata: {
        counterparty: 'شركة الآفاق العالمية للحوسبة السحابية',
        valueSar: 4850000,
        clmStateMachineStage: 'AI_CLAUSE_RISK_AUDIT',
        identifiedRiskFlags: [
          {
            code: 'CLM-RISK-CTL-179',
            severity: 'HIGH',
            statute: 'المادة (179) من نظام المعاملات المدنية (م/191)',
            issue: 'بطلان شرط حرمان المحكمة من سلطة تخفيض الشرط الجزائي المبالغ فيه لتعلقه بالنظام العام.',
          },
          {
            code: 'CLM-RISK-PDPL-29',
            severity: 'HIGH',
            statute: 'المادة (29) من نظام حماية البيانات الشخصية (سدايا)',
            issue: 'نقل البيانات الاحتياطية خارج المملكة دون استيفاء الضمانات الكافية وموافقة الجهة المختصة.',
          },
          {
            code: 'CLM-RISK-LIABILITY-138',
            severity: 'MEDIUM',
            statute: 'المادة (138) من نظام المعاملات المدنية',
            issue: 'غياب سقف محدد للمسؤولية التعاقدية (Liability Cap) عن انقطاع الخدمة السحابية.',
          },
        ],
      },
    },
    create: {
      id: 'clm-national-tech-cloud-02',
      workspaceId: wsCorp.id,
      orgId: orgCorp.id,
      title: 'عقد توريد وخدمات سحابية',
      contractType: 'CLOUD_MSA_SLA',
      status: ContractStatus.LEGAL_REVIEW,
      riskLevel: RiskLevel.HIGH,
      effectiveDate: addDays(now, 7),
      expiryDate: addDays(now, 372),
      content:
        'يلتزم المورد بتقديم خدمات البنية التحتية السحابية وتوريد الخوادم. يتضمن البند الثامن شرطاً جزائياً قطعياً لا يخضع لرقابة القضاء، كما ينص البند الثاني عشر على إمكانية معالجة النسخ الاحتياطية في مراكز بيانات خارج المملكة دون تقييم أثر نقل البيانات.',
      metadata: {
        counterparty: 'شركة الآفاق العالمية للحوسبة السحابية',
        valueSar: 4850000,
        clmStateMachineStage: 'AI_CLAUSE_RISK_AUDIT',
        identifiedRiskFlags: [
          {
            code: 'CLM-RISK-CTL-179',
            severity: 'HIGH',
            statute: 'المادة (179) من نظام المعاملات المدنية (م/191)',
            issue: 'بطلان شرط حرمان المحكمة من سلطة تخفيض الشرط الجزائي المبالغ فيه لتعلقه بالنظام العام.',
          },
          {
            code: 'CLM-RISK-PDPL-29',
            severity: 'HIGH',
            statute: 'المادة (29) من نظام حماية البيانات الشخصية (سدايا)',
            issue: 'نقل البيانات الاحتياطية خارج المملكة دون استيفاء الضمانات الكافية وموافقة الجهة المختصة.',
          },
          {
            code: 'CLM-RISK-LIABILITY-138',
            severity: 'MEDIUM',
            statute: 'المادة (138) من نظام المعاملات المدنية',
            issue: 'غياب سقف محدد للمسؤولية التعاقدية (Liability Cap) عن انقطاع الخدمة السحابية.',
          },
        ],
      },
    },
  })

  // 1 Compliance Item: "الامتثال لنظام حماية البيانات الشخصية السعودي (PDPL)"
  await prisma.complianceTracker.upsert({
    where: { id: 'grc-national-tech-pdpl-01' },
    update: {
      orgId: orgCorp.id,
      regulationDomain: 'SDAIA_PDPL (المرسوم الملكي م/19 وتعديلاته)',
      requirementTitle: 'الامتثال لنظام حماية البيانات الشخصية السعودي (PDPL)',
      status: ComplianceStatus.COMPLIANT,
      auditDate: addDays(now, 30),
    },
    create: {
      id: 'grc-national-tech-pdpl-01',
      orgId: orgCorp.id,
      regulationDomain: 'SDAIA_PDPL (المرسوم الملكي م/19 وتعديلاته)',
      requirementTitle: 'الامتثال لنظام حماية البيانات الشخصية السعودي (PDPL)',
      status: ComplianceStatus.COMPLIANT,
      auditDate: addDays(now, 30),
    },
  })

  // ==========================================================================
  // TENANT 2: LAW FIRM — شركة خالد وشركاؤه للمحاماة والاستشارات القانونية
  // ==========================================================================
  console.log('⚖️ Seeding Tenant 2: شركة خالد وشركاؤه للمحاماة والاستشارات القانونية (LAW_FIRM)...')

  const orgLawFirm = await prisma.organization.upsert({
    where: { slug: 'khaled-partners-law' },
    update: {
      name: 'شركة خالد وشركاؤه للمحاماة والاستشارات القانونية',
      type: OrganizationType.LAW_FIRM,
      tier: SubscriptionTier.PROFESSIONAL,
      isActive: true,
    },
    create: {
      id: 'org-maqar-khaled-lawfirm',
      name: 'شركة خالد وشركاؤه للمحاماة والاستشارات القانونية',
      slug: 'khaled-partners-law',
      type: OrganizationType.LAW_FIRM,
      tier: SubscriptionTier.PROFESSIONAL,
      isActive: true,
    },
  })

  const wsLawFirm = await prisma.workspace.upsert({
    where: { id: 'ws-maqar-khaled-litigation' },
    update: {
      orgId: orgLawFirm.id,
      name: 'قطاع التقاضي والمنازعات التجارية والعمالية — شركة خالد وشركاؤه',
      type: 'firm',
      status: 'active',
      onboardingStatus: 'completed',
      settings: {
        locale: 'ar-SA',
        timezone: 'Asia/Riyadh',
        najizAutoSync: true,
        zatcaPhase2Enabled: true,
        alertOffsets: ['T_MINUS_7D', 'T_MINUS_3D', 'T_MINUS_24H'],
      },
    },
    create: {
      id: 'ws-maqar-khaled-litigation',
      orgId: orgLawFirm.id,
      name: 'قطاع التقاضي والمنازعات التجارية والعمالية — شركة خالد وشركاؤه',
      type: 'firm',
      status: 'active',
      onboardingStatus: 'completed',
      settings: {
        locale: 'ar-SA',
        timezone: 'Asia/Riyadh',
        najizAutoSync: true,
        zatcaPhase2Enabled: true,
        alertOffsets: ['T_MINUS_7D', 'T_MINUS_3D', 'T_MINUS_24H'],
      },
    },
  })

  // 1 Managing Partner
  const managingPartner = await prisma.user.upsert({
    where: { email: 'khaled@khaledlaw.sa' },
    update: {
      name: 'المحامي الشريك خالد بن عبدالعزيز',
      fullName: 'المحامي الشريك المؤسس خالد بن عبدالعزيز (الشريك المدير)',
      userType: UserType.ATTORNEY,
      role: 'workspace_owner',
      accountType: 'firm',
      workspaceId: wsLawFirm.id,
      emailVerified: now,
    },
    create: {
      id: 'user-maqar-managing-partner',
      email: 'khaled@khaledlaw.sa',
      name: 'المحامي الشريك خالد بن عبدالعزيز',
      fullName: 'المحامي الشريك المؤسس خالد بن عبدالعزيز (الشريك المدير)',
      userType: UserType.ATTORNEY,
      password: defaultPasswordHash,
      role: 'workspace_owner',
      accountType: 'firm',
      workspaceId: wsLawFirm.id,
      emailVerified: now,
    },
  })

  // 1 Associate Attorney
  const associateAttorney = await prisma.user.upsert({
    where: { email: 'faisal.associate@khaledlaw.sa' },
    update: {
      name: 'المحامي فيصل بن تركي القحطاني',
      fullName: 'المحامي فيصل بن تركي القحطاني (محامٍ مشارك — قسم التقاضي)',
      userType: UserType.ATTORNEY,
      role: 'lawyer',
      accountType: 'lawyer',
      workspaceId: wsLawFirm.id,
      emailVerified: now,
    },
    create: {
      id: 'user-maqar-associate-attorney',
      email: 'faisal.associate@khaledlaw.sa',
      name: 'المحامي فيصل بن تركي القحطاني',
      fullName: 'المحامي فيصل بن تركي القحطاني (محامٍ مشارك — قسم التقاضي)',
      userType: UserType.ATTORNEY,
      password: defaultPasswordHash,
      role: 'lawyer',
      accountType: 'lawyer',
      workspaceId: wsLawFirm.id,
      emailVerified: now,
    },
  })

  await prisma.membership.upsert({
    where: { userId_orgId: { userId: managingPartner.id, orgId: orgLawFirm.id } },
    update: {
      role: MembershipRole.MANAGING_PARTNER,
      isActive: true,
      permissions: {
        'cases:all': true,
        'billing:approve': true,
        'team:allocate': true,
        'briefs:sign': true,
      },
    },
    create: {
      id: 'mem-maqar-managing-partner',
      userId: managingPartner.id,
      orgId: orgLawFirm.id,
      role: MembershipRole.MANAGING_PARTNER,
      isActive: true,
      permissions: {
        'cases:all': true,
        'billing:approve': true,
        'team:allocate': true,
        'briefs:sign': true,
      },
    },
  })

  await prisma.membership.upsert({
    where: { userId_orgId: { userId: associateAttorney.id, orgId: orgLawFirm.id } },
    update: {
      role: MembershipRole.ASSOCIATE,
      isActive: true,
      permissions: {
        'cases:assigned': true,
        'briefs:draft': true,
        'sessions:attend': true,
      },
    },
    create: {
      id: 'mem-maqar-associate-attorney',
      userId: associateAttorney.id,
      orgId: orgLawFirm.id,
      role: MembershipRole.ASSOCIATE,
      isActive: true,
      permissions: {
        'cases:assigned': true,
        'briefs:draft': true,
        'sessions:attend': true,
      },
    },
  })

  await prisma.workspaceMembership.upsert({
    where: { workspaceId_userId: { workspaceId: wsLawFirm.id, userId: managingPartner.id } },
    update: { role: 'workspace_owner', status: 'active', isOwner: true },
    create: {
      workspaceId: wsLawFirm.id,
      userId: managingPartner.id,
      role: 'workspace_owner',
      status: 'active',
      isOwner: true,
    },
  })

  await prisma.workspaceMembership.upsert({
    where: { workspaceId_userId: { workspaceId: wsLawFirm.id, userId: associateAttorney.id } },
    update: { role: 'lawyer', status: 'active', isOwner: false },
    create: {
      workspaceId: wsLawFirm.id,
      userId: associateAttorney.id,
      role: 'lawyer',
      status: 'active',
      isOwner: false,
    },
  })

  // Case 1: Commercial dispute before the Commercial Court in Dammam (المحكمة التجارية بالدمام)
  // Status: 'IN_HEARING' with an upcoming session in 5 days
  const upcomingHearingIn5Days = addDays(now, 5)
  const commercialCase = await prisma.litigationCase.upsert({
    where: {
      workspaceId_caseNumber: {
        workspaceId: wsLawFirm.id,
        caseNumber: '4470955120',
      },
    },
    update: {
      orgId: orgLawFirm.id,
      courtType: 'المحكمة التجارية بالدمام — الدائرة التجارية الثالثة',
      stage: 'مرافعة وتبادل مذكرات جوابية',
      clientReference: 'KLP-DAM-2026-104',
      plaintiff: 'شركة الخليج للإمدادات الصناعية والبتروكيماويات',
      defendant: 'مؤسسة الشرق الأوسط للمقاولات والتوريد الميكانيكي',
      currentStatus: CaseStatus.IN_HEARING,
    },
    create: {
      id: 'case-maqar-dammam-commercial-01',
      workspaceId: wsLawFirm.id,
      orgId: orgLawFirm.id,
      caseNumber: '4470955120',
      courtType: 'المحكمة التجارية بالدمام — الدائرة التجارية الثالثة',
      stage: 'مرافعة وتبادل مذكرات جوابية',
      clientReference: 'KLP-DAM-2026-104',
      plaintiff: 'شركة الخليج للإمدادات الصناعية والبتروكيماويات',
      defendant: 'مؤسسة الشرق الأوسط للمقاولات والتوريد الميكانيكي',
      currentStatus: CaseStatus.IN_HEARING,
    },
  })

  await prisma.caseSession.upsert({
    where: { id: 'session-maqar-dammam-hearing-5d' },
    update: {
      caseId: commercialCase.id,
      orgId: orgLawFirm.id,
      sessionDate: upcomingHearingIn5Days,
      proceduralDeadline: addDays(upcomingHearingIn5Days, -2),
      summary:
        'جلسة مرافعة إلكترونية عبر منصة ناجز أمام الدائرة التجارية الثالثة بالمحكمة التجارية بالدمام لمناقشة تقرير الخبير المحاسبي والرد على طلبات التعويض.',
      courtDecision: 'تأجيل الجلسة لإيداع المذكرة الجوابية الختامية قبل موعد الجلسة بـ 48 ساعة.',
    },
    create: {
      id: 'session-maqar-dammam-hearing-5d',
      caseId: commercialCase.id,
      orgId: orgLawFirm.id,
      sessionDate: upcomingHearingIn5Days,
      proceduralDeadline: addDays(upcomingHearingIn5Days, -2),
      summary:
        'جلسة مرافعة إلكترونية عبر منصة ناجز أمام الدائرة التجارية الثالثة بالمحكمة التجارية بالدمام لمناقشة تقرير الخبير المحاسبي والرد على طلبات التعويض.',
      courtDecision: 'تأجيل الجلسة لإيداع المذكرة الجوابية الختامية قبل موعد الجلسة بـ 48 ساعة.',
    },
  })

  // Case 2: Labor dispute before the Labor Court (المحكمة العمالية)
  // Status: 'PENDING_APPEAL' with an auto-calculated 30-day appeal countdown
  const appealDeadlineDate = addDays(now, 30)

  const laborCase = await prisma.litigationCase.upsert({
    where: {
      workspaceId_caseNumber: {
        workspaceId: wsLawFirm.id,
        caseNumber: '4470883419',
      },
    },
    update: {
      orgId: orgLawFirm.id,
      courtType: 'المحكمة العمالية — الدائرة العمالية الثانية',
      stage: 'صدور الحكم الابتدائي — مهلة الاعتراض الاستئنافي (30 يوماً)',
      clientReference: 'KLP-LAB-2026-209',
      plaintiff: 'المهندس/ ماجد بن عبدالله الشمري',
      defendant: 'شركة النخبة للتشغيل والصيانة الصناعية',
      currentStatus: CaseStatus.PENDING_APPEAL,
    },
    create: {
      id: 'case-maqar-labor-appeal-02',
      workspaceId: wsLawFirm.id,
      orgId: orgLawFirm.id,
      caseNumber: '4470883419',
      courtType: 'المحكمة العمالية — الدائرة العمالية الثانية',
      stage: 'صدور الحكم الابتدائي — مهلة الاعتراض الاستئنافي (30 يوماً)',
      clientReference: 'KLP-LAB-2026-209',
      plaintiff: 'المهندس/ ماجد بن عبدالله الشمري',
      defendant: 'شركة النخبة للتشغيل والصيانة الصناعية',
      currentStatus: CaseStatus.PENDING_APPEAL,
    },
  })

  await prisma.caseSession.upsert({
    where: { id: 'session-maqar-labor-appeal-30d' },
    update: {
      caseId: laborCase.id,
      orgId: orgLawFirm.id,
      sessionDate: now,
      proceduralDeadline: appealDeadlineDate,
      summary: `استلام نسخة صك الحكم الابتدائي بشأن المطالبة بالتعويض عن الفصل غير المشروع وفق المادة (77) ومكافأة نهاية الخدمة وفق المادة (84) من نظام العمل. تم حساب مهلة الاعتراض (30 يوماً).`,
      courtDecision: `الحكم قابل للاعتراض بطلب الاستئناف خلال (30) يوماً تنتهي في ${appealDeadlineDate
        .toISOString()
        .slice(0, 10)} وفق المادة (187) من نظام المرافعات الشرعية.`,
    },
    create: {
      id: 'session-maqar-labor-appeal-30d',
      caseId: laborCase.id,
      orgId: orgLawFirm.id,
      sessionDate: now,
      proceduralDeadline: appealDeadlineDate,
      summary: `استلام نسخة صك الحكم الابتدائي بشأن المطالبة بالتعويض عن الفصل غير المشروع وفق المادة (77) ومكافأة نهاية الخدمة وفق المادة (84) من نظام العمل. تم حساب مهلة الاعتراض (30 يوماً).`,
      courtDecision: `الحكم قابل للاعتراض بطلب الاستئناف خلال (30) يوماً تنتهي في ${appealDeadlineDate
        .toISOString()
        .slice(0, 10)} وفق المادة (187) من نظام المرافعات الشرعية.`,
    },
  })

  // ==========================================================================
  // TENANT 3: ACADEMIC & STUDENT LAB — المقر الأكاديمي
  // ==========================================================================
  console.log('🎓 Seeding Tenant 3: المقر الأكاديمي (ACADEMIC_INSTITUTION / LAW_STUDENT)...')

  const orgAcademic = await prisma.organization.upsert({
    where: { slug: 'maqar-academic-hub' },
    update: {
      name: 'المقر الأكاديمي',
      type: OrganizationType.ACADEMIC_INSTITUTION,
      tier: SubscriptionTier.STARTER,
      isActive: true,
    },
    create: {
      id: 'org-maqar-academic-hub',
      name: 'المقر الأكاديمي',
      slug: 'maqar-academic-hub',
      type: OrganizationType.ACADEMIC_INSTITUTION,
      tier: SubscriptionTier.STARTER,
      isActive: true,
    },
  })

  const wsAcademic = await prisma.workspace.upsert({
    where: { id: 'ws-maqar-academic-lab' },
    update: {
      orgId: orgAcademic.id,
      name: 'مختبر الأبحاث القانونية والعيادة القضائية — المقر الأكاديمي',
      type: 'academic',
      status: 'active',
      onboardingStatus: 'completed',
      settings: {
        locale: 'ar-SA',
        ragStrictCitationGrounding: true,
        draftingSimulatorEnabled: true,
        talentDirectoryPublicOptIn: true,
      },
    },
    create: {
      id: 'ws-maqar-academic-lab',
      orgId: orgAcademic.id,
      name: 'مختبر الأبحاث القانونية والعيادة القضائية — المقر الأكاديمي',
      type: 'academic',
      status: 'active',
      onboardingStatus: 'completed',
      settings: {
        locale: 'ar-SA',
        ragStrictCitationGrounding: true,
        draftingSimulatorEnabled: true,
        talentDirectoryPublicOptIn: true,
      },
    },
  })

  // 1 Law Student / Researcher
  const studentResearcher = await prisma.user.upsert({
    where: { email: 'researcher@academic.maqar.sa' },
    update: {
      name: 'الباحث القانوني/ نواف بن عبدالرحمن السديري',
      fullName: 'الباحث القانوني/ نواف بن عبدالرحمن السديري (طالب دراسات قانونية وباحث)',
      userType: UserType.LAW_STUDENT,
      role: 'student',
      accountType: 'student',
      workspaceId: wsAcademic.id,
      emailVerified: now,
    },
    create: {
      id: 'user-maqar-student-researcher',
      email: 'researcher@academic.maqar.sa',
      name: 'الباحث القانوني/ نواف بن عبدالرحمن السديري',
      fullName: 'الباحث القانوني/ نواف بن عبدالرحمن السديري (طالب دراسات قانونية وباحث)',
      userType: UserType.LAW_STUDENT,
      password: defaultPasswordHash,
      role: 'student',
      accountType: 'student',
      workspaceId: wsAcademic.id,
      emailVerified: now,
    },
  })

  await prisma.membership.upsert({
    where: { userId_orgId: { userId: studentResearcher.id, orgId: orgAcademic.id } },
    update: {
      role: MembershipRole.TRAINEE_STUDENT,
      isActive: true,
      permissions: {
        'research:publish': true,
        'simulator:submit': true,
        'precedents:read': true,
      },
    },
    create: {
      id: 'mem-maqar-student-researcher',
      userId: studentResearcher.id,
      orgId: orgAcademic.id,
      role: MembershipRole.TRAINEE_STUDENT,
      isActive: true,
      permissions: {
        'research:publish': true,
        'simulator:submit': true,
        'precedents:read': true,
      },
    },
  })

  await prisma.workspaceMembership.upsert({
    where: { workspaceId_userId: { workspaceId: wsAcademic.id, userId: studentResearcher.id } },
    update: { role: 'student', status: 'active', isOwner: true },
    create: {
      workspaceId: wsAcademic.id,
      userId: studentResearcher.id,
      role: 'student',
      status: 'active',
      isOwner: true,
    },
  })

  // Research Summary 1: "تكييف المسؤولية المدنية عن أخطاء الذكاء الاصطناعي"
  await prisma.knowledgeResearchItem.upsert({
    where: { id: 'know-maqar-ai-civil-liability-01' },
    update: {
      authorId: studentResearcher.id,
      orgId: orgAcademic.id,
      category: KnowledgeCategory.RESEARCH_PAPER,
      title: 'تكييف المسؤولية المدنية عن أخطاء الذكاء الاصطناعي',
      body:
        'دراسة تأصيلية مقارنة في ضوء أحكام المسؤولية عن الفعل الضار ومسؤولية حارس الأشياء والآلات الميكانيكية وفق المواد (138) و(161) من نظام المعاملات المدنية السعودي الصادر بالمرسوم الملكي رقم (م/191) وتاريخ 29/11/1444هـ. تخلص الورقة إلى قيام مسؤولية مشغل المنظومة الذكية ومطورها على أساس السيطرة الفعلية وواجب العناية المشدد.',
      tags: [
        'الذكاء الاصطناعي',
        'المسؤولية التقصيرية',
        'نظام المعاملات المدنية',
        'المادة 138',
        'حراسة الأشياء',
      ],
      isPublic: true,
    },
    create: {
      id: 'know-maqar-ai-civil-liability-01',
      authorId: studentResearcher.id,
      orgId: orgAcademic.id,
      category: KnowledgeCategory.RESEARCH_PAPER,
      title: 'تكييف المسؤولية المدنية عن أخطاء الذكاء الاصطناعي',
      body:
        'دراسة تأصيلية مقارنة في ضوء أحكام المسؤولية عن الفعل الضار ومسؤولية حارس الأشياء والآلات الميكانيكية وفق المواد (138) و(161) من نظام المعاملات المدنية السعودي الصادر بالمرسوم الملكي رقم (م/191) وتاريخ 29/11/1444هـ. تخلص الورقة إلى قيام مسؤولية مشغل المنظومة الذكية ومطورها على أساس السيطرة الفعلية وواجب العناية المشدد.',
      tags: [
        'الذكاء الاصطناعي',
        'المسؤولية التقصيرية',
        'نظام المعاملات المدنية',
        'المادة 138',
        'حراسة الأشياء',
      ],
      isPublic: true,
    },
  })

  // Research Summary 2: "بطلان إجراءات القبض والتفتيش في النظام الإجرائي"
  await prisma.knowledgeResearchItem.upsert({
    where: { id: 'know-maqar-criminal-procedure-nullity-02' },
    update: {
      authorId: studentResearcher.id,
      orgId: orgAcademic.id,
      category: KnowledgeCategory.LEGAL_PRECEDENT,
      title: 'بطلان إجراءات القبض والتفتيش في النظام الإجرائي',
      body:
        'تحليل تطبيقي لضمانات المتهم وأثر انتفاء حالة التلبس أو بطلان إذن التفتيش وفق المواد (30، 33، 40، 187) من نظام الإجراءات الجزائية السعودي الصادر بالمرسوم الملكي رقم (م/2) وتاريخ 22/01/1435هـ، وتطبيق قاعدة (ما بُني على باطل فهو باطل) على الأدلة المستمدة من الإجراء الباطل أمام المحاكم الجزائية.',
      tags: [
        'نظام الإجراءات الجزائية',
        'القبض والتفتيش',
        'التلبس بالجريمة',
        'بطلان الدليل',
        'المادة 187',
      ],
      isPublic: true,
    },
    create: {
      id: 'know-maqar-criminal-procedure-nullity-02',
      authorId: studentResearcher.id,
      orgId: orgAcademic.id,
      category: KnowledgeCategory.LEGAL_PRECEDENT,
      title: 'بطلان إجراءات القبض والتفتيش في النظام الإجرائي',
      body:
        'تحليل تطبيقي لضمانات المتهم وأثر انتفاء حالة التلبس أو بطلان إذن التفتيش وفق المواد (30، 33، 40، 187) من نظام الإجراءات الجزائية السعودي الصادر بالمرسوم الملكي رقم (م/2) وتاريخ 22/01/1435هـ، وتطبيق قاعدة (ما بُني على باطل فهو باطل) على الأدلة المستمدة من الإجراء الباطل أمام المحاكم الجزائية.',
      tags: [
        'نظام الإجراءات الجزائية',
        'القبض والتفتيش',
        'التلبس بالجريمة',
        'بطلان الدليل',
        'المادة 187',
      ],
      isPublic: true,
    },
  })

  console.log('✅ [Maqar Seed] Completed idempotent multi-tenant seeding:')
  console.log(`   • Tenant 1: ${orgCorp.name} (${orgCorp.slug}) -> 1 Admin, 2 CLM Contracts, 1 PDPL Compliance Item`)
  console.log(`   • Tenant 2: ${orgLawFirm.name} (${orgLawFirm.slug}) -> 1 Managing Partner, 1 Associate, 2 Cases + Sessions`)
  console.log(`   • Tenant 3: ${orgAcademic.name} (${orgAcademic.slug}) -> 1 Researcher, 2 Published Research Summaries`)
}

seedMaqarMultiTenantPlatform()
  .catch((error) => {
    console.error('❌ [Maqar Seed] Fatal error during seeding:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

