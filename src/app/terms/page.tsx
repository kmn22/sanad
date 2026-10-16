import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import { FileText, Scale, AlertCircle, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'شروط الاستخدام — سَنَد للتقنية القانونية',
  description: 'شروط وأحكام استخدام منصة سَنَد للتقنية القانونية في المملكة العربية السعودية.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">شروط الاستخدام</span>
        </div>

        {/* Header Block */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <Scale className="w-3.5 h-3.5" />
            <span>الإطار التعاقدي والمهني</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B281F] font-heading">
            شروط وأحكام الاستخدام
          </h1>
          <p className="text-xs text-[#566A5C] font-mono">
            تاريخ السريان: 28 سبتمبر 2026 — مقدم الخدمة: منصة سَنَد (Sanad)
          </p>
        </div>

        {/* Core Disclaimer Box */}
        <div className="bg-[#FEF6EE] rounded-2xl border border-[#F9DBAF] p-6 space-y-3">
          <div className="flex items-center gap-2 text-[#B54708] font-bold text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>طبيعة منصة سَنَد ومسؤولية المستشار القانوني</span>
          </div>
          <p className="text-xs sm:text-sm text-[#7A2E0E] leading-relaxed">
            «سَنَد» منصة برمجية رقمية مساعدة لإدارة العمل والتدقيق القانوني، وليست مكتب محاماة ولا تقدم بذاتها استشارات قانونية أو تمثيلاً قضائياً. جميع المخرجات الآلية، بما فيها تدقيق البنود وصياغة المسودات، تتطلب وجوباً مراجعة واعتماد محامٍ ممارس ومؤهل قبل التوقيع أو الإيداع.
          </p>
        </div>

        {/* Detailed Terms Sections */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              1. الحسابات والصلاحيات وأمن الوصول
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              يكون الاشتراك بالدعوة أو التسجيل المعتمد للممارسين القانونيين. يتحمل مالك مساحة العمل القانونية مسؤولية تحديد الصلاحيات لمنسوبي مكتبه وفق مبدأ الحد الأدنى اللازم، ومراجعة وصول المساعدين، والمحافظة على سرية بيانات الدخول والمصادقة الثنائية. يمنع منعاً باتاً مشاركة بيانات الحساب الفردي مع أطراف خارجية.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              2. مشروعية بيانات العملاء والسرية المهنية
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              يقر المشترك بأنه يمتلك الأساس النظامي اللازم لمعالجة ورفع مستندات القضايا والعقود على المنصة، بما يراعي واجبات السرية المهنية المقررة في نظام المحاماة ولائحته التنفيذية، ونظام حماية البيانات الشخصية. يمتنع المستخدم عن رفع أي وثائق مصنفة تحت سرية أمنية عليا أو بيانات غير لازمة للغرض التعاقدي.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              3. استخدام أدوات الذكاء الاصطناعي والتوليد الآلي
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              تعتمد أدوات فحص العقود على نماذج مدربة على الأنظمة واللوائح السعودية. قد تعتري المخرجات الآلية نقائص أو مواد تحتاج مواءمة بحسب ظروف الواقعة. تقع على عاتق المحامي مسؤولية التأكد من ملاءمة البند البديل للغرض التجاري أو العمالي لموكله. للمزيد، يُرجى مراجعة <Link href="/ai-disclosure" className="text-[#1F7A46] font-bold underline">إفصاح استخدام الذكاء الاصطناعي</Link>.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              4. وحدات الفوترة والامتثال الضريبي
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              خصائص إصدار وتتبع الفواتير المتوفرة داخل النظام مخصصة لإدارة العمليات الداخلية للمكتب ومتابعة دفعات الأتعاب. وهي في طور التطوير الداخلي ولا تمثل حالياً ربطاً مباشراً مع منصة «فاتورة» التابعة لهيئة الزكاة والضريبة والجمارك (ZATCA). يتحمل المكتب مسؤولية الامتثال للمتطلبات الضريبية الرسمية لمخرجاته المالية.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              5. إيقاف الخدمة وحدود المسؤولية
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              تحتفظ سَنَد بحق تعليق الوصول إلى الحساب مؤقتاً في حال رصد سلوك يهدد أمان المنصة أو يشكل انتهاكاً جسيماً لشروط الاستخدام أو للأنظمة السارية. تُقدَّم الخدمات البرمجية على أساس الإمكانات المتاحة، دون تقديم أي ضمان مالي أو قضائي لنتيجة حكم أو نزاع أمام المحاكم.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              6. الاختصاص القضائي والنظام الواجب التطبيق
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              تخضع هذه الشروط والأحكام وتُفسر وفقاً للأنظمة واللوائح السارية في المملكة العربية السعودية، ويكون الاختصاص القضائي في أي نزاع ينشأ عنها منعقداً للمحاكم المختصة في مدينة الرياض.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#566A5C]">
              <Mail className="w-3.5 h-3.5 text-[#1F7A46]" />
              <span>للتواصل بشأن الشروط والعقود المؤسسية:</span>
              <a href="mailto:ahmed@sanad.sa" className="font-mono text-[#1F7A46] font-bold hover:underline">ahmed@sanad.sa</a>
            </div>
          </section>
        </div>

        {/* Back links */}
        <div className="pt-4 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4 rotate-180" /> العودة للصفحة الرئيسية
          </Link>
          <Link href="/privacy" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            سياسة الخصوصية ←
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
