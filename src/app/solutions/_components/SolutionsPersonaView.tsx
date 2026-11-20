'use client'

import Link from 'next/link'
import { LandingHeader } from '@/app/_landing/LandingHeader'
import { LandingFooter } from '@/app/_landing/LandingFooter'
import { Button } from '@/components/ui/button'
import {
  Building2,
  Briefcase,
  GraduationCap,
  ArrowLeft,
  ShieldCheck,
  FileCheck2,
  GitPullRequest,
  Scale,
  CalendarClock,
  Gavel,
  Users,
  BookOpen,
  Search,
  Sparkles,
  BrainCircuit,
  CheckCircle2,
  Lock,
  BellRing,
  Receipt,
} from 'lucide-react'

export type PersonaSolutionKey = 'enterprise' | 'firms' | 'academy'

interface FeatureCardSpec {
  title: string
  subtitle: string
  description: string
  badge: string
  metrics: string
  icon: typeof Building2
}

interface PersonaSolutionConfig {
  key: PersonaSolutionKey
  route: string
  tabLabel: string
  englishLabel: string
  badgeText: string
  headline: string
  highlight: string
  description: string
  onboardingCta: string
  dashboardPreviewHref: string
  dashboardPreviewLabel: string
  icon: typeof Building2
  pillarsSummary: string[]
  features: FeatureCardSpec[]
}

