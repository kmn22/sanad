'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Scale,
  CheckCircle2,
  X,
  Sparkles,
  ShieldCheck,
  Zap,
  Building2,
  GraduationCap,
  Briefcase,
  HelpCircle,
  ArrowLeft,
  ChevronDown,
  Phone,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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
      popular: false,
      icon: GraduationCap,
      features: [
        'تسجيل فوري ببريد .edu.sa',
        'بنك المصطلحات القضائية والأنظمة السعودية',
        'نظام التكرار المتباعد لبطاقات الاستذكار',
        'مصحح صياغة العقود بالذكاء الاصطناعي (حتى 20 عقد/شهرياً)',
        'شهادات إتمام إلكترونية لكل مسار تدريبي',
        'إتاحة الملف الشخصي للمكاتب الباحثة عن كفاءات',
      ],
      notIncluded: [
        'إصدار فواتير ZATCA الإلكترونية',
        'بوابة الموكل ومشاركة الروابط عبر WhatsApp',
        'إدارة فريق العمل والأدوار المتعددة',
      ],
    },
    {
      id: 'solo',
      name: 'ممارس فردي',
      badge: 'للمحامين المستقلين',
      target: 'للمحامي المرخص والمستشار القانوني الفردي',
      priceMonthly: 199,
      priceYearly: 159,
      ctaText: 'جرّب مجاناً لمدة 14 يوماً',
      ctaHref: '/register?plan=solo',
      popular: false,
      icon: Briefcase,
      features: [
        'ذكاء اصطناعي محلي غير محدود (Qwen 2.5 السيادي)',
        'إدارة حتى 50 موكلاً وقضية نشطة',
        'أدوات فوترة داخلية مع حقول ضريبة ZATCA',
        'بوابة الموكل الآمنة مع روابط WhatsApp بدون كلمات مرور',
        'تطبيق جوال PWA يعمل بدون إنترنت داخل قاعات المحاكم',
        'الموجز الصباحي ورادار تنبيهات المهل والمدد النظامية',
        'محرر ومراجع العقود واللوائح مع نظام المعاملات المدنية',
      ],
      notIncluded: [
        'مقاعد متعددة لفريق العمل والمساعدين',
        'تخصيص الهوية والشعار على بوابة العميل',
      ],
    },
    {
      id: 'firm',
      name: 'مكتب وشركة محاماة',
      badge: 'الأكثر اختياراً',
      target: 'لمكاتب وشركات المحاماة التي تدير قضايا وفرق عمل',
      priceMonthly: 499,
      priceYearly: 399,
      ctaText: 'ابدأ اشتراك المكتب الآن',
      ctaHref: '/register?plan=firm',
      popular: true,
      icon: Building2,
      features: [
        'كل مزايا باقة الممارس الفردي',
        'عدد موكلين وقضايا وعقود غير محدود',
        'يشمل 5 مقاعد لفريق العمل (مع إمكانية إضافة المزيد)',
        'إدارة صلاحيات دقيقة: شريك / محامٍ / متدرب / محاسب (RBAC)',
        'تخصيص كامل لهوية المكتب وشعاره على بوابة العميل',
        'تقارير الشركاء الشهرية التنفيذية (PDF)',
        'تكامل الروابط السحرية عبر SMS و WhatsApp API',
        'دعم فني خاص ومدير حساب مخصص عبر WhatsApp',
        'نسخ احتياطي سيادي مشفر للبيانات يومياً',
      ],
      notIncluded: [],
    },
  ]

  const faqs = [
    {
      q: 'هل بيانات موكلي وقضايا مكتبي آمنة وسيادية؟',
      a: 'نعم تماماً. سند مصمم من الأساس ليعمل بنموذج سيادي (Local-First). نموذج الذكاء الاصطناعي (Qwen 2.5 14B) يعمل محلياً بالكامل، وبياناتك ومستندات موكليك لا تُرسل لأي خوادم سحابية أجنبية أو نماذج تجارية مفتوحة، بما يتوافق بدقة مع نظام حماية البيانات الشخصية السعودي (PDPL).',
    },
    {
      q: 'كيف تعمل بوابة العميل، وهل يحتاج الموكل لكلمة مرور؟',
      a: 'الموكل لا يحتاج لكلمة مرور نهائياً! يمكنك توليد رابط سحري آمن ومشفر بنقرة زر واحدة وإرساله للموكل عبر WhatsApp. يفتح الموكل الرابط ليجد خطاً زمنياً مبسطاً لقضيته، فواتير ZATCA لسدادها فوراً عبر مدى أو Apple Pay، ومسودات العقود لتوقيعها إلكترونياً.',
    },
    {
      q: 'هل الفواتير متوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (ZATCA)؟',
      a: 'تتضمن المنصة أدوات فوترة داخلية وتجريبية تساعد على احتساب ضريبة القيمة المضافة وإعداد بيانات الفاتورة، لكنها ليست بديلاً عن الربط المعتمد مع منصة فاتورة. يجب التحقق من متطلبات ZATCA قبل الإصدار.',
    },
    {
      q: 'هل يمكنني استيراد بيانات قضاياي وموكلي الحالية من ملفات Excel؟',
      a: 'بكل تأكيد. يوفر سند معالج استيراد ذكي ينقل سجلات عملائك، القضايا، والمهام السابقة من جداول Excel خلال أقل من دقيقتين دون فقدان أي بيانات.',
    },
    {
      q: 'كيف يمكن لطلاب كليات القانون الحصول على الباقة المجانية؟',
      a: 'يكفي التسجيل بالبريد الإلكتروني المعتمد الصادر من جامعتك السعودية (ينتهي بـ edu.sa.)، وسيتم تفعيل حساب الطالب فوراً بكافة ميزات بنك المصطلحات ومصحح العقود الذكي ومسارات التدريب.',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100" dir="rtl">
      {/* Top Navbar */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Scale className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">سند <span className="text-xs font-normal text-emerald-600 font-mono">Sanad</span></span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground hidden sm:block">
              الرئيسية
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-xs">
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white">
                ابدأ تجربة مجانية
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Header */}
      <section className="pt-12 pb-8 px-4 text-center space-y-4 max-w-4xl mx-auto">
        <Badge variant="outline" className="px-3 py-1 bg-emerald-50 text-emerald-700 border-emerald-300 text-xs">
          باقات استثمارية واضحة ومحلية
        </Badge>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
          لوحة العمليات اليومية التي تحمي وقتك وترفع احترافية مكتبك
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          سواء كنت ممارساً مستقلاً أو تدير مكتب محاماة متكاملاً أو طالباً يستعد لرخصة الممارسة — اختر الباقة المناسبة وابدأ في دقائق بدون متطلبات بطاقة ائتمانية.
        </p>

        {/* Billing Switcher Toggle */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <span className={`text-xs font-bold ${billingCycle === 'monthly' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
            دفع شهري
          </span>
          <button
            type="button"
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-14 h-8 bg-emerald-600 rounded-full p-1 transition-colors relative focus:outline-hidden"
          >
            <div
              className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                billingCycle === 'yearly' ? '-translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-bold ${billingCycle === 'yearly' ? 'text-emerald-600' : 'text-muted-foreground'}`}>
              دفع سنوي
            </span>
            <Badge className="bg-emerald-600 text-white text-[10px] px-1.5 py-0 font-bold">
              وفّر 20%
            </Badge>
          </div>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier) => {
            const Icon = tier.icon
            const price = billingCycle === 'yearly' ? tier.priceYearly : tier.priceMonthly

            return (
              <div
                key={tier.id}
                className={`relative rounded-2xl flex flex-col justify-between p-6 transition-all border ${
                  tier.popular
                    ? 'border-emerald-500 bg-white dark:bg-slate-900 shadow-xl ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60'
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge className="bg-emerald-600 text-white px-3 py-1 text-xs shadow-md">
                      الباقة الأكثر طلباً
                    </Badge>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Tier Title */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{tier.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{tier.target}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  {/* Price */}
                  <div className="pt-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold tracking-tight">
                        {price.toLocaleString('ar-SA')}
                      </span>
                      <span className="text-xs text-muted-foreground">ر.س / شهرياً</span>
                    </div>
                    {billingCycle === 'yearly' && tier.priceMonthly > 0 && (
                      <p className="text-[11px] text-emerald-600 mt-1 font-medium">
                        تُدفع سنوياً بقيمة {(price * 12).toLocaleString('ar-SA')} ر.س (توفير {(tier.priceMonthly - tier.priceYearly) * 12} ر.س)
                      </p>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 text-xs pt-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200">المزايا المضمنة:</p>
                    {tier.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300 leading-snug">{feat}</span>
                      </div>
                    ))}
                    {tier.notIncluded.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 opacity-50">
                        <X className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-400 leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                  <Link href={tier.ctaHref} className="w-full block">
                    <Button
                      className={`w-full text-xs font-bold ${
                        tier.popular
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                          : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
                      }`}
                    >
                      {tier.ctaText}
                    </Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="mx-auto max-w-5xl overflow-hidden px-4 pb-16">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-bold">مقارنة تفصيلية بين الباقات</h2>
          <p className="text-xs text-muted-foreground">كل ما تحتاجه لاتخاذ القرار المناسب لمكتبك أو مسارك التعليمي</p>
        </div>

        <div className="rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b">
                  <th className="p-3.5 font-bold">الميزة / الخدمة</th>
                  <th className="p-3.5 font-bold text-center">طالب ومتدرب</th>
                  <th className="p-3.5 font-bold text-center">ممارس فردي</th>
                  <th className="p-3.5 font-bold text-center text-emerald-600">مكتب محاماة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="p-3.5 font-medium">الذكاء الاصطناعي المحلي (Qwen 2.5 السيادي)</td>
                  <td className="p-3.5 text-center text-muted-foreground">محدد (20 عقد)</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">غير محدود</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">غير محدود</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">عدد الموكلين والقضايا النشطة</td>
                  <td className="p-3.5 text-center text-muted-foreground">قضايا افتراضية تدريبية</td>
                  <td className="p-3.5 text-center">حتى 50 ملفاً</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">غير محدود</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">فوترة ZATCA المرحلة الثانية + QR Code</td>
                  <td className="p-3.5 text-center text-slate-400">—</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ مشمول</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ مشمول</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">بوابة الموكل ومشاركة الروابط عبر WhatsApp</td>
                  <td className="p-3.5 text-center text-slate-400">—</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ مشمول</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ بهوية المكتب وشعاره</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">إدارة صلاحيات فريق العمل (RBAC)</td>
                  <td className="p-3.5 text-center text-slate-400">—</td>
                  <td className="p-3.5 text-center text-slate-400">مستخدم واحد</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">5 مستخدمين (+إضافي)</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">تقارير الشركاء الشهرية التنفيذية (PDF)</td>
                  <td className="p-3.5 text-center text-slate-400">—</td>
                  <td className="p-3.5 text-center text-slate-400">—</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓ مشمول</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium">تطبيق PWA والعمل دون اتصال في المحاكم</td>
                  <td className="p-3.5 text-center text-emerald-600">✓</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓</td>
                  <td className="p-3.5 text-center text-emerald-600 font-bold">✓</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 pb-20 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">الأسئلة الشائعة</h2>
          <p className="text-xs text-muted-foreground">كل ما ترغب بمعرفته حول الأمان، النشر السيادي، وتفعيل الحساب</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border bg-white dark:bg-slate-900 overflow-hidden transition-all"
            >
              <button
                type="button"
                className="w-full p-4 text-right flex items-center justify-between font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-2xl md:text-3xl font-extrabold">جاهز لتجربة سند في مكتبك؟</h2>
          <p className="text-xs md:text-sm text-slate-300">
            ابدأ تجربتك المجانية لمدة 14 يوماً مع بيانات سعودية نموذجية وشارك أول رابط بوابة مع موكليك اليوم.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs md:text-sm px-6">
                ابدأ التجربة المجانية الآن
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-xs md:text-sm">
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
