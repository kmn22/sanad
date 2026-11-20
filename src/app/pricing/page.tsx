'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import { Button } from '@/components/ui/button'
import {
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Briefcase,
  Building2,
  HelpCircle,
} from 'lucide-react'

type BillingCycle = 'monthly' | 'yearly'

interface PricingTier {
  id: 'solo' | 'office'
  testId: string
  badge: string
  nameAr: string
  nameEn: string
  tagline: string
  monthlySar: number
  yearlySar: number
  seatLimitLabel: string
  ctaLabel: string
  ctaHref: string
  highlight?: boolean
  icon: typeof Briefcase
  features: string[]
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'solo',
    testId: 'pricing-tier-solo',
    badge: 'للمحامي المستقل',
    nameAr: 'باقة المحامي المستقل',
    nameEn: 'Solo Lawyer',
    tagline: 'كل ما تحتاجه لتنظيم قضاياك ومشاركة موكّليك عبر بوابة احترافية خاصة بمكتبك.',
    monthlySar: 199,
    yearlySar: 159,
    seatLimitLabel: 'مقعد واحد • حتى ١٥ موكّلاً نشطاً',
    ctaLabel: 'ابدأ تجربة ١٤ يوماً مجاناً',
    ctaHref: '/register?plan=solo',
    highlight: true,
    icon: Briefcase,
    features: [
      'إدارة القضايا والمهام وجدولة الجلسات',
      'بوابة موكّل مخصّصة برمز تحقق OTP ومشاركة واتساب بنقرة',
      'خزنة مستندات مشفرة بـ AES-256-GCM مع حفظ الإصدارات',
      'متتبع انتهاء التراخيص والوكالات (وكالات / عقود / إقامات)',
      'تتبع ساعات العمل وإصدار بيانات الأتعاب الداخلية (غير ضريبية)',
      'مصادقة ثنائية TOTP MFA وسجل تدقيق أمني',
    ],
  },
  {
    id: 'office',
    testId: 'pricing-tier-office',
    badge: 'للمكاتب الصغيرة',
    nameAr: 'باقة المكتب الصغير',
    nameEn: 'Small Office (2–10)',
    tagline: 'تنسيق الفريق، توزيع القضايا، وحماية الملفات السرية لمكاتب المحاماة والاستشارات حتى ١٠ مقاعد.',
    monthlySar: 449,
    yearlySar: 359,
    seatLimitLabel: 'من ٢ إلى ١٠ مقاعد • موكّلون غير محدودين',
    ctaLabel: 'ابدأ تجربة المكتب (١٤ يوماً)',
    ctaHref: '/register?plan=firm',
    icon: Building2,
    features: [
      'كافة مزايا باقة المحامي المستقل دون قيود الموكلين',
      'دعوة المحامين والطاقم الإداري والمدققين بصلاحيات محددة',
      'توزيع القضايا وعزل القضايا السرية لأعضاء محددين',
      'سير العمل وطلبات الموافقات الداخلية واستلام طلبات الموكلين',
      'لوحة متابعة الأتعاب والتحصيل وأداء الفريق',
      'تصدير البيانات وأولوية الدعم الفني بالبريد الإلكتروني',
    ],
  },
]

const FAQS = [
  {
    q: 'هل تتطلب تجربة الـ ١٤ يوماً بطاقة ائتمان؟',
    a: 'لا. يمكنك فتح مساحة مكتبك وتجربة القضايا وخزنة المستندات وبوابة الموكّل لمدة ١٤ يوماً مجاناً بالكامل دون إدخال بطاقة.',
  },
  {
    q: 'كيف يتم الدفع وتفعيل الاشتراك بعد انتهاء التجربة؟',
    a: 'خلال المرحلة الحالية يتم التفعيل عبر التحويل البنكي المباشر أو فاتورة سداد للمكتب؛ بينما يجري تجهيز الدفع الإلكتروني الآلي عبر Moyasar (مدى / Apple Pay) للمرحلة الثانية.',
  },
  {
    q: 'هل الفواتير الصادرة داخل المنصة فواتير زكاة ودخل (ZATCA)؟',
    a: 'لا. بيانات الأتعاب والمطالبات داخل «مقر» هي بيانات متابعة داخلية بين المكتب وموكّله وليست فواتير ضريبية إلكترونية صادرة عن منصة فاتورة (ZATCA Phase 2).',
  },
  {
    q: 'هل بيانات قضايا موكّلي معزولة عن المكاتب الأخرى؟',
    a: 'نعم. تُفصل بيانات كل مكتب على مستوى الاستعلامات وقواعد البيانات مع تشفير المرفقات بـ AES-256-GCM وتفعيل خيار القضايا السرية.',
  },
]