export const PERSONA_SOLUTIONS: Record<PersonaSolutionKey, PersonaSolutionConfig> = {
  enterprise: {
    key: 'enterprise',
    route: '/solutions/enterprise',
    tabLabel: 'الشركات والمنشآت (CLM)',
    englishLabel: 'Companies & Enterprise Legal',
    badgeText: 'حلول الإدارات القانونية والشركات — Enterprise CLM',
    headline: 'إدارة دورة حياة العقود والحوكمة المؤسسية',
    highlight: 'من المسودة الأولى حتى الاعتماد والتجديد',
    description:
      'صُمم «مقر» للإدارات القانونية في الشركات والمنشآت السعودية لأتمتة دورة حياة العقود (CLM)، فحص المخاطر التعاقدية فورياً، وضبط مصفوفة الصلاحيات والاعتمادات والامتثال النظامي.',
    onboardingCta: 'ابدأ الآن — تهيئة مقر الشركات',
    dashboardPreviewHref: '/dashboard/corporate',
    dashboardPreviewLabel: 'معاينة لوحة العقود المؤسسية (CLM)',
    icon: Building2,
    pillarsSummary: [
      'إدارة دورة حياة العقود (CLM) بالكامل',
      'مصفوفة صلاحيات واعتمادات متعددة المستويات',
      'كشف تلقائي لمخاطر البنود ضد نظام المعاملات المدنية',
      'توطين كامل للبيانات وتكامل الدخول الموحد (SSO)',
    ],
    features: [
      {
        title: 'إدارة دورة حياة العقود الشاملة (Enterprise CLM)',
        subtitle: 'Contract Lifecycle Management',
        description:
          'إدارة مركزية لكافة عقود التوريد، المقاولات، التشغيل، والاتفاقيات الإطارية من مرحلة الطلب والصياغة والمراجعة وحتى التوقيع والأرشفة.',
        badge: 'CLM أساسي',
        metrics: 'تقليص زمن دورة اعتماد العقد بنسبة 65%',
        icon: FileCheck2,
      },
      {
        title: 'محرك تقييم المخاطر التعاقدية الآلي',
        subtitle: 'Automated Risk Scoring',
        description:
          'فحص آلي لبنود المسؤولية غير المحدودة، الفسخ بالإرادة المنفردة، الشرط الجزائي (م/179 معاملات مدنية)، واختصاص التحكيم قبل التوقيع.',
        badge: 'فحص نظامي',
        metrics: 'رصد فوري للبنود عالية المخاطر',
        icon: Scale,
      },
      {
        title: 'مصفوفة الصلاحيات وسير الاعتمادات',
        subtitle: 'Multi-Stage Approval Workflows',
        description:
          'ربط العقود بمسارات موافقات متدرجة بين الإدارة القانونية، المالية، والمشتريات والإدارة التنفيذية مع سجل تدقيق غير قابل للتعديل.',
        badge: 'حوكمة',
        metrics: 'حوكمة صلاحيات الاعتماد 100%',
        icon: GitPullRequest,
      },
      {
        title: 'رادار الالتزامات وتنبيهات التجديد التلقائي',
        subtitle: 'Obligations & Renewal Radar',
        description:
          'تتبع مهل الإشعار المسبق، شروط التجديد التلقائي، والضمانات البنكية والدفعات المالية لمنع الغرامات أو التجديد غير المقصود.',
        badge: 'تنبيهات استباقية',
        metrics: 'إشعارات آلية قبل 90 / 60 / 30 يوماً',
        icon: BellRing,
      },
      {
        title: 'سجل الحوكمة والامتثال المؤسسي (PDPL & الشركات)',
        subtitle: 'Corporate Governance & Compliance',
        description:
          'متابعة التزامات نظام الشركات السعودي الجديد ونظام حماية البيانات الشخصية (PDPL) وسجلات القرارات ومواثيق اللجان.',
        badge: 'امتثال',
        metrics: 'توافق كامل مع ضوابط سدايا ووزارة التجارة',
        icon: ShieldCheck,
      },
      {
        title: 'الدخول الموحد للمنشآت وعزل المستأجرين',
        subtitle: 'Enterprise SSO & Tenant Isolation',
        description:
          'تكامل مع الهوية المؤسسية الموحدة (SAML 2.0 / OIDC) وعزل كامل لبيانات المنشأة بتشفير AES-256 داخل المملكة.',
        badge: 'أمان مؤسسي',
        metrics: 'معايير أمان NCA CCC & PDPL',
        icon: Lock,
      },
    ],
  },
  firms: {
    key: 'firms',
    route: '/solutions/firms',
    tabLabel: 'مكاتب المحاماة (Firms)',
    englishLabel: 'Law Firms & Legal Practice',
    badgeText: 'حلول مكاتب وشركات المحاماة — Court & Practice Management',
    headline: 'إدارة القضايا والمحاكم والمرافعات وبوابة الموكلين',
    highlight: 'دقة إجرائية وحماية للمواعيد النظامية',
    description:
      'يمكّن «مقر» مكاتب وشركات المحاماة والممارسين المستقلين من إدارة القضايا والجلسات القضائية، حساب المهل النظامية للاعتراض والاستئناف، صياغة اللوائح، والتواصل الآمن مع الموكلين.',
    onboardingCta: 'ابدأ الآن — تهيئة مقر المحاماة',
    dashboardPreviewHref: '/dashboard/practice',
    dashboardPreviewLabel: 'معاينة منضدة القضايا والمرافعات',
    icon: Briefcase,
    pillarsSummary: [
      'إدارة القضايا والجلسات والمحاكم (Court Management)',
      'حاسبة المهل والمواعيد النظامية القضائية',
      'منضدة صياغة اللوائح والمذكرات الجوابية',
      'بوابة الموكلين السيادية والفوترة وإدارة الفريق',
    ],
    features: [
      {
        title: 'إدارة القضايا والجلسات والمحاكم (Court Management)',
        subtitle: 'Litigation & Hearing Management',
        description:
          'متابعة شاملة لملفات القضايا أمام المحاكم التجارية، العمالية، والعامة، مع جدولة الجلسات وتوثيق محاضرها ومرفقاتها في ملف قضية موحد.',
        badge: 'إدارة المحاكم',
        metrics: 'تنظيم كامل لمسار القضية من القيد حتى التنفيذ',
        icon: Gavel,
      },
      {
        title: 'حاسبة المواعيد الإجرائية والمهل النظامية',
        subtitle: 'Statutory Deadline Calculator',
        description:
          'حساب دقيق لمواعيد الاعتراض والاستئناف والنقض (30 يوماً للأحكام العادية و10 أيام للمستعجلة وفق المادة 187 مرافعات شرعية) مع تنبيهات متدرجة.',
        badge: 'حاسبة المهل',
        metrics: 'تنبيهات T-7 أيام و T-3 أيام و T-24 ساعة',
        icon: CalendarClock,
      },
      {
        title: 'منضدة صياغة اللوائح والمذكرات القضائية',
        subtitle: 'Pleading & Brief Workbench',
        description:
          'صياغة صحف الدعاوى والمذكرات الجوابية والاعتراضية مدعومة بالأسانيد النظامية والسوابق القضائية مع تدقيق آلي للدفوع الشكلية والموضوعية.',
        badge: 'صياغة قضائية',
        metrics: 'إسناد نظامي موثق لكل دفع وطلب',
        icon: Scale,
      },
      {
        title: 'بوابة الموكلين السيادية المشفرة',
        subtitle: 'Sovereign Client Portal',
        description:
          'مشاركة مستجدات القضية، المستندات، وطلبات الاعتماد مع الموكل عبر روابط مشفرة ومؤقتة دون الحاجة لتعقيد كلمات المرور.',
        badge: 'تجربة الموكل',
        metrics: 'روابط مشفرة بصلاحية محددة وسجل وصول',
        icon: ShieldCheck,
      },
      {
        title: 'إدارة فريق المكتب وتوزيع المهام والصلاحيات (RBAC)',
        subtitle: 'Team Assignments & RBAC',
        description:
          'توزيع القضايا والمهام بين الشركاء والمحامين والمتدربين مع حماية القضايا السرية بصلاحيات وصول دقيقة لكل عضو.',
        badge: 'إدارة الفريق',
        metrics: 'عزل القضايا السرية وتفويض المهام',
        icon: Users,
      },
      {
        title: 'إدارة الأتعاب والفوترة وتقارير الشركاء',
        subtitle: 'Legal Billing & Partner Analytics',
        description:
          'تتبع ساعات العمل القانوني، إصدار مسودات الفواتير الضريبية، ومتابعة التحصيل والأداء المالي للمكتب.',
        badge: 'الفوترة والأتعاب',
        metrics: 'ربط الساعات القابلة للفوترة بملف كل قضية',
        icon: Receipt,
      },
    ],
  },
  academy: {
    key: 'academy',
    route: '/solutions/academy',
    tabLabel: 'الأكاديمية والطلاب (Academy)',
    englishLabel: 'Academics & Law Students',
    badgeText: 'حلول الباحثين وطلاب كليات القانون — Precedent Bank & Legal Lab',
    headline: 'بنك السوابق القضائية ومختبر البحث والصياغة الأكاديمي',
    highlight: 'تأهيل مهني وبحثي مستند إلى الأنظمة السعودية',
    description:
      'يوفر «مقر» لطلاب كليات القانون والباحثين والمتدربين بنكاً شاملاً للسوابق القضائية والأنظمة السعودية، مع محرك بحث دلالي موثق بالحواشي ومحاكي صياغة تدريبي تفاعلي.',
    onboardingCta: 'ابدأ الآن — تهيئة المقر الأكاديمي',
    dashboardPreviewHref: '/dashboard/academy',
    dashboardPreviewLabel: 'معاينة المختبر الأكاديمي وبنك السوابق',
    icon: GraduationCap,
    pillarsSummary: [
      'بنك السوابق القضائية والمبادئ النظامية (Precedent Bank)',
      'محرك البحث الدلالي الموثق في الأنظمة السعودية',
      'محاكي الصياغة القضائية التفاعلي للطلاب والمتدربين',
      'بطاقات الاستذكار بالتكرار المتباعد واختبارات SBA',
    ],
    features: [
      {
        title: 'بنك السوابق القضائية والمبادئ النظامية (Precedent Bank)',
        subtitle: 'Saudi Judicial Precedent Bank',
        description:
          'مكتبة مصنفة لمبادئ المحكمة العليا والأحكام التجارية والعمالية والمدنية مع تلخيص الوقائع والأسباب والمنطوق والقاعدة النظامية المستخلصة.',
        badge: 'بنك السوابق',
        metrics: 'بحث موضوعي بالمبدأ القضائي ورقم المادة',
        icon: BookOpen,
      },
      {
        title: 'محرك البحث الدلالي في الأنظمة السعودية (Statutory RAG)',
        subtitle: 'Grounded Legal Semantic Search',
        description:
          'بحث دلالي هجين في نظام المعاملات المدنية ونظام العمل ونظام الشركات ونظام الإثبات مع استشهاد حرفي موثق برقم المادة والمرسوم الملكي.',
        badge: 'بحث دلالي موثق',
        metrics: 'توثيق أكاديمي بالحواشي والمصادر الرسمية',
        icon: Search,
      },
      {
        title: 'محاكي الصياغة القانونية والقضائية التفاعلي',
        subtitle: 'Interactive Legal Drafting Simulator',
        description:
          'تدرّب عملياً على صياغة البنود التعاقدية وصحف الدعاوى مع تقييم فوري يوضح أوجه القصور النظامية ويقترح الصياغة النموذجية.',
        badge: 'محاكي الصياغة',
        metrics: 'تصحيح فوري مع شرح المرجع النظامي',
        icon: Sparkles,
      },
      {
        title: 'نظام الاستذكار بالتكرار المتباعد وبنك أسئلة (SBA)',
        subtitle: 'Spaced Repetition & SBA Prep',
        description:
          'بطاقات استذكار ذكية للمصطلحات والقواعد الفقهية والنظامية مع بنك أسئلة تدريبي لاختبار الاعتماد المهني للهيئة السعودية للمحامين.',
        badge: 'تأهيل مهني',
        metrics: 'تغطية شاملة لمحاور المعاملات والمرافعات والإثبات',
        icon: BrainCircuit,
      },
      {
        title: 'إدارة المقررات والمشاريع البحثية القانونية',
        subtitle: 'Academic Course & Casebook Manager',
        description:
          'تنظيم المقررات الجامعية، تلخيص القضايا الدراسية (Case Briefs)، ومتابعة مواعيد تسليم الأبحاث والعيادات القانونية.',
        badge: 'إدارة أكاديمية',
        metrics: 'حفظ وتصدير الملخصات والأوراق البحثية',
        icon: FileCheck2,
      },
      {
        title: 'تفعيل مجاني فوري بالبريد الجامعي السعودي (.edu.sa)',
        subtitle: 'Verified Academic Access',
        description:
          'وصول مجاني لطلاب وباحثي الجامعات السعودية المعتمدة لدعم التأهيل القانوني التطبيقي وبناء المهارات العملية قبل التخرج.',
        badge: 'دعم الجامعات',
        metrics: 'مجاني بالكامل لحاملي البريد الجامعي (.edu.sa)',
        icon: GraduationCap,
      },
    ],
  },
}

