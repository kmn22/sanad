import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import { Lock, KeyRound, ShieldCheck, FileText, Users, ArrowLeft, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'الأمان والخصوصية — مقر للتقنية القانونية',
  description: 'توضيح واقعي للضوابط الأمنية، التشفير، عزل البيانات، وحماية الخصوصية في منصة مقر.',
}

const SECURITY_CONTROLS = [
  {
    icon: Lock,
    title: 'تشفير المرفقات والخزنة بـ AES-256-GCM',
    desc: 'تُشفّر المستندات والنسخ الاحتياطية على مستوى التخزين بمفاتيح خاصة وتغليف مفاتيح HKDF-SHA256 مرتبط بكل مساحة عمل للتحقق من السلامة ومنع العبث.',
  },
  {
    icon: Users,
    title: 'عزل المكاتب والملفات السرية',
    desc: 'يُفرض معرف المكتب على كل استعلام برمجي وتُتاح خاصية «القضية السرية» لقصر الاطلاع على المحامين المكلّفين بالملف فقط.',
  },
  {
    icon: KeyRound,
    title: 'المصادقة الثنائية TOTP وبوابة OTP للموكّل',
    desc: 'تدعم المنصة التحقق الثنائي عبر تطبيقات TOTP، كما تخضع روابط بوابة الموكّل لرموز دخول لمرة واحدة وتاريخ انتهاء محدد.',
  },
  {
    icon: FileText,
    title: 'سجل تدقيق متسلسل بـ HMAC-SHA256',
    desc: 'تُسجّل الإجراءات الأمنية الحساسة وتغييرات الصلاحيات بسلسلة تحقق تشفيرية تكشف أي محاولة تعديل غير مصرّح بها.',
  },
]

export default function SecurityPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">الأمان والخصوصية</span>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>البنية الأمنية الفعلية لمنصة مقر</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B281F] font-heading">
            حماية البيانات وعزل الملفات بالشفافية الكاملة
          </h1>
          <p className="text-sm sm:text-base text-[#4A5D50] leading-relaxed">
            توضح هذه الصفحة الضوابط التقنية المطبّقة فعلياً داخل النظام لحماية ملفات المحامين ومستندات الموكلين وفق مبادئ نظام حماية البيانات الشخصية السعودي (PDPL).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SECURITY_CONTROLS.map((ctrl) => (
            <div key={ctrl.title} className="rounded-2xl border border-[#CCD8CE] bg-white p-6 space-y-3 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-[#E8EFE9] text-[#1F7A46] grid place-items-center">
                <ctrl.icon className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold font-heading">{ctrl.title}</h2>
              <p className="text-xs text-[#4A5D50] leading-relaxed">{ctrl.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 space-y-2 text-xs text-amber-950">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
            <span>حدود الضوابط والإفصاح الواضح</span>
          </div>
          <p className="leading-relaxed">
            • تخضع استضافة الخادم وموقع قاعدة البيانات لإعدادات التشغيل المختارة (خادم مخصص داخل المملكة أو خادم تشغيل معتمد)، ولا تدّعي المنصة حالياً حصولها على اعتماد جهات تنظيمية كـ ZATCA Phase 2 أو التوقيع الموثق عبر نفاذ أو استضافة حكومية مغلقة.
          </p>
          <p className="leading-relaxed">
            • للإبلاغ عن أي ثغرة أمنية أو الاستفسار عن الضوابط، راسلنا مباشرة عبر البريد: <span className="font-mono font-bold" dir="ltr">hello@maqar.sa</span>.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-2 border-t border-[#CCD8CE]">
          <Link href="/privacy" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            سياسة الخصوصية وحقوق PDPL <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <Link href="/ai-disclosure" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            إفصاح الذكاء الاصطناعي <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
