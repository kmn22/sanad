import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import { ShieldCheck, Lock, HardDrive, Cpu, FileText, CheckCircle2, AlertTriangle, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'الأمان وسيادة البيانات — سَنَد للتقنية القانونية',
  description: 'معمارية الأمان، سيادة البيانات المكانية، التشفير، والامتثال لنظام حماية البيانات الشخصية السعودي (PDPL) في منصة سَنَد.',
}

export default function SecurityPage() {
  const securityPillars = [
    {
      title: 'السيادة المكانية (داخل السعودية)',
      desc: 'تُحفظ كافة قواعد البيانات والملفات المشفرة على خوادم محلية داخل حدود المملكة العربية السعودية، متوافقة مع متطلبات توطين البيانات المنصوص عليها في الأنظمة الوطنية.',
      icon: HardDrive,
    },
    {
      title: 'التشفير أثناء النقل والتخزين',
      desc: 'تشفير الاتصالات بالكامل عبر بروتوكول TLS 1.3 مع شهادات أمان معتمدة ورؤوس أمان صارمة (HSTS, CSP)، وتشفير الملفات الحساسة والنسخ الاحتياطية باستخدام معيار AES-256-GCM.',
      icon: Lock,
    },
    {
      title: 'عزل الذكاء الاصطناعي (Local-First AI)',
      desc: 'المحرك اللغوي يعمل محلياً في بيئة معزولة تماماً؛ لا يتم إرسال نصوص مذكراتك أو مسوداتك لأي خوادم خارجية عامة مثل OpenAI أو غيرها، ولا تُستخدم بياناتك لتدريب أي نماذج.',
      icon: Cpu,
    },
    {
      title: 'الامتثال لنظام حماية البيانات (PDPL)',
      desc: 'سَنَد مصمم ليمكن مسؤولي مساحات العمل من الاستجابة لحقوق أصحاب البيانات (العلم، الوصول، التصحيح، الإتلاف) مع سجل تدقيق إداري مفصل لكل حركة حساسة.',
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">الأمان والسيادة</span>
        </div>

        {/* Header Block */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>معمارية السيادة وحماية سرية المحاماة</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B281F] font-heading">
            أين تُحفظ بياناتك وكيف نحمي خصوصية موكليك؟
          </h1>
          <p className="text-base text-[#4A5D50] leading-relaxed">
            سرية أعمال المحاماة ليست ميزة إضافية، بل هي الأساس الذي قامت عليه هندسة منصة سَنَد منذ السطر الأول من الكود.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {securityPillars.map((p) => {
            const Icon = p.icon
            return (
              <div key={p.title} className="bg-white rounded-2xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#E8EFE9] text-[#1F7A46] flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-[#1B281F] font-heading">
                  {p.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
                  {p.desc}
                </p>
              </div>
            )
          })}
        </div>

        {/* Honest Alpha Boundaries (Mandatory Trust Requirement) */}
        <div className="bg-white rounded-2xl border border-[#CCD8CE] p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex items-center gap-2 text-[#D97706] font-bold text-base font-heading">
            <AlertTriangle className="w-5 h-5" />
            <span>حدود نسخة Alpha بصراحة تامة (أمانة الإفصاح)</span>
          </div>
          <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
            في سَنَد، نفضل أن نخبرك بما لا تستطيع المنظومة فعله اليوم قبل أن نعدك بما تفعله:
          </p>

          <div className="space-y-2.5 text-xs text-[#1B281F]">
            <div className="p-3 rounded-xl bg-[#F5F7F5] border border-[#CCD8CE] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#1F7A46] shrink-0 mt-0.5" />
              <div>
                <strong>التحقق البشري إلزامي:</strong> مخرجات التدقيق ومسودات الصياغة تظل توصيات نظامية آلية مساندة، ويتحمل المحامي المرخص كامل المسؤولية المهنية عن اعتماد الوثيقة وتقديمها.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F7F5] border border-[#CCD8CE] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#1F7A46] shrink-0 mt-0.5" />
              <div>
                <strong>حدود ميزة الفواتير:</strong> خصائص الفواتير الحالية داخلية وتجريبية مخصصة لحساب الأتعاب والضريبة ولا تمثل حلاً معتمداً أو مدمجاً مباشرة مع منصة «فاتورة» (ZATCA) في الوقت الراهن.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#F5F7F5] border border-[#CCD8CE] flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#1F7A46] shrink-0 mt-0.5" />
              <div>
                <strong>النسخ الاحتياطي:</strong> ننصح كافة المكاتب بتفعيل إجراءات النسخ الاحتياطي الدوري لملفاتهم، ويوفر النظام آلية تصدير كاملة للبيانات بصيغ مقروءة عند الطلب.
              </div>
            </div>
          </div>
        </div>

        {/* Links to Privacy and Terms */}
        <div className="p-6 rounded-2xl bg-[#E8EFE9] border border-[#CCD8CE] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-[#1B281F]">هل تود مراجعة السياسات القانونية التفصيلية؟</h3>
            <p className="text-xs text-[#4A5D50]">يمكنك مراجعة بنود الخصوصية وشروط الاستخدام الكاملة في أي وقت.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/privacy" className="text-xs font-bold text-[#1F7A46] hover:underline">
              سياسة الخصوصية
            </Link>
            <span>•</span>
            <Link href="/ai-disclosure" className="text-xs font-bold text-[#1F7A46] hover:underline">
              إفصاح الذكاء الاصطناعي
            </Link>
          </div>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
