import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import { Scale, Mail, MapPin, ShieldCheck, CheckCircle2, MessageCircle, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'من نحن — سَنَد للتقنية القانونية',
  description: 'تعرّف على هوية منصة سَنَد، الفريق المؤسس، رسالتنا في تمكين المحامي السعودي، ووسائل التواصل المباشرة.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">من نحن</span>
        </div>

        {/* Header Block */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>هوية الكيان والشفافية المؤسسية</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B281F] font-heading">
            من نحن وما الذي نسعى لتحقيقه في سَنَد
          </h1>
          <p className="text-base text-[#4A5D50] leading-relaxed">
            «سَنَد» منصة تقنية برمجية سعودية ناشئة، صُممت لمساعدة المحامين الممارسين والمستشارين القانونيين في المملكة على إنجاز صياغة العقود واللوائح بدقة متوافقة مع أحدث الأنظمة القضائية السعودية.
          </p>
        </div>

        {/* Current Stage Status Box */}
        <div className="bg-white rounded-2xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
          <div className="flex items-center justify-between border-b border-[#CCD8CE] pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1F7A46] animate-pulse" />
              <h2 className="text-base font-bold text-[#1B281F] font-heading">
                الحالة التشغيلية للمشروع: نسخة الإطلاق الأولي (Alpha v1.0)
              </h2>
            </div>
            <span className="text-xs font-mono font-bold text-[#1F7A46] bg-[#E8EFE9] px-2.5 py-1 rounded-md">
              قيد التطوير المستمر
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
            نحن نركز في هذه المرحلة على جوهر القيمة الذي أثبت جدارته: <strong>محرك الصياغة الممتثل للأنظمة السعودية</strong> (خاصة نظام العمل ونظام المعاملات المدنية). نؤمن بالصراحة التامة مع عملائنا ولا نطلق أي ميزة تسويقية إلا بعد فحصها واكتمال موثوقيتها النظامية والتقنية.
          </p>
        </div>

        {/* What We Stand For */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1B281F] font-heading">
            المبادئ التي تحكم بناء المنصة
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl border border-[#CCD8CE] p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#1F7A46] font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>السيادة المحلية للبيانات</span>
              </div>
              <p className="text-xs text-[#4A5D50] leading-relaxed">
                استضافة محلية بالكامل ومعالجة معزولة؛ لا تُرفع مستندات قضاياك أو مسوداتك لأي خوادم أو نماذج تجارية مفتوحة.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#CCD8CE] p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#1F7A46] font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>أمانة الحدود التقنية</span>
              </div>
              <p className="text-xs text-[#4A5D50] leading-relaxed">
                سَنَد أداة مساعدة للمحامي في التدقيق والصياغة، ولا يقدم نفسه بديلاً عن المحامي المرخص أو الحكم القضائي.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#CCD8CE] p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#1F7A46] font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>التركيز قبل التوسع</span>
              </div>
              <p className="text-xs text-[#4A5D50] leading-relaxed">
                إتقان ميزة واحدة متفوقة تنقذ وقت المحامي وتحميه من الثغرات، قبل إطلاق المزايا الإدارية الموسعة.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-[#CCD8CE] p-5 space-y-2">
              <div className="flex items-center gap-2 text-[#1F7A46] font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>الامتثال للمنظومة السعودية</span>
              </div>
              <p className="text-xs text-[#4A5D50] leading-relaxed">
                بُني النظام ليتطابق مع ضوابط وزارة العدل، نظام المعاملات المدنية، ونظام حماية البيانات الشخصية (PDPL).
              </p>
            </div>
          </div>
        </div>

        {/* Contact & Accountability Card */}
        <div className="bg-white rounded-2xl border border-[#CCD8CE] p-6 sm:p-8 space-y-4 shadow-xs">
          <h2 className="text-lg font-bold text-[#1B281F] font-heading">
            قنوات التواصل المباشر مع إدارة المنصة
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5D50]">
            يسعدنا استقبال الملاحظات، استفسارات المكاتب القانونية، وطلبات التعاون المؤسسي عبر القنوات الرسمية التالية:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-[#F5F7F5] border border-[#CCD8CE] text-xs space-y-1">
              <Mail className="w-4 h-4 text-[#1F7A46]" />
              <div className="font-bold text-[#1B281F]">البريد الرسمي</div>
              <a href="mailto:ahmed@sanad.sa" className="text-[#1F7A46] hover:underline font-mono block">
                ahmed@sanad.sa
              </a>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F7F5] border border-[#CCD8CE] text-xs space-y-1">
              <MessageCircle className="w-4 h-4 text-[#1F7A46]" />
              <div className="font-bold text-[#1B281F]">دعم الواتساب</div>
              <div className="text-[#566A5C]">الرد خلال يوم عمل واحد</div>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F7F5] border border-[#CCD8CE] text-xs space-y-1">
              <MapPin className="w-4 h-4 text-[#1F7A46]" />
              <div className="font-bold text-[#1B281F]">الموقع والمقر</div>
              <div className="text-[#566A5C]">الرياض، المملكة العربية السعودية</div>
            </div>
          </div>
        </div>

        {/* Footer Navigation Back Link */}
        <div className="pt-2 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4 rotate-180" /> العودة للصفحة الرئيسية
          </Link>
          <Link href="/security" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            معمارية الأمان والسيادة ←
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
