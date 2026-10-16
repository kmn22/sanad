import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import { Cpu, ShieldCheck, UserCheck, EyeOff, AlertTriangle, ArrowLeft, Mail, Scale } from 'lucide-react'

export const metadata: Metadata = {
  title: 'إفصاح استخدام الذكاء الاصطناعي — سَنَد للتقنية القانونية',
  description: 'معايير الشفافية، العزل المحلي، ومحددات الذكاء الاصطناعي التوليدي في منصة سَنَد.',
}

export default function AiDisclosurePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">إفصاح الذكاء الاصطناعي</span>
        </div>

        {/* Header Block */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <Cpu className="w-3.5 h-3.5" />
            <span>الشفافية والأمان في الذكاء الاصطناعي القانوني</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B281F] font-heading">
            إفصاح استخدام الذكاء الاصطناعي
          </h1>
          <p className="text-sm text-[#4A5D50] leading-relaxed">
            بيان بالنماذج الخوارزمية، آليات المعالجة، والضوابط الأخلاقية والنظامية الحاكمة لتوليد ومراجعة النصوص القانونية في سَنَد.
          </p>
        </div>

        {/* Golden Rule Banner */}
        <div className="bg-white rounded-2xl border-2 border-[#1F7A46]/30 p-6 space-y-3 shadow-sm">
          <div className="flex items-center gap-2 text-[#1F7A46] font-bold text-base font-heading">
            <UserCheck className="w-5 h-5 shrink-0" />
            <span>المبدأ الذهبي: الإشراف البشري الإلزامي (Human-in-the-Loop)</span>
          </div>
          <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
            تعتمد بعض خصائص منصة سَنَد على نماذج لغوية متخصصة ومستضافة محلياً للمساعدة في التدقيق النظامي وتوليد البدائل التعاقدية المتوافقة. المخرجات آلية بطبيعتها ومعدة لمساعدة الممارس، ولا تعد بديلاً عن الرأي القانوني المستقل للمحامي المرخص. يجب مراجعة أي مخرج ومطابقته مع وقائع كل دعوى أو عقد قبل اعتماده.
          </p>
        </div>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#1F7A46] font-bold text-sm font-heading">
              <EyeOff className="w-4 h-4" />
              <span>لا تدريب على بيانات المكاتب</span>
            </div>
            <p className="text-xs text-[#4A5D50] leading-relaxed">
              <strong>بياناتك ومسوداتك لا تُستخدم إطلاقاً لتدريب أي نموذج ذكاء اصطناعي.</strong> تخضع النصوص المدخلة للمعالجة الآنية (Inference) لتقديم نتيجة الفحص ثم لا تحفظ في مستودعات تدريب عامة أو مشتركة.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#1F7A46] font-bold text-sm font-heading">
              <ShieldCheck className="w-4 h-4" />
              <span>عزل الاستضافة والسيادة</span>
            </div>
            <p className="text-xs text-[#4A5D50] leading-relaxed">
              لا يُسمح بربط نماذج ذكاء اصطناعي خارجية تجارية غير مقيدة أو نقل بيانات خارج المملكة دون تقييم أثر حماية البيانات (DPIA) وموافقة نظامية مسبقة. جميع عمليات الاستدلال تجري داخل بنية تحتية آمنة.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#1F7A46] font-bold text-sm font-heading">
              <AlertTriangle className="w-4 h-4 text-[#B54708]" />
              <span>مخاطر الهلوسة والتحقق المستمر</span>
            </div>
            <p className="text-xs text-[#4A5D50] leading-relaxed">
              رغم تدريب الخوارزميات على مواد الأنظمة السعودية الصادرة، قد تنتج النماذج مراجع غير محدثة في حالات نادرة. يتحمل المحامي مسؤولية التأكد من أحدث التعديلات المنشورة في الجريدة الرسمية (أم القرى).
            </p>
          </div>

          <div className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#1F7A46] font-bold text-sm font-heading">
              <Scale className="w-4 h-4" />
              <span>حماية الخصوصية ومبدأ التقليل</span>
            </div>
            <p className="text-xs text-[#4A5D50] leading-relaxed">
              نوصي الممارسين دوماً بحذف المعرفات غير اللازمة (مثل أرقام الهويات أو الحسابات البنكية) قبل إخضاع البنود للفحص، والالتزام بأدنى قدر لازم من البيانات لتحقيق الغرض القانوني.
            </p>
          </div>
        </div>

        {/* Feedback and Incident Report Card */}
        <div className="bg-white rounded-2xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-[#1B281F] font-heading">
            الإبلاغ عن مخرجات غير دقيقة أو حوادث
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
            إذا لاحظت أي خطأ نظامي في تحليل المواد أو استشهاد غير دقيق، نرجو إبلاغ فريقنا فوراً لدراسته وتحديث قاعدة المعرفة النظامية:
          </p>
          <div className="flex items-center gap-2 pt-1 text-sm font-mono text-[#1F7A46]">
            <Mail className="w-4 h-4" />
            <a href="mailto:ahmed@sanad.sa" className="hover:underline">ahmed@sanad.sa</a>
          </div>
        </div>

        {/* Back navigation */}
        <div className="pt-4 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4 rotate-180" /> العودة للصفحة الرئيسية
          </Link>
          <Link href="/security" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            تفاصيل معمارية الأمان والسيادة ←
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
