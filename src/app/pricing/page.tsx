'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import {
  Scale,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  Building2,
  GraduationCap,
  Briefcase,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const tiers = [
    {
      id: 'student',
      name: 'طالب ومتدرب',
      badge: 'مجاني للجامعات',
      target: 'لطلاب كليات القانون والمتدربين بالبريد الجامعي (.edu.sa)',
      priceMonthly: 0,
      priceYearly: 0,
      ctaText: 'ابدأ دراستك مجاناً',
      ctaHref: '/register?plan=student',
      recommended: false,
      icon: GraduationCap,
      features: [
        'تسجيل فوري مجاني بالبريد الجامعي (.edu.sa)',
        'فحص صياغة العقود وتدقيق الضمانات (حتى 20 عقداً شهرياً)',
        'بنك نصوص ومواد الأنظمة السعودية وتطبيقاتها القضائية',
        'نظام التكرار المتباعد لبطاقات استذكار المصطلحات',
        'شهادات إتمام إلكترونية للمسارات التدريبية',
      ],
      notIncluded: [
        'تدقيق وفحص غير محدود للعقود واللوائح',
        'بوابة الموكل السيادية عبر روابط WhatsApp',
        'تعدد المستخدمين وإدارة مقاعد الفريق',
      ],
    },
    {
      id: 'solo',
      name: 'ممارس فردي',
      badge: 'الباقة المعتمدة للممارس المستقل',
      target: 'للمحامي المرخص والمستشار القانوني الفردي المستقل',
      priceMonthly: 199,
      priceYearly: 159,
      ctaText: 'ابدأ تجربة مجانية (14 يوماً)',
      ctaHref: '/register?plan=solo',
      recommended: true, // As required by the plan: Solo practitioner is the highlighted default
      icon: Briefcase,
      features: [
        'فحص وتدقيق لحظي غير محدود للعقود ضد نظام العمل والمعاملات المدنية',
        'اقتراح البدائل النظامية المتوافقة وحساب المهل تلقائياً',
        'محرك ذكاء اصطناعي محلي سيادي دون نقل البيانات لخوادم خارجية',
        'بوابة الموكل السيادية المشفرة مع روابط WhatsApp بدون كلمات مرور',
        'إدارة حتى 50 موكلاً وقضية نشطة مع سجل الحركات',
        'مسودات فواتير داخلية مسبقة التهيئة للضريبة',
        'تطبيق جوال PWA يعمل بدون اتصال داخل قاعات المحاكم',
        'دعم فني واستجابة خلال يوم عمل واحد',
      ],
      notIncluded: [
        'مقاعد متعددة لفريق العمل وإدارة الأدوار (RBAC)',
        'تخصيص شعار وهوية المكتب على بوابة الموكل',
      ],
    },
    {
      id: 'firm',
      name: 'مكتب محاماة',
      badge: 'للمكاتب والشركات',
      target: 'لمكاتب وشركات المحاماة التي تدير قضايا وفرق عمل مشتركة',
      priceMonthly: 499,
      priceYearly: 399,
      ctaText: 'ابدأ اشتراك المكتب',
      ctaHref: '/register?plan=firm',
      recommended: false,
      icon: Building2,
      features: [
        'كافة مزايا باقة الممارس الفردي للصياغة والتدقيق النظامي',
        'عدد موكلين وقضايا وعقود غير محدود',
        'يشمل 5 مقاعد لفريق العمل (مع إمكانية إضافة مقاعد إضافية)',
        'صلاحيات دقيقة للأدوار: شريك / محامٍ / متدرب / محاسب (RBAC)',
        'تخصيص كامل لهوية وشعار المكتب على بوابة الموكل',
        'تقارير الشركاء الشهرية التنفيذية (PDF)',
        'قناة دعم فني خاصة ومدير حساب مخصص عبر WhatsApp',
        'نسخ احتياطي سيادي مشفر للبيانات يومياً',
      ],
      notIncluded: [],
    },
  ]

  const faqs = [
    {
      q: 'هل نصوص العقود وأسرار الموكلين آمنة ومحلية؟',
      a: 'نعم تماماً. صُمم سَنَد بنموذج سيادي محلي (Local-First). نموذج الفحص والصياغة يعمل محلياً في بيئة معزولة، ولا تُرفع مستنداتك أو بيانات موكليك لأي نماذج ذكاء اصطناعي تجارية عامة، بما يتوافق بدقة مع نظام حماية البيانات الشخصية السعودي (PDPL).',
    },
    {
      q: 'ما هي الأنظمة التي يفحص المحرك نصوص العقود ضدها؟',
      a: 'يركز المحرك على فحص الضمانات والمواد الإلزامية في نظام العمل السعودي (مثل المادة 83 الخاصة بعدم المنافسة، والمادة 53 الخاصة بفترة التجربة) ونظام المعاملات المدنية (مثل المادة 179 الخاصة بالشرط الجزائي، والمادة 174 الخاصة بالظروف الطارئة والقوة القاهرة)، مع استمرار التحديث.',
    },
    {
      q: 'كيف تعمل بوابة الموكل وهل يحتاج لكلمة مرور؟',
      a: 'لا يحتاج الموكل لأي كلمة مرور. يمكنك توليد رابط سحري آمن ومشفر بنقرة زر واحدة ومشاركته مع الموكل عبر WhatsApp، ليطلع على المستندات والخط الزمني لقضيته في واجهة بسيطة.',
    },
    {
      q: 'هل فواتير سَنَد الحالية معتمدة من هيئة الزكاة (ZATCA)؟',
      a: 'خصائص الفواتير الحالية داخلية وتجريبية لحساب الأتعاب والضريبة ولا تمثل ربطاً معتمداً مع منصة فاتورة. يخضع التكامل المعتمد للتطوير وسيتاح ضمن التحديثات القادمة.',
    },
    {
      q: 'كيف يستفيد طلاب كليات القانون من الباقة المجانية؟',
      a: 'يكفي التسجيل بالبريد الجامعي السعودي المعتمد الصادر من جامعتك (.edu.sa)، ويتم تفعيل حساب الطالب فوراً بكافة مزايا التدريب وبنك الأنظمة مجاناً.',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">الأسعار والباقات</span>
        </div>

        {/* Hero Header */}
        <section className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>باقات استثمارية واضحة ومحلية</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#1B281F] font-heading leading-tight">
            استثمار يحمي وقتك ويرفع موثوقية صياغاتك
          </h1>
          <p className="text-sm md:text-base text-[#4A5D50] max-w-xl mx-auto leading-relaxed">
            اختر الباقة المناسبة لمكتبك وابدأ فوراً بفحص وتدقيق العقود واللوائح دون الحاجة لبطاقة ائتمانية.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-[#1F7A46]' : 'text-[#566A5C]'}`}>
              دفع شهري
            </span>
            <button
              type="button"
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="w-13 h-7 bg-[#1F7A46] rounded-full p-0.5 transition-colors relative cursor-pointer"
              aria-label="تبديل دورة الفوترة"
            >
              <div
                className={`w-6 h-6 bg-white rounded-full shadow-xs transition-transform ${
                  billingCycle === 'yearly' ? '-translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="flex items-center gap-1.5">
              <span className={`text-xs font-bold ${billingCycle === 'yearly' ? 'text-[#1F7A46]' : 'text-[#566A5C]'}`}>
                دفع سنوي
              </span>
              <span className="bg-[#E8EFE9] text-[#1F7A46] border border-[#CCD8CE] text-[11px] px-2 py-0.5 rounded-full font-bold">
                وفّر 20%
              </span>
            </div>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier) => {
            const Icon = tier.icon
            const price = billingCycle === 'yearly' ? tier.priceYearly : tier.priceMonthly

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl flex flex-col justify-between p-6 sm:p-7 transition-all bg-white border ${
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
                  {/* Title & Icon */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold font-heading text-[#1B281F]">{tier.name}</h3>
                      <p className="text-xs text-[#566A5C] mt-0.5">{tier.target}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#E8EFE9] text-[#1F7A46]">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-2 pb-2 border-b border-[#CCD8CE]">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight font-heading text-[#1B281F]">
                        {price}
                      </span>
                      <span className="text-xs text-[#566A5C] font-semibold">
                        ر.س / شهرياً
                      </span>
                    </div>
                    {billingCycle === 'yearly' && tier.priceMonthly > 0 && (
                      <p className="text-[11px] text-[#1F7A46] mt-1 font-semibold">
                        تُدفع سنوياً بقيمة {price * 12} ر.س (توفير {(tier.priceMonthly - tier.priceYearly) * 12} ر.س)
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 text-xs pt-2">
                    <p className="font-bold text-[#1B281F]">المزايا المضمنة:</p>
                    {tier.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#1F7A46] shrink-0 mt-0.5" />
                        <span className="text-[#1B281F] leading-relaxed">{feat}</span>
                      </div>
                    ))}
                    {tier.notIncluded.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 opacity-50">
                        <X className="h-4 w-4 text-[#566A5C] shrink-0 mt-0.5" />
                        <span className="text-[#566A5C] leading-relaxed">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#CCD8CE]">
                  <Link href={tier.ctaHref} className="w-full block">
                    <Button
                      className={`w-full text-xs font-bold h-11 cursor-pointer transition-all ${
                        tier.recommended
                          ? 'bg-[#1F7A46] hover:bg-[#165832] text-white shadow-xs'
                          : 'bg-[#F5F7F5] hover:bg-[#E8EFE9] text-[#1B281F] border border-[#CCD8CE]'
                      }`}
                    >
                      {tier.ctaText}
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </section>

        {/* Feature Comparison Table */}
        <section className="bg-white rounded-2xl border border-[#CCD8CE] overflow-hidden shadow-xs">
          <div className="p-5 border-b border-[#CCD8CE] bg-[#F5F7F5]">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading">مقارنة تفصيلية بين الباقات</h2>
            <p className="text-xs text-[#566A5C]">مواصفات دقيقة تساعدك على اختيار الباقة الملائمة لحجم أعمالك</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-[#E8EFE9]/50 border-b border-[#CCD8CE] text-[#34543F]">
                  <th className="p-3.5 font-bold">الميزة / الخدمة</th>
                  <th className="p-3.5 font-bold text-center">طالب ومتدرب</th>
                  <th className="p-3.5 font-bold text-center text-[#1F7A46]">ممارس فردي (موصى بها)</th>
                  <th className="p-3.5 font-bold text-center">مكتب محاماة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CCD8CE] text-[#1B281F]">
                <tr>
                  <td className="p-3.5 font-medium">فحص وتدقيق مواد نظام العمل والمعاملات المدنية</td>
                  <td className="p-3.5 text-center text-[#566A5C]">20 عقداً شهرياً</td>
                  <td className="p-3.5 text-center text-[#1F7A46] font-bold">غير محدود</td>
                  <td className="p-3.5 text-center text-[#1F7A46] font-bold">غير محدود</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">الذكاء الاصطناعي المحلي السيادي (معزول تماماً)</td>
                  <td className="p-3.5 text-center text-[#566A5C]">محدد</td>
                  <td className="p-3.5 text-center text-[#1F7A46] font-bold">✓ مشمول</td>
                  <td className="p-3.5 text-center text-[#1F7A46] font-bold">✓ مشمول</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">عدد الموكلين والقضايا النشطة</td>
                  <td className="p-3.5 text-center text-[#566A5C]">نماذج تدريبية</td>
                  <td className="p-3.5 text-center">حتى 50 ملفاً</td>
                  <td className="p-3.5 text-center text-[#1F7A46] font-bold">غير محدود</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">بوابة الموكل السيادية بروابط WhatsApp</td>
                  <td className="p-3.5 text-center text-[#CCD8CE]">—</td>
                  <td className="p-3.5 text-center text-[#1F7A46] font-bold">✓ مشمول</td>
                  <td className="p-3.5 text-center text-[#1F7A46] font-bold">✓ بهوية المكتب</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">مقاعد فريق العمل وتوزيع الأدوار (RBAC)</td>
                  <td className="p-3.5 text-center text-[#CCD8CE]">—</td>
                  <td className="p-3.5 text-center text-[#566A5C]">مستخدم واحد</td>
                  <td className="p-3.5 text-center text-[#1F7A46] font-bold">5 مستخدمين (+إضافي)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">العمل بدون إنترنت في قاعات المحاكم (PWA)</td>
                  <td className="p-3.5 text-center text-[#1F7A46]">✓</td>
                  <td className="p-3.5 text-center text-[#1F7A46] font-bold">✓</td>
                  <td className="p-3.5 text-center text-[#1F7A46] font-bold">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-4">
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-xl font-bold font-heading text-[#1B281F]">الأسئلة الشائعة حول الاشتراكات</h2>
            <p className="text-xs text-[#566A5C]">إجابات واضحة ومباشرة عن الأمان والضمانات والتفعيل</p>
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
