import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import { ShieldCheck, Lock, UserCheck, FileText, ArrowLeft, Mail } from 'lucide-react'
import { PRIVACY_NOTICE_VERSION } from '@/lib/privacy-version'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية — مقر للتقنية القانونية',
  description: 'سياسة الخصوصية ومعالجة البيانات الشخصية لمنصة مقر وفق نظام حماية البيانات الشخصية السعودي (PDPL).',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">سياسة الخصوصية</span>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>نظام حماية البيانات الشخصية (PDPL) • إصدار {PRIVACY_NOTICE_VERSION}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B281F] font-heading">
            سياسة الخصوصية وحماية بيانات المكاتب والموكلين
          </h1>
          <p className="text-sm sm:text-base text-[#4A5D50] leading-relaxed">
            تلتزم منصة «مقر» بحماية سرية البيانات الشخصية والمهنية للمحامين والموكلين ومعالجتها بالحد الأدنى اللازم لتشغيل المكتب الرقمي وبوابة الموكل.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-[#CCD8CE] bg-white p-6 space-y-2.5">
            <FileText className="w-5 h-5 text-[#1F7A46]" />
            <h2 className="text-base font-bold font-heading">البيانات التي نجمعها</h2>
            <p className="text-xs text-[#4A5D50] leading-relaxed">
              بيانات إنشاء الحساب والمكتب (الاسم، البريد، اسم المكتب)، إضافة إلى سجلات القضايا والملفات التي يُدخلها المحامي أو يرفعها الموكّل طواعيةً داخل بوابة الموكل.
            </p>
          </div>
          <div className="rounded-2xl border border-[#CCD8CE] bg-white p-6 space-y-2.5">
            <Lock className="w-5 h-5 text-[#1F7A46]" />
            <h2 className="text-base font-bold font-heading">الغرض من المعالجة وعدم البيع</h2>
            <p className="text-xs text-[#4A5D50] leading-relaxed">
              تُستخدم البيانات حصراً لتقديم خدمات إدارة المكتب وبوابة الموكّل وإشعارات المواعيد والأمان، ولا تُباع أو تُشارك لأغراض إعلانية أو تدريب نماذج خارجية.
            </p>
          </div>
          <div className="rounded-2xl border border-[#CCD8CE] bg-white p-6 space-y-2.5">
            <UserCheck className="w-5 h-5 text-[#1F7A46]" />
            <h2 className="text-base font-bold font-heading">حقوق صاحب البيانات</h2>
            <p className="text-xs text-[#4A5D50] leading-relaxed">
              لك حق طلب الوصول إلى بياناتك، تصحيحها، أو طلب محوها وفق أحكام نظام حماية البيانات الشخصية عبر نموذج الطلبات المخصص في المنصة.
            </p>
            <Link
              href="/privacy/request"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#1F7A46] hover:underline pt-1"
            >
              تقديم طلب خصوصية (PDPL) <ArrowLeft className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="rounded-2xl border border-[#CCD8CE] bg-white p-6 space-y-2.5">
            <Mail className="w-5 h-5 text-[#1F7A46]" />
            <h2 className="text-base font-bold font-heading">التواصل بخصوص الخصوصية</h2>
            <p className="text-xs text-[#4A5D50] leading-relaxed">
              للاستفسارات المتعلقة بحماية البيانات أو سحب الموافقة، يمكن مراسلتنا مباشرة على:{' '}
              <span className="font-mono font-bold text-[#1B281F]" dir="ltr">hello@maqar.sa</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 pt-2 border-t border-[#CCD8CE]">
          <Link href="/" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            العودة للرئيسية <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
          <Link href="/terms" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            شروط الاستخدام <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
