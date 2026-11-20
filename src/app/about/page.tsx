import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import { Scale, Mail, MapPin, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'عن مقر — المكتب الرقمي للمحامي السعودي',
  description: 'تعرّف على رسالة منصة مقر في تنظيم مكتب المحامي المستقل والمكاتب الصغيرة في المملكة العربية السعودية وبوابة الموكل الآمنة.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">عن مقر</span>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>مصممة للمحامي السعودي المستقل والمكتب الصغير</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B281F] font-heading">
            مقر (Maqar) — مكتبك القانوني المرتب وبوابة موكّليك
          </h1>
          <p className="text-sm sm:text-base text-[#4A5D50] leading-relaxed">
            أُنشئت منصة «مقر» لحل مشكلة يومية يواجهها المحامي المستقل والمكاتب الصغيرة في السعودية: تشتت ملفات القضايا بين البريد وواتساب والمجلدات، وكثرة اتصالات المتابعة من الموكلين، وخطر نسيان تجديد التراخيص والوكالات.
          </p>
        </div>

        <div className="rounded-3xl border border-[#CCD8CE] bg-white p-7 space-y-4 shadow-2xs">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1F7A46]" />
            <span>ما الذي نركز عليه في «مقر»؟</span>
          </h2>
          <ul className="space-y-3 text-xs sm:text-sm text-[#4A5D50]">
            {[
              'إدارة يومية عملية للقضايا، الموكلين، المهام، وجلسات التقويم دون تعقيد أو إعدادات مطولة.',
              'بوابة موكّل مخصّصة بالاسم التجاري لمكتبك تشاركها عبر واتساب بنقرة واحدة وتُحمى برمز تحقق OTP.',
              'متتبع استباقي لمواعيد انتهاء الوكالات، رخصة المحاماة، العقود، والالتزامات التنظيمية.',
              'خزنة مستندات مشفرة بـ AES-256-GCM مع حفظ الإصدارات وفصل القضايا السرية.',
              'تسعير واضح بالريال السعودي يناسب المكتب من مقعد واحد حتى ١٠ مقاعد.',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A46] shrink-0 mt-1" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-[#CCD8CE] bg-white p-6 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <MapPin className="w-4 h-4 text-[#1F7A46]" />
              <span>النطاق والتمركز</span>
            </div>
            <p className="text-xs text-[#4A5D50] leading-relaxed">
              المملكة العربية السعودية — مبنية بواجهة عربية أصلية (RTL) وتقويم مزدوج ومصطلحات مألوفة للمحامي والموكّل السعودي.
            </p>
          </div>
          <div className="rounded-2xl border border-[#CCD8CE] bg-white p-6 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Mail className="w-4 h-4 text-[#1F7A46]" />
              <span>التواصل المباشر</span>
            </div>
            <p className="text-xs text-[#4A5D50] leading-relaxed">
              للاستفسارات أو طلبات التفعيل والشراكات: <span className="font-mono font-bold text-[#1B281F]" dir="ltr">hello@maqar.sa</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-2 border-t border-[#CCD8CE]">
          <Link href="/" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            العودة للرئيسية <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <Link href="/security" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            الأمان والخصوصية <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <Link href="/register" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            ابدأ تجربة ١٤ يوماً <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