export function SolutionsPersonaView({ activePersona }: { activePersona: PersonaSolutionKey }) {
  const current = PERSONA_SOLUTIONS[activePersona]
  const CurrentIcon = current.icon

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <Link href="/solutions" className="hover:text-[#1F7A46]">الحلول</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">{current.tabLabel}</span>
        </div>

        {/* Dedicated Persona Navigation Tabs (/solutions/enterprise, /solutions/firms, /solutions/academy) */}
        <nav
          aria-label="تبويبات حلول مقر حسب القطاع"
          className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-white p-2 rounded-2xl border border-[#CCD8CE] shadow-2xs"
        >
          {(Object.values(PERSONA_SOLUTIONS) as PersonaSolutionConfig[]).map((item) => {
            const TabIcon = item.icon
            const isActive = item.key === activePersona
            return (
              <Link
                key={item.key}
                href={item.route}
                data-testid={`solution-tab-${item.key}`}
                className={`flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-[#1F7A46] text-white shadow-xs'
                    : 'text-[#1B281F] hover:bg-[#E8EFE9] hover:text-[#1F7A46]'
                }`}
              >
                <TabIcon className="w-4 h-4 shrink-0" />
                <span>{item.tabLabel}</span>
              </Link>
            )
          })}
        </nav>

        {/* Persona Hero Banner */}
        <section className="bg-white rounded-3xl border border-[#CCD8CE] p-7 sm:p-10 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
              <CurrentIcon className="w-4 h-4" />
              <span>{current.badgeText}</span>
            </div>
            <span className="text-xs font-mono text-[#566A5C]">{current.englishLabel}</span>
          </div>

          <div className="space-y-3 max-w-3xl">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#1B281F] font-heading leading-tight">
              {current.headline} —{' '}
              <span className="text-[#1F7A46]">{current.highlight}</span>
            </h1>
            <p className="text-sm sm:text-base text-[#4A5D50] leading-relaxed">
              {current.description}
            </p>
          </div>

          {/* Key Pillars Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {current.pillarsSummary.map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#1B281F] bg-[#F5F7F5] px-3.5 py-2.5 rounded-xl border border-[#CCD8CE]"
              >
                <CheckCircle2 className="w-4 h-4 text-[#1F7A46] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Primary CTA Routing Directly to /onboarding */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link href="/onboarding" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto h-12 px-7 bg-[#1F7A46] hover:bg-[#165832] text-white text-sm sm:text-base font-bold shadow-xs cursor-pointer"
              >
                <span>{current.onboardingCta}</span>
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </Link>
            <Link href={current.dashboardPreviewHref} className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto h-12 px-6 border-[#CCD8CE] bg-white hover:bg-[#E8EFE9] text-[#1B281F] text-sm font-semibold cursor-pointer"
              >
                <span>{current.dashboardPreviewLabel}</span>
              </Button>
            </Link>
          </div>
        </section>

        {/* Persona-Tailored Feature Cards Grid */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#1B281F] font-heading">
                القدرات والمزايا التخصصية — {current.tabLabel}
              </h2>
              <p className="text-xs sm:text-sm text-[#4A5D50] mt-1">
                أدوات مصممة خصيصاً لتلبية الاحتياجات اليومية والامتثال النظامي في المملكة العربية السعودية
              </p>
            </div>
            <Link href="/pricing" className="text-xs font-bold text-[#1F7A46] hover:underline">
              قارن الباقات والأسعار ←
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {current.features.map((feat) => {
              const FeatIcon = feat.icon
              return (
                <article
                  key={feat.title}
                  className="bg-white rounded-2xl border border-[#CCD8CE] p-6 flex flex-col justify-between shadow-xs hover:border-[#1F7A46] transition-all"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[#E8EFE9] text-[#1F7A46] flex items-center justify-center">
                        <FeatIcon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8EFE9] text-[#1F7A46] border border-[#CCD8CE]">
                        {feat.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#1B281F] font-heading leading-snug">
                        {feat.title}
                      </h3>
                      <p className="text-[11px] font-mono text-[#566A5C] mt-0.5">{feat.subtitle}</p>
                    </div>

                    <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  <div className="pt-3.5 mt-4 border-t border-[#CCD8CE] flex items-center justify-between text-[11px] font-semibold text-[#1F7A46]">
                    <span>{feat.metrics}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        {/* Bottom CTA Card */}
        <section className="bg-[#E8EFE9] rounded-3xl border border-[#CCD8CE] p-8 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-[#1B281F] font-heading">
            جاهز لتفعيل «مقر» في بيئة عملك؟
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5D50] max-w-xl mx-auto">
            اختر مسارك المهني الآن وابدأ العمل فوراً في المقر الرقمي للعمليات القانونية والحوكمة.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <Link href="/onboarding">
              <Button className="bg-[#1F7A46] hover:bg-[#165832] text-white font-bold h-11 px-7 text-xs sm:text-sm cursor-pointer">
                ابدأ الآن <ArrowLeft className="w-4 h-4 mr-1.5" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                variant="outline"
                className="bg-white border-[#CCD8CE] text-[#1B281F] hover:bg-[#F5F7F5] font-bold h-11 px-6 text-xs sm:text-sm cursor-pointer"
              >
                عرض الأسعار والباقات
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