export default function PricingPage() {
  const [cycle, setCycle] = useState<BillingCycle>('yearly')

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">الأسعار والباقات</span>
        </div>

        {/* Hero Heading + Billing Cycle Switcher */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>تسعير شفاف بالريال السعودي • بدون التزام طويل</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#1B281F] font-heading leading-tight">
            باقتان واضحتان لمكتبك القانوني
          </h1>
          <p className="text-sm sm:text-base text-[#4A5D50] leading-relaxed">
            ابدأ بتجربة مجانية لمدة ١٤ يوماً دون بطاقة ائتمان، واختر الباقة التي تناسب حجم مكتبك عند التفعيل.
          </p>

          {/* Annual / Monthly Toggle */}
          <div className="inline-flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-[#CCD8CE] shadow-2xs">
            <button
              type="button"
              data-testid="billing-monthly"
              onClick={() => setCycle('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                cycle === 'monthly'
                  ? 'bg-[#1F7A46] text-white shadow-xs'
                  : 'text-[#4A5D50] hover:text-[#1B281F]'
              }`}
            >
              اشتراك شهري
            </button>
            <button
              type="button"
              data-testid="billing-toggle"
              aria-label="تبديل دورة الفوترة"
              onClick={() => setCycle((c) => (c === 'yearly' ? 'monthly' : 'yearly'))}
              className="w-10 h-5 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] relative px-0.5 cursor-pointer flex items-center"
            >
              <span
                className={`w-4 h-4 rounded-full bg-[#1F7A46] transition-transform ${
                  cycle === 'yearly' ? '-translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <button
              type="button"
              data-testid="billing-yearly"
              onClick={() => setCycle('yearly')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                cycle === 'yearly'
                  ? 'bg-[#1F7A46] text-white shadow-xs'
                  : 'text-[#4A5D50] hover:text-[#1B281F]'
              }`}
            >
              <span>اشتراك سنوي</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px]">
                خصم ٢٠٪
              </span>
            </button>
          </div>
        </div>

        {/* 2 Pricing Tiers Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {PRICING_TIERS.map((tier) => {
            const Icon = tier.icon
            const price = cycle === 'yearly' ? tier.yearlySar : tier.monthlySar
            return (
              <div
                key={tier.id}
                data-testid={tier.testId}
                className={`rounded-3xl p-7 flex flex-col justify-between transition-all ${
                  tier.highlight
                    ? 'bg-white border-2 border-[#1F7A46] shadow-md'
                    : 'bg-white border border-[#CCD8CE] shadow-xs'
                }`}
              >
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#E8EFE9] text-[#1F7A46]">
                        {tier.badge}
                      </span>
                      <h2 className="text-xl font-black text-[#1B281F] font-heading pt-1">{tier.nameAr}</h2>
                      <p className="text-[11px] font-mono text-[#566A5C]">{tier.nameEn}</p>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-[#E8EFE9] text-[#1F7A46] grid place-items-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <p className="text-xs text-[#4A5D50] leading-relaxed">{tier.tagline}</p>

                  <div className="p-4 rounded-2xl bg-[#F5F7F5] border border-[#CCD8CE] space-y-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black font-mono text-[#1B281F]">{price}</span>
                      <span className="text-xs font-bold text-[#1F7A46]">ر.س / شهرياً</span>
                    </div>
                    <p className="text-[11px] text-[#566A5C]">
                      {cycle === 'yearly' ? `تُدفع سنوياً (${price * 12} ر.س / سنة)` : 'دفع شهري مرن — إلغاء في أي وقت'}
                    </p>
                    <p className="text-[11px] font-semibold text-[#1B281F] pt-1">{tier.seatLimitLabel}</p>
                  </div>

                  <ul className="space-y-2.5 text-xs text-[#1B281F]">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#1F7A46] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6 mt-6 border-t border-[#CCD8CE]">
                  <Link href={tier.ctaHref}>
                    <Button
                      className={`w-full h-11 font-bold text-xs cursor-pointer ${
                        tier.highlight
                          ? 'bg-[#1F7A46] hover:bg-[#165832] text-white'
                          : 'bg-[#1B281F] hover:bg-[#34543F] text-white'
                      }`}
                    >
                      <span>{tier.ctaLabel}</span>
                      <ArrowLeft className="w-4 h-4 mr-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </section>

        {/* Payment & Billing Honesty Banner */}
        <section className="rounded-2xl border border-[#CCD8CE] bg-white p-6 text-xs text-[#4A5D50] leading-relaxed space-y-2">
          <p className="font-bold text-[#1B281F]">ملاحظات التفعيل والفوترة في النسخة الحالية</p>
          <p>
            • ابدأ تجربة الـ ١٤ يوماً فور التسجيل دون بطاقة. عند الرغبة بالاستمرار في الباقة المدفوعة، يتم التفعيل بالتحويل البنكي المباشر لحين ربط بوابة مدى وApple Pay عبر Moyasar في المرحلة الثانية.
          </p>
          <p>
            • بيانات الأتعاب المنشأة داخل مساحة العمل للموكلين هي مطالبات متابعة داخلية ولا تُصدر فواتير إلكترونية معتمدة لدى هيئة الزكاة والضريبة والجمارك (ZATCA).
          </p>
        </section>

        {/* FAQs */}
        <section className="space-y-5">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#1F7A46]" />
            <h2 className="text-xl font-bold font-heading">أسئلة شائعة حول الاشتراك</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FAQS.map((item) => (
              <div key={item.q} className="rounded-2xl border border-[#CCD8CE] bg-white p-5 space-y-2">
                <h3 className="text-sm font-bold text-[#1B281F]">{item.q}</h3>
                <p className="text-xs text-[#4A5D50] leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
