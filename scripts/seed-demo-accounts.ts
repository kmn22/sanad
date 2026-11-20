/**
 * ============================================================================
 * MAQAR (مقر) — Master Demo Accounts Provisioning Seed Script
 * ============================================================================
 * Creates a complete suite of demo accounts covering every platform persona:
 * 1. Super Admin (مدير النظام والمنصة العام)
 * 2. Enterprise Legal & Governance Director (مدير الإدارة القانونية والحوكمة بالشركات)
 * 3. Law Firm Managing Partner (الشريك المدير لمكتب المحاماة)
 * 4. Litigation Associate Lawyer (محامي استئناف وترافع بمكتب المحاماة)
 * 5. Solo Lawyer (محامٍ مستقل)
 * 6. Client Representative (بوابة الموكل / عميل المنشأة)
 * 7. Law Student & Legal Scholar (طالب وباحث قانوني)
 *
 * Password for all demo accounts: MaqarDemo2026!
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
} from '@prisma/client'
import { hashPassword } from '../src/lib/auth/password'
import { PRIVACY_NOTICE_VERSION } from '../src/lib/privacy-version'

const prisma = new PrismaClient()
const DEMO_PASSWORD = 'MaqarDemo2026!'
const hashedPassword = hashPassword(DEMO_PASSWORD)
const now = new Date()

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

async function main() {
  console.log('🚀 Starting MAQAR Master Demo Accounts Provisioning...')

  // ==========================================================================
  // 1. ORGANIZATIONS SETUP
  // ==========================================================================

  // A. Enterprise Org
  const orgEnterprise = await prisma.organization.upsert({
    where: { id: 'org-maqar-national-tech' },
    update: {
      name: 'الشركة الوطنية للتقنية والاتصالات',
      type: OrganizationType.ENTERPRISE_CORP,
      tier: SubscriptionTier.ENTERPRISE,
      isActive: true,
    },
    create: {
      id: 'org-maqar-national-tech',
      name: 'الشركة الوطنية للتقنية والاتصالات',
      slug: 'national-tech-corp',
      type: OrganizationType.ENTERPRISE_CORP,
      tier: SubscriptionTier.ENTERPRISE,
      isActive: true,
    },
  })

  const wsEnterprise = await prisma.workspace.upsert({
    where: { id: 'ws-maqar-national-tech-clm' },
    update: {
      name: 'الإدارة القانونية وحوكمة العقود والامتثال — الشركة الوطنية للتقنية',
      type: 'corporate_clm',
      status: 'active',
      onboardingStatus: 'completed',
    },
    create: {
      id: 'ws-maqar-national-tech-clm',
      orgId: orgEnterprise.id,
      name: 'الإدارة القانونية وحوكمة العقود والامتثال — الشركة الوطنية للتقنية',
      type: 'corporate_clm',
      status: 'active',
      onboardingStatus: 'completed',
      settings: {
        persona: 'ENTERPRISE_CORP',
        commercialRegistrationNumber: '1010894521',
        industry: 'الاتصالات وتقنية المعلومات والذكاء الاصطناعي',
        companySize: '251-1000',
        onboardedAt: now.toISOString(),
      },
    },
  })

  // B. Law Firm Org
  const orgLawFirm = await prisma.organization.upsert({
    where: { id: 'org-maqar-khaled-lawfirm' },
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
      name: 'قطاع التقاضي والمنازعات التجارية والعمالية — شركة خالد وشركاؤه',
      type: 'firm',
      status: 'active',
      onboardingStatus: 'completed',
    },
    create: {
      id: 'ws-maqar-khaled-litigation',
      orgId: orgLawFirm.id,
      name: 'قطاع التقاضي والمنازعات التجارية والعمالية — شركة خالد وشركاؤه',
      type: 'firm',
      status: 'active',
      onboardingStatus: 'completed',
      settings: {
        persona: 'LAW_FIRM',
        barLicenseNumber: '44098217',
        cityRegion: 'الرياض',
        teamCapacity: 'MIDSIZE_16_50',
        onboardedAt: now.toISOString(),
      },
    },
  })

  // C. Solo Practice Org & Workspace
  const orgSolo = await prisma.organization.upsert({
    where: { id: 'org-maqar-solo-practice' },
    update: {
      name: 'مكتب المحامي المستقل للاستشارات الشرعية والقانونية',
      type: OrganizationType.LAW_FIRM,
      tier: SubscriptionTier.STARTER,
      isActive: true,
    },
    create: {
      id: 'org-maqar-solo-practice',
      name: 'مكتب المحامي المستقل للاستشارات الشرعية والقانونية',
      slug: 'solo-lawyer-practice',
      type: OrganizationType.LAW_FIRM,
      tier: SubscriptionTier.STARTER,
      isActive: true,
    },
  })

  const wsSolo = await prisma.workspace.upsert({
    where: { id: 'ws-maqar-solo-practice' },
    update: {
      name: 'مكتب المحامي عبدالله السليمان المستقل',
      type: 'solo',
      status: 'active',
      onboardingStatus: 'completed',
    },
    create: {
      id: 'ws-maqar-solo-practice',
      orgId: orgSolo.id,
      name: 'مكتب المحامي عبدالله السليمان المستقل',
      type: 'solo',
      status: 'active',
      onboardingStatus: 'completed',
      settings: {
        persona: 'LAW_FIRM',
        barLicenseNumber: '42109844',
        cityRegion: 'الرياض',
        teamCapacity: 'SOLO_1_3',
        onboardedAt: now.toISOString(),
      },
    },
  })

  // D. Academic Institution Org
  const orgAcademic = await prisma.organization.upsert({
    where: { id: 'org-maqar-academic-hub' },
    update: {
      name: 'جامعة الملك سعود — كلية الحقوق والعلوم السياسية',
      type: OrganizationType.ACADEMIC_INSTITUTION,
      tier: SubscriptionTier.STARTER,
      isActive: true,
    },
    create: {
      id: 'org-maqar-academic-hub',
      name: 'جامعة الملك سعود — كلية الحقوق والعلوم السياسية',
      slug: 'ksu-law-faculty',
      type: OrganizationType.ACADEMIC_INSTITUTION,
      tier: SubscriptionTier.STARTER,
      isActive: true,
    },
  })

  const wsAcademic = await prisma.workspace.upsert({
    where: { id: 'ws-maqar-academic-lab' },
    update: {
      name: 'مختبر الأبحاث القانونية والعيادة القضائية — كلية الحقوق',
      type: 'academic',
      status: 'active',
      onboardingStatus: 'completed',
    },
    create: {
      id: 'ws-maqar-academic-lab',
      orgId: orgAcademic.id,
      name: 'مختبر الأبحاث القانونية والعيادة القضائية — كلية الحقوق',
      type: 'academic',
      status: 'active',
      onboardingStatus: 'completed',
      settings: {
        persona: 'LAW_STUDENT',
        universityCollege: 'جامعة الملك سعود',
        academicLevel: 'UNDERGRADUATE_Y3_Y4',
        areasOfInterest: ['نظام المعاملات المدنية', 'حماية البيانات الشخصية والذكاء الاصطناعي', 'التحكيم التجاري'],
        onboardedAt: now.toISOString(),
      },
    },
  })

  // E. Legacy / Client Practice Org & Workspace
  const orgClient = await prisma.organization.upsert({
    where: { id: 'org-legacy-migrated-practice' },
    update: {
      name: 'المقر الرقمي للمحاماة والأعمال',
      type: OrganizationType.LAW_FIRM,
      tier: SubscriptionTier.PROFESSIONAL,
      isActive: true,
    },
    create: {
      id: 'org-legacy-migrated-practice',
      name: 'المقر الرقمي للمحاماة والأعمال',
      slug: 'legacy-migrated-practice',
      type: OrganizationType.LAW_FIRM,
      tier: SubscriptionTier.PROFESSIONAL,
      isActive: true,
    },
  })

  const wsClient = await prisma.workspace.upsert({
    where: { id: 'legacy_9e5abca8bc4d627a' },
    update: {
      name: 'مساحة العمل القانونية المشتركة',
      type: 'firm',
      status: 'active',
      onboardingStatus: 'completed',
    },
    create: {
      id: 'legacy_9e5abca8bc4d627a',
      orgId: orgClient.id,
      name: 'مساحة العمل القانونية المشتركة',
      type: 'firm',
      status: 'active',
      onboardingStatus: 'completed',
    },
  })

  // Find or create representative client
  let demoClientEntity = await prisma.client.findFirst({
    where: {
      workspaceId: wsClient.id,
      company: { contains: 'الفيصلية' },
    },
  })

  if (!demoClientEntity) {
    demoClientEntity = await prisma.client.create({
      data: {
        id: 'client-demo-faisaliah-ent',
        workspaceId: wsClient.id,
        name: 'مجموعة الفيصلية القابضة',
        company: 'مجموعة الفيصلية القابضة',
        type: 'corporate',
        email: 'legal@faisaliah.sa',
        phone: '+966112345001',
        nationalId: '1010234567',
        address: 'الرياض، طريق الملك فهد',
        notes: 'عميل استراتيجي — نزاعات تجارية وعقود توريد',
      },
    })
  }

  // ==========================================================================
  // 2. DEMO ACCOUNTS SEEDING
  // ==========================================================================

  const demoAccounts = [
    // 1. Super Admin
    {
      id: 'user-demo-admin',
      email: 'demo.admin@maqar.sa',
      name: 'م. سلطان الشمري (مدير المنصة العام)',
      fullName: 'م. سلطان الشمري (مدير العمليات وحوكمة المنصة)',
      role: 'admin',
      userType: UserType.CORPORATE_COUNSEL,
      orgId: orgEnterprise.id,
      workspaceId: wsEnterprise.id,
      membershipRole: MembershipRole.SUPER_ADMIN,
      isOwner: true,
      accountType: 'firm',
      clientId: null,
      permissions: {
        'admin:super': true,
        'tenants:manage': true,
        'system:status': true,
        'logs:audit': true,
        'clm:all': true,
      },
    },
    // 2. Enterprise / SME Counsel
    {
      id: 'user-demo-corporate',
      email: 'demo.corporate@maqar.sa',
      name: 'المستشار تركي العتيبي (مدير الشؤون القانونية)',
      fullName: 'المستشار تركي بن فيصل العتيبي (مدير الإدارة القانونية والحوكمة)',
      role: 'admin',
      userType: UserType.CORPORATE_COUNSEL,
      orgId: orgEnterprise.id,
      workspaceId: wsEnterprise.id,
      membershipRole: MembershipRole.SUPER_ADMIN,
      isOwner: true,
      accountType: 'firm',
      clientId: null,
      permissions: {
        'clm:create': true,
        'clm:approve': true,
        'clm:sign_dispatch': true,
        'grc:audit': true,
        'board:resolutions': true,
        'firms:manage': true,
      },
    },
    // 3. Law Firm Managing Partner
    {
      id: 'user-demo-partner',
      email: 'demo.partner@maqar.sa',
      name: 'المحامي الشريك / خالد بن عبدالعزيز الفهد',
      fullName: 'المحامي الشريك / خالد بن عبدالعزيز الفهد (الشريك المدير)',
      role: 'workspace_owner',
      userType: UserType.ATTORNEY,
      orgId: orgLawFirm.id,
      workspaceId: wsLawFirm.id,
      membershipRole: MembershipRole.MANAGING_PARTNER,
      isOwner: true,
      accountType: 'firm',
      clientId: null,
      permissions: {
        'cases:all': true,
        'hearings:schedule': true,
        'briefs:draft': true,
        'zatca:invoicing': true,
        'team:manage': true,
      },
    },
    // 4. Associate Litigation Lawyer
    {
      id: 'user-demo-lawyer',
      email: 'demo.lawyer@maqar.sa',
      name: 'المحامي الممارس / فيصل بن تركي القحطاني',
      fullName: 'المحامي فيصل بن تركي القحطاني (محامي استئناف وترافع)',
      role: 'lawyer',
      userType: UserType.ATTORNEY,
      orgId: orgLawFirm.id,
      workspaceId: wsLawFirm.id,
      membershipRole: MembershipRole.ASSOCIATE,
      isOwner: false,
      accountType: 'lawyer',
      clientId: null,
      permissions: {
        'cases:read_write': true,
        'briefs:draft': true,
        'deadlines:calculate': true,
        'hearings:view': true,
      },
    },
    // 5. Solo Lawyer
    {
      id: 'user-demo-solo',
      email: 'demo.solo@maqar.sa',
      name: 'المحامي المستقل / عبدالله بن إبراهيم السليمان',
      fullName: 'المحامي عبدالله بن إبراهيم السليمان (محامٍ وموثق مستقل)',
      role: 'workspace_owner',
      userType: UserType.ATTORNEY,
      orgId: orgSolo.id,
      workspaceId: wsSolo.id,
      membershipRole: MembershipRole.MANAGING_PARTNER,
      isOwner: true,
      accountType: 'lawyer',
      clientId: null,
      permissions: {
        'cases:all': true,
        'briefs:draft': true,
        'zatca:invoicing': true,
        'deadlines:calculate': true,
      },
    },
    // 6. Client Portal User
    {
      id: 'user-demo-client',
      email: 'demo.client@maqar.sa',
      name: 'أ. فهد السليمان (ممثل مجموعة الفيصلية)',
      fullName: 'أ. فهد بن عبدالعزيز السليمان (المدير التنفيذي لمجموعة الفيصلية)',
      role: 'client',
      userType: UserType.CLIENT,
      orgId: orgClient.id,
      workspaceId: wsClient.id,
      membershipRole: MembershipRole.VIEWER_CLIENT,
      isOwner: false,
      accountType: 'client',
      clientId: demoClientEntity.id,
      permissions: {
        'portal:view_cases': true,
        'portal:view_invoices': true,
        'portal:upload_docs': true,
      },
    },
    // 7. Law Student & Legal Researcher
    {
      id: 'user-demo-student',
      email: 'demo.student@maqar.sa',
      name: 'الباحث القانوني / نواف بن عبدالرحمن السديري',
      fullName: 'الباحث نواف بن عبدالرحمن السديري (طالب شريعة وقانون)',
      role: 'student',
      userType: UserType.LAW_STUDENT,
      orgId: orgAcademic.id,
      workspaceId: wsAcademic.id,
      membershipRole: MembershipRole.TRAINEE_STUDENT,
      isOwner: false,
      accountType: 'student',
      clientId: null,
      permissions: {
        'research:precedents': true,
        'simulator:drafting': true,
        'moot:pleadings': true,
      },
    },
  ]

  for (const acc of demoAccounts) {
    const user = await prisma.user.upsert({
      where: { email: acc.email },
      update: {
        name: acc.name,
        fullName: acc.fullName,
        password: hashedPassword,
        role: acc.role,
        userType: acc.userType,
        orgId: acc.orgId,
        workspaceId: acc.workspaceId,
        clientId: acc.clientId,
        accountType: acc.accountType,
        mfaEnabled: false,
        emailVerified: now,
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        betaTermsAcceptedAt: now,
        failedLoginAttempts: 0,
        lockedUntil: null,
        disabledAt: null,
      },
      create: {
        id: acc.id,
        email: acc.email,
        name: acc.name,
        fullName: acc.fullName,
        password: hashedPassword,
        role: acc.role,
        userType: acc.userType,
        orgId: acc.orgId,
        workspaceId: acc.workspaceId,
        clientId: acc.clientId,
        accountType: acc.accountType,
        mfaEnabled: false,
        emailVerified: now,
        privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
        betaTermsAcceptedAt: now,
        failedLoginAttempts: 0,
      },
    })

    // Upsert Organization Membership
    await prisma.membership.upsert({
      where: {
        userId_orgId: {
          userId: user.id,
          orgId: acc.orgId,
        },
      },
      update: {
        role: acc.membershipRole,
        permissions: acc.permissions,
        isActive: true,
      },
      create: {
        id: `mem-${acc.id}`,
        userId: user.id,
        orgId: acc.orgId,
        role: acc.membershipRole,
        permissions: acc.permissions,
        isActive: true,
      },
    })

    // Upsert Workspace Membership
    await prisma.workspaceMembership.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: acc.workspaceId,
          userId: user.id,
        },
      },
      update: {
        role: acc.role,
        status: 'active',
        isOwner: acc.isOwner,
      },
      create: {
        workspaceId: acc.workspaceId,
        userId: user.id,
        role: acc.role,
        status: 'active',
        isOwner: acc.isOwner,
      },
    })

    console.log(`✓ Provisioned: ${acc.email} (${acc.name}) -> ${acc.role}`)
  }

  // ==========================================================================
  // 3. SEED SAMPLE DATA FOR SOLO WORKSPACE
  // ==========================================================================
  const soloClient = await prisma.client.upsert({
    where: { id: 'client-demo-solo-01' },
    update: {
      workspaceId: wsSolo.id,
      name: 'مؤسسة إعمار نجد للمقاولات',
      company: 'مؤسسة إعمار نجد للمقاولات',
      type: 'corporate',
    },
    create: {
      id: 'client-demo-solo-01',
      workspaceId: wsSolo.id,
      name: 'مؤسسة إعمار نجد للمقاولات',
      company: 'مؤسسة إعمار نجد للمقاولات',
      type: 'corporate',
      email: 'ceo@emmar-najd.sa',
      phone: '+966555123987',
      nationalId: '1010776655',
      address: 'الرياض، حي الملز',
    },
  })

  await prisma.legalCase.upsert({
    where: { id: 'case-demo-solo-contract-dispute' },
    update: {
      workspaceId: wsSolo.id,
      orgId: orgSolo.id,
      clientName: soloClient.name,
      title: 'نزاع مقاولة وتوريد — إعمار نجد ضد شركة التطوير العقاري',
      caseNumber: '448011293',
      court: 'المحكمة التجارية بالرياض',
      stage: 'قيد الترافع والمرافعة',
      priority: 'high',
      dueDate: addDays(now, 14),
      hearingDate: addDays(now, 4),
    },
    create: {
      id: 'case-demo-solo-contract-dispute',
      workspaceId: wsSolo.id,
      orgId: orgSolo.id,
      clientId: soloClient.id,
      clientName: soloClient.name,
      title: 'نزاع مقاولة وتوريد — إعمار نجد ضد شركة التطوير العقاري',
      caseNumber: '448011293',
      court: 'المحكمة التجارية بالرياض',
      caseType: 'تجاري',
      stage: 'قيد الترافع والمرافعة',
      priority: 'high',
      dueDate: addDays(now, 14),
      hearingDate: addDays(now, 4),
      notes: 'دعوى مطالبة بمستحقات ختامية عن عقد تشييد مجمع سكني ومطالبة بغرامة تأخير غير نظامية.',
    },
  })

  console.log('✅ All Demo Accounts and Sample Workspaces Successfully Provisioned!')
}

main()
  .catch((err) => {
    console.error('❌ Error provisioning demo accounts:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
