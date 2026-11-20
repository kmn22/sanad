'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import {
  Scale,
  CheckCircle2,
  X,
  Building2,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ChevronDown,
  ArrowLeft,
  Landmark,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const tiers = [
    {
      id: 'student',
      name: 'الأكاديمية والطلاب',
      englishTier: 'Academic / Free',
      categoryBadge: 'البحث الأكاديمي وبنك السوابق',
      badge: 'مجاني للجامعات (.edu.sa)',
      target: 'لطلاب كليات القانون والباحثين والمتدربين بالبريد الجامعي السعودي',
      priceMonthly: 0,
      priceYearly: 0,
      isCustom: false,
      ctaText: 'ابدأ مجاناً بالبريد الجامعي',
      ctaHref: '/onboarding?persona=LAW_STUDENT',
      recommended: false,
      icon: GraduationCap,
      features: [
        'تفعيل فوري مجاني بالبريد الجامعي (.edu.sa)',
        'بنك السوابق القضائية والمبادئ النظامية السعودية',
        'محرك البحث الدلالي في الأنظمة واللوائح مع الحواشي',
        'محاكي الصياغة القضائية والتعاقدية التفاعلي (20 عقداً/شهر)',
        'بطاقات الاستذكار بالتكرار المتباعد واختبارات SBA',
      ],
      notIncluded: [
        'إدارة القضايا والموكلين وحاسبة المواعيد القضائية',
        'إدارة دورة حياة العقود المؤسسية (Enterprise CLM)',
      ],
    },
    {
      id: 'solo',
      name: 'المحامي المستقل',
      englishTier: 'Solo Lawyer',
      categoryBadge: 'إدارة الممارسة القانونية الفردية',
      badge: 'مثالي للممارس المستقل',
      target: 'للمحامي المرخص والمستشار القانوني المستقل',
      priceMonthly: 199,
      priceYearly: 159,
      isCustom: false,
      ctaText: 'ابدأ الآن (تجربة 14 يوماً)',
      ctaHref: '/onboarding?persona=LAW_FIRM&tier=solo',
      recommended: false,
      icon: Briefcase,
      features: [
        'فحص وتدقيق لحظي غير محدود للعقود ضد نظام العمل والمعاملات المدنية',
        'إدارة القضايا والجلسات وحاسبة المهل النظامية (حتى 50 ملفاً)',
        'منضدة صياغة اللوائح والمذكرات الجوابية والاعتراضية',
        'بوابة الموكل السيادية المشفرة بروابط آمنة بدون كلمات مرور',
        'مسودات فواتير الأتعاب وحساب الضريبة (15%)',
        'تطبيق جوال PWA يعمل داخل قاعات المحاكم',
      ],
      notIncluded: [
        'تعدد مقاعد الفريق وصلاحيات الأدوار (RBAC)',
        'مصفوفة اعتمادات العقود المؤسسية (Enterprise CLM)',
      ],
    },
    {
      id: 'firm',
      name: 'مكاتب المحاماة Pro',
      englishTier: 'Law Firm Pro',
      categoryBadge: 'إدارة الممارسة والمحاكم المتكاملة',
      badge: 'الأكثر اختياراً للمكاتب',
      target: 'لمكاتب وشركات المحاماة التي تدير قضايا وفرق عمل مشتركة',
      priceMonthly: 499,
      priceYearly: 399,
      isCustom: false,
      ctaText: 'ابدأ اشتراك المكتب الاحترافي',
      ctaHref: '/onboarding?persona=LAW_FIRM&tier=firm_pro',
      recommended: true,
      icon: Building2,
      features: [
        'كافة مزايا باقة المحامي المستقل للصياغة وإدارة المحاكم',
        'عدد قضايا وموكلين وجلسات وعقود غير محدود',
        'يشمل 5 مقاعد لفريق المكتب (+ إمكانية التوسع)',
        'صلاحيات دقيقة للأدوار وعزل القضايا السرية (RBAC)',
        'تخصيص شعار وهوية المكتب على بوابة الموكلين',
        'تقارير الشركاء المالية والتنفيذية وفوترة مهيأة لـ ZATCA',
        'نسخ احتياطي سيادي مشفر يومياً ودعم فني مخصص',
      ],
      notIncluded: [
        'تكامل الدخول الموحد للمنشآت (Enterprise SSO / SAML)',
      ],
    },
    {
      id: 'enterprise',
      name: 'المنشآت والشركات',
      englishTier: 'Enterprise Custom',
      categoryBadge: 'إدارة دورة حياة العقود والحوكمة (CLM)',
      badge: 'للإدارات القانونية والمنشآت',
      target: 'للشركات القابضة والمنشآت والإدارات القانونية والجهات المؤسسية',
      priceMonthly: 1499,
      priceYearly: 1199,
      isCustom: true,
      ctaText: 'اطلب عرض سعر وتهيئة مؤسسية',
      ctaHref: '/onboarding?persona=ENTERPRISE_CORP',
      recommended: false,
      icon: Landmark,
      features: [
        'منظومة إدارة دورة حياة العقود المؤسسية الكاملة (Enterprise CLM)',
        'تقييم آلي لمخاطر البنود التعاقدية ومؤشرات الالتزام',
        'مصفوفة صلاحيات واعتمادات متعددة المستويات بين الإدارات',
        'رادار الالتزامات التعاقدية وتنبيهات التجديد والضمانات البنكية',
        'سجلات الحوكمة المؤسسية والامتثال لنظام الشركات و PDPL',
        'دخول موحد للمنشآت (SSO / SAML 2.0 / النفاذ الموحد)',
        'خيار استضافة سحابية خاصة أو محلية مع اتفاقية مستوى خدمة (SLA)',
      ],
      notIncluded: [],
    },
  ]

  const comparisonGroups = [
    {
      category: '1. إدارة الممارسة والقضايا والمحاكم (Practice & Court Management)',
      rows: [
        {
          feature: 'إدارة ملفات القضايا والجلسات القضائية',
          student: 'نماذج تدريبية',
          solo: 'حتى 50 قضية نشطة',
          firm: 'غير محدود + قضايا سرية',
          enterprise: 'سجل النزاعات المؤسسية',
        },
        {
          feature: 'حاسبة المواعيد الإجرائية والمهل النظامية (م/187 مرافعات)',
          student: 'للتدريب الأكاديمي',
          solo: '✓ شاملة التنبيهات',
          firm: '✓ شاملة التنبيهات للفريق',
          enterprise: '✓',
        },
        {
          feature: 'بوابة الموكلين السيادية المشفرة',
          student: '—',
          solo: '✓ مشمولة',
          firm: '✓ بهوية وشعار المكتب',
          enterprise: 'بوابة الأطراف والموردين',
        },
        {
          feature: 'إدارة مقاعد الفريق وتوزيع المهام (RBAC) والفوترة',
          student: 'مستخدم واحد',
          solo: 'مستخدم واحد',
          firm: '5 مقاعد (+ مقاعد إضافية)',
          enterprise: 'مقاعد وإدارات غير محدودة',
        },
      ],
    },
    {
      category: '2. إدارة دورة حياة العقود والحوكمة المؤسسية (Enterprise CLM & Governance)',
      rows: [
        {
          feature: 'فحص وتدقيق البنود ضد نظام المعاملات المدنية ونظام العمل',
          student: '20 عقداً شهرياً',
          solo: 'غير محدود',
          firm: 'غير محدود',
          enterprise: 'غير محدود + قواعد مخصصة',
        },
        {
          feature: 'دورة حياة العقد الكاملة (CLM) ومصفوفة الاعتمادات المتدرجة',
          student: '—',
          solo: 'مسودات فردية',
          firm: 'اعتماد شريك المكتب',
          enterprise: '✓ مصفوفة صلاحيات متعددة الإدارات',
        },
        {
          feature: 'رادار الالتزامات وتنبيهات التجديد التلقائي والضمانات',
          student: '—',
          solo: 'تنبيهات أساسية',
          firm: '✓ لعقود الموكلين',
          enterprise: '✓ رادار التزامات مؤسسي شامل',
        },
        {
          feature: 'الدخول الموحد (SSO / SAML) واستضافة معزولة واتفاقية SLA',
          student: '—',
          solo: '—',
          firm: 'اختياري',
          enterprise: '✓ مشمول بالكامل',
        },
      ],
    },
    {
      category: '3. بنك السوابق والبحث النظامي والأكاديمي (Precedent Bank & Statutory RAG)',
      rows: [
        {
          feature: 'بنك السوابق القضائية والأنظمة السعودية المحدثة',
          student: '✓ وصول كامل',
          solo: '✓ وصول كامل',
          firm: '✓ وصول كامل',
          enterprise: '✓ وصول كامل',
        },
        {
          feature: 'محاكي الصياغة الأكاديمي وبطاقات التكرار المتباعد (SBA)',
          student: '✓ مشمول بالكامل',
          solo: '✓',
          firm: '✓ لتدريب المحامين المتدربين',
          enterprise: '—',
        },
      ],
    },
  ]

  const faqs = [
    {
      q: 'ما الفرق الجوهري بين باقة «مكاتب المحاماة Pro» وباقة «المنشآت والشركات (Enterprise CLM)»؟',
      a: 'باقة «مكاتب المحاماة Pro» مصممة لإدارة الممارسة القانونية والتقاضي (إدارة القضايا، الجلسات، المهل النظامية، بوابة الموكلين، وفوترة الساعات والأتعاب). أما باقة «المنشآت والشركات» فتركز على إدارة دورة حياة العقود المؤسسية (CLM)، ومصفوفة الاعتمادات بين الإدارات (القانونية، المالية، المشتريات)، وتقييم المخاطر التعاقدية، وسجلات الحوكمة والامتثال.',
    },
    {
      q: 'هل نصوص العقود وأسرار القضايا والموكلين آمنة ومحلية داخل المملكة؟',
      a: 'نعم تماماً. صُمم «مقر» بنموذج سيادي محلي يعالج النصوص والمستندات في بيئة معزولة ومشفرة (AES-256)، ولا تُستخدم بياناتك لتدريب أي نماذج ذكاء اصطناعي عامة، بما يتوافق مع نظام حماية البيانات الشخصية السعودي (PDPL).',
    },
    {
      q: 'كيف يستفيد طلاب كليات القانون والباحثون من الباقة الأكاديمية المجانية؟',
      a: 'يكفي التسجيل بالبريد الجامعي السعودي المعتمد (.edu.sa)، ليتم تفعيل الحساب الأكاديمي مجاناً مع وصول كامل لبنك السوابق القضائية، محرك البحث الدلالي في الأنظمة، ومحاكي الصياغة القضائية.',
    },
    {
      q: 'هل يمكن الترقية بين الباقات أو تخصيص عدد المقاعد لاحقاً؟',
      a: 'بكل تأكيد. يمكنك البدء بتجربة مجانية لمدة 14 يوماً ثم الترقية أو إضافة مقاعد جديدة لفريقك في أي وقت من لوحة إعدادات المقر.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">الأسعار والباقات</span>
        </div>

        {/* Hero Header */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>باقات «مقر» — المقر الرقمي للعمليات القانونية والحوكمة</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#1B281F] font-heading leading-tight">
            باقات مصممة للأكاديميين، المحامين، مكاتب المحاماة، والشركات
          </h1>
          <p className="text-sm md:text-base text-[#4A5D50] max-w-2xl mx-auto leading-relaxed">
            فصل واضح بين أدوات إدارة الممارسة والتقاضي لمكاتب المحاماة، ومنظومة إدارة دورة حياة العقود والحوكمة (CLM) للمنشآت، ومختبر البحث الأكاديمي.
          </p>

          {/* Annual / Monthly Billing Switcher Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              data-testid="billing-monthly"
              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                billingCycle === 'monthly'
                  ? 'bg-[#1F7A46] text-white'
                  : 'text-[#566A5C] hover:text-[#1B281F]'
              }`}
            >
              دفع شهري (Monthly)
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              data-testid="billing-toggle"
              className="w-13 h-7 bg-[#1F7A46] rounded-full p-0.5 transition-colors relative cursor-pointer"
              aria-label="تبديل دورة الفوترة سنوي أو شهري"
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-xs transition-transform ${
                  billingCycle === 'yearly' ? '-translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              data-testid="billing-yearly"
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                billingCycle === 'yearly'
                  ? 'bg-[#1F7A46] text-white'
                  : 'text-[#566A5C] hover:text-[#1B281F]'
              }`}
            >
              <span>دفع سنوي (Annual)</span>
              <span className="bg-[#E8EFE9] text-[#1F7A46] border border-[#CCD8CE] text-[11px] px-2 py-0.5 rounded-full font-bold">
                وفّر 20%
              </span>
            </button>
          </div>
        </section>

        {/* 4-Tier Pricing Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {tiers.map((tier) => {
            const Icon = tier.icon
            const price = billingCycle === 'yearly' ? tier.priceYearly : tier.priceMonthly

            return (
              <div
                key={tier.id}
                data-testid={`pricing-tier-${tier.id}`}
                className={`relative rounded-2xl flex flex-col justify-between p-6 transition-all bg-white border ${
                  tier.recommended
                    ? 'border-[#1F7A46] shadow-md ring-2 ring-[#1F7A46]/20'
                    : 'border-[#CCD8CE] shadow-xs'
                }`}
              >
                {tier.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-[#1F7A46] text-white px-3 py-1 rounded-full text-[11px] font-bold shadow-xs whitespace-nowrap">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Category Pill */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#E8EFE9] text-[#1F7A46] border border-[#CCD8CE]">
                      {tier.categoryBadge}
                    </span>
                    <span className="text-[10px] font-mono text-[#566A5C]">{tier.englishTier}</span>
                  </div>

                  {/* Title & Icon */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h2 className="text-xl font-bold font-heading text-[#1B281F]">{tier.name}</h2>
                      <p className="text-xs text-[#566A5C] mt-1 leading-relaxed">{tier.target}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#E8EFE9] text-[#1F7A46] shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-2 pb-3 border-b border-[#CCD8CE]">
                    {tier.isCustom ? (
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl font-extrabold tracking-tight font-heading text-[#1B281F]">
                            باقة مؤسسية مخصصة
                          </span>
                        </div>
                        <p className="text-[11px] text-[#1F7A46] mt-1 font-semibold">
                          تبدأ من {price} ر.س / شهرياً • تسعير حسب حجم العقود والإدارات
                        </p>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-extrabold tracking-tight font-heading text-[#1B281F]">
                            {price === 0 ? 'مجاناً' : price}
                          </span>
                          {price > 0 && (
                            <span className="text-xs text-[#566A5C] font-semibold">
                              ر.س / شهرياً
                            </span>
                          )}
                        </div>
                        {price === 0 ? (
                          <p className="text-[11px] text-[#1F7A46] mt-1 font-semibold">
                            مجاناً طوال فترة الدراسة الجامعية (.edu.sa)
                          </p>
                        ) : billingCycle === 'yearly' ? (
                          <p className="text-[11px] text-[#1F7A46] mt-1 font-semibold">
                            تُدفع سنوياً بقيمة {price * 12} ر.س (توفير {(tier.priceMonthly - tier.priceYearly) * 12} ر.س)
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#566A5C] mt-1">
                            فوترة شهرية مرنة بدون التزام سنوي
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 text-xs pt-1">
                    <p className="font-bold text-[#1B281F]">المزايا المضمنة:</p>
                    {tier.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#1F7A46] shrink-0 mt-0.5" />
                        <span className="text-[#1B281F] leading-relaxed">{feat}</span>
                      </div>
                    ))}
                    {tier.notIncluded.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 opacity-55">
                        <X className="h-4 w-4 text-[#566A5C] shrink-0 mt-0.5" />
                        <span className="text-[#566A5C] leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-[#CCD8CE]">
                  <Link href={tier.ctaHref} className="w-full block">
                    <Button
                      className={`w-full text-xs font-bold h-11 cursor-pointer transition-all ${
                        tier.recommended
                          ? 'bg-[#1F7A46] hover:bg-[#165832] text-white shadow-xs'
                          : 'bg-[#F5F7F5] hover:bg-[#E8EFE9] text-[#1B281F] border border-[#CCD8CE]'
                      }`}
                    >
                      <span>{tier.ctaText}</span>
                      <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </section>

        {/* Detailed Comparison Table: Practice Management vs. Enterprise CLM vs. Academic */}
        <section className="bg-white rounded-2xl border border-[#CCD8CE] overflow-hidden shadow-xs">
          <div className="p-6 border-b border-[#CCD8CE] bg-[#F5F7F5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#1B281F] font-heading">
                مقارنة تفصيلية: إدارة الممارسة والتقاضي مقابل حوكمة العقود المؤسسية (CLM)
              </h2>
              <p className="text-xs text-[#566A5C] mt-0.5">
                تفصيل دقيق للمزايا بين باقات الأكاديمية، المحامي المستقل، مكاتب المحاماة، والشركات
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F7A46]">
              <ShieldCheck className="w-4 h-4" />
              <span>تشفير سيادي متوافق مع PDPL في جميع الباقات</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-[#E8EFE9]/60 border-b border-[#CCD8CE] text-[#34543F]">
                  <th className="p-3.5 font-bold min-w-[240px]">الميزة / القدرة النظامية</th>
                  <th className="p-3.5 font-bold text-center">الأكاديمية والطلاب (Free)</th>
                  <th className="p-3.5 font-bold text-center">المحامي المستقل (Solo)</th>
                  <th className="p-3.5 font-bold text-center text-[#1F7A46]">مكاتب المحاماة (Firm Pro)</th>
                  <th className="p-3.5 font-bold text-center">المنشآت والشركات (Enterprise CLM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CCD8CE] text-[#1B281F]">
                {comparisonGroups.map((group) => (
                  <React.Fragment key={group.category}>
                    <tr className="bg-[#F5F7F5]">
                      <td colSpan={5} className="p-3 font-extrabold text-[#1F7A46] text-xs">
                        {group.category}
                      </td>
                    </tr>
                    {group.rows.map((row) => (
                      <tr key={row.feature} className="hover:bg-[#F5F7F5]/40">
                        <td className="p-3.5 font-medium">{row.feature}</td>
                        <td className="p-3.5 text-center text-[#566A5C]">{row.student}</td>
                        <td className="p-3.5 text-center">{row.solo}</td>
                        <td className="p-3.5 text-center text-[#1F7A46] font-bold">{row.firm}</td>
                        <td className="p-3.5 text-center font-bold text-[#1B281F]">{row.enterprise}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-4">
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-xl font-bold font-heading text-[#1B281F]">الأسئلة الشائعة حول باقات «مقر»</h2>
            <p className="text-xs text-[#566A5C]">إجابات واضحة ومباشرة عن الفروق بين الباقات والأمان والتفعيل</p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#CCD8CE] bg-white overflow-hidden shadow-2xs"
              >
                <button
                  type="button"
                  className="w-full p-4 text-right flex items-center justify-between font-bold text-xs sm:text-sm hover:bg-[#F5F7F5] cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="text-[#1B281F]">{faq.q}</span>
                  <ChevronDown className={`h-4 w-4 text-[#566A5C] transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-[#4A5D50] leading-relaxed border-t border-[#CCD8CE] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  )
}
