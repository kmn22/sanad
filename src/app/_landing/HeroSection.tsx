import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowDown,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Briefcase,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react'

const PILLAR_PROPOSITIONS = [
  {
    id: 'enterprise',
    badge: 'للشركات والمنشآت (Enterprises)',
    title: 'إدارة دورة حياة العقود والحوكمة (CLM)',
    desc: 'تحليل آلي للمخاطر التعاقدية، مصفوفة صلاحيات واعتمادات متعددة المستويات، وسجل التزامات مؤسسي متوافق مع الأنظمة السعودية.',
    href: '/solutions/enterprise',
    cta: 'حلول الشركات',
    icon: Building2,
    highlights: ['فحص مخاطر البنود الآلي', 'مصفوفة الاعتمادات والحوكمة'],
  },
  {
    id: 'firms',
    badge: 'لمكاتب وشركات المحاماة (Law Firms)',
    title: 'إدارة القضايا والمحاكم والمرافعات',
    desc: 'تقويم جلسات المحاكم، حاسبة المواعيد الإجرائية والمهل النظامية، صياغة المذكرات القضائية، وبوابة الموكلين السيادية.',
    href: '/solutions/firms',
    cta: 'حلول مكاتب المحاماة',
    icon: Briefcase,
    highlights: ['حاسبة المهل والمواعيد القضائية', 'بوابة الموكلين وتوزيع المهام'],
  },
  {
    id: 'academy',
    badge: 'للباحثين وطلاب القانون (Students & Academics)',
    title: 'بنك السوابق القضائية والبحث الأكاديمي',
    desc: 'محرك بحث دلالي في الأنظمة السعودية والسوابق القضائية، محاكي الصياغة التفاعلي، وبطاقات الاستذكار بالتكرار المتباعد.',
    href: '/solutions/academy',
    cta: 'حلول الأكاديمية والطلاب',
    icon: GraduationCap,
    highlights: ['بنك السوابق والأنظمة الموثقة', 'محاكي الصياغة والاستذكار الذكي'],
  },
]

export function HeroSection() {
  return (
    <section className="pt-12 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-6 lg:px-8 mx-auto max-w-6xl text-center relative">
      {/* Prominent «مقر» Brand Identity & Tagline Badge */}
      <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1B281F] text-xs sm:text-sm font-bold mb-6 shadow-2xs">
        <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A46] animate-pulse" />
        <span className="text-[#1F7A46] font-black">«مقر»</span>
        <span className="text-[#566A5C]">|</span>
        <span>المقر الرقمي للعمليات القانونية والحوكمة</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1B281F] leading-[1.25] mb-5 font-heading">
        المقر الرقمي للعمليات القانونية والحوكمة — <br />
        <span className="text-[#1F7A46]">
          للشركات ومكاتب المحاماة والباحثين في المملكة
        </span>
      </h1>

      {/* Subtitle Line */}
      <p className="max-w-3xl mx-auto text-base sm:text-lg text-[#4A5D50] leading-relaxed mb-8 font-normal">
        منظومة سيادية موحدة تجمع حوكمة العقود المؤسسية (CLM)، وإدارة القضايا والمرافعات القضائية، وبنك السوابق والأنظمة السعودية في بيئة معزولة تحفظ خصوصية بياناتك داخل المملكة.
      </p>

      {/* Primary Dynamic CTA Routing Directly to /onboarding */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto mb-12">
        <Link href="/onboarding" className="w-full sm:w-auto" data-testid="hero-cta-onboarding">
          <Button
            size="lg"
            className="w-full sm:w-auto h-12 px-8 bg-[#1F7A46] hover:bg-[#165832] text-white text-base font-bold shadow-xs transition-all cursor-pointer"
          >
            <span>ابدأ الآن</span>
            <ArrowLeft className="w-4 h-4 mr-2" />
          </Button>
        </Link>
        <a href="#checker" className="w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto h-12 px-6 border-[#CCD8CE] bg-white hover:bg-[#E8EFE9] text-[#1B281F] text-base font-semibold transition-all cursor-pointer"
          >
            <span>جرّب المصحح النظامي</span>
            <ArrowDown className="w-4 h-4 mr-2 text-[#4A5D50]" />
          </Button>
        </a>
      </div>

      {/* Three Pillars Value Propositions Grid (Enterprises, Law Firms, Students) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-right">
        {PILLAR_PROPOSITIONS.map((pillar) => {
          const Icon = pillar.icon
          return (
            <div
              key={pillar.id}
              className="bg-white rounded-2xl border border-[#CCD8CE] p-6 flex flex-col justify-between shadow-xs hover:border-[#1F7A46] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#E8EFE9] text-[#1F7A46] border border-[#CCD8CE]">
                    {pillar.badge}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-[#E8EFE9] text-[#1F7A46] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h2 className="text-lg font-extrabold text-[#1B281F] font-heading leading-snug">
                  {pillar.title}
                </h2>

                <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
                  {pillar.desc}
                </p>

                <ul className="space-y-1.5 pt-1">
                  {pillar.highlights.map((h) => (
                    <li key={h} className="flex items-center gap-1.5 text-xs font-semibold text-[#1B281F]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1F7A46] shrink-0" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 mt-4 border-t border-[#CCD8CE] flex items-center justify-between">
                <Link
                  href={pillar.href}
                  className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1"
                >
                  <span>{pillar.cta}</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/onboarding"
                  className="text-[11px] font-semibold text-[#566A5C] hover:text-[#1B281F]"
                >
                  ابدأ الآن ←
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sovereign Trust Micro-line */}
      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-[#566A5C]">
        <ShieldCheck className="w-4 h-4 text-[#1F7A46]" />
        <span>تشفير محلي سيادي متوافق مع PDPL • لا يتم استخدام بياناتك في تدريب نماذج عامة</span>
      </div>
    </section>
  )
}
