import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import { ShieldCheck, Lock, FileText, UserCheck, AlertTriangle, ArrowLeft, Mail, Scale } from 'lucide-react'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية — سَنَد للتقنية القانونية',
  description: 'سياسة الخصوصية ومعالجة البيانات الشخصية لمنصة سَنَد وفق نظام حماية البيانات الشخصية السعودي (PDPL).',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">سياسة الخصوصية</span>
        </div>

        {/* Header Block */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>نظام حماية البيانات الشخصية السعودي (PDPL)</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B281F] font-heading">
            سياسة الخصوصية وحماية البيانات
          </h1>
          <p className="text-xs text-[#566A5C] font-mono">
            تاريخ السريان: 28 سبتمبر 2026 — المتحكم: سَنَد (Sanad) — التواصل: ahmed@sanad.sa
          </p>
        </div>

        {/* Highlight Summary Card */}
        <div className="bg-white rounded-2xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
          <h2 className="text-base font-bold text-[#1B281F] font-heading flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#1F7A46]" />
            التزامنا السيادي تجاه سرية بيانات المحامين
          </h2>
          <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
            توضح هذه السياسة معالجة «سَنَد» للبيانات الشخصية للأفراد داخل المملكة العربية السعودية وفق نظام حماية البيانات الشخصية ولوائحه التنفيذية. سَنَد خدمة برمجية متعددة المكاتب، وتعمل كمتحكم في بيانات الحساب والاشتراك، وكمعالج للبيانات ومسودات القضايا التي يديرها المحامي المشترك.
          </p>
        </div>

        {/* Detailed Sections in Clean Cards */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              1. نطاق السياسة وهوية المتحكم
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              تطبق هذه السياسة على كل من يستخدم منصة سَنَد أو يزور موقعها الإلكتروني. المتحكم المسؤول عن بيانات التسجيل والفوترة هو إدارة منصة سَنَد. أما مسودات العقود ولوائح الدعاوى التي يُدخلها المحامي في المنصة، فيعد المكتب المشترك هو «المتحكم» فيها، وتعد سَنَد «معالجاً» يعمل وفق تعليمات المكتب والأنظمة المهنية.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              2. البيانات التي يتم جمعها ومعالجتها
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              قد تشمل البيانات: بيانات الحساب والاتصال، الهوية الوطنية أو الإقامة عند إدخالها، ملفات القضايا والمستندات القانونية، بيانات أطراف العقود والخصوم، سجلات الدخول والتدقيق التقني، وطلبات الدعم الفني. يجب على المشتركين عدم إدخال أي بيانات غير لازمة لأداء الغرض المهني.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              3. الأغراض والأساس النظامي للمعالجة
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              تُعالج البيانات لتقديم خدمات التدقيق والصياغة التعاقدية، حماية الحسابات ومنع الدخول غير المصرح به، الوفاء بالالتزامات النظامية والمهنية، وإدارة الاشتراكات. لا يُستخدم الرضا أساساً نظامياً عندما تكون المعالجة متطلبة لعقد أو التزام نظامي صريح. أي تواصل تسويقي أو غير تشغيلي يتطلب موافقة مستقلة قابلة للسحب في أي وقت.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              4. سيادة البيانات وعدم المشاركة أو النقل الخارجي
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              <strong>لا تُباع البيانات الشخصية إطلاقاً.</strong> لا يتم تمكين أي مزود خارجي أو نقل أي مستندات خارج حدود المملكة العربية السعودية. يعتمد نموذج الذكاء الاصطناعي لفحص البنود على معالجة محلية معزولة داخل بنية سَنَد، ولا يتم إرسال نصوص العقود إلى أي واجهات برمجية أجنبية مفتوحة أو أطراف تجارية ثالثة.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              5. مدد الاحتفاظ وإتلاف البيانات
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              يتم الاحتفاظ بالبيانات بحسب الحاجة الفعلية لتحقيق الغرض والالتزامات النظامية والمهنية المقررة في الأنظمة السعودية. تُمنع إزالة أي بيانات طالما وجد نزاع قائم أو حفظ نظامي مفروض. بعد انتهاء المدد المقررة، تُحذف البيانات أو تُتلف بصورة آمنة تمنع استرجاعها بما يشمل النسخ الاحتياطية.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              6. حقوق صاحب البيانات وطرق ممارستها
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              يحق لكل صاحب بيانات بموجب نظام حماية البيانات الشخصية: طلب العلم، والوصول إلى بياناته، والحصول على نسخة مقروءة، وتصحيحها أو استكمالها، وطلب إتلافها عند انتفاء الحاجة إليها، وسحب موافقته عند انطباقها. نلتزم بالرد على الطلبات خلال المدة النظامية المعتادة (30 يوماً).
            </p>
            <div className="pt-2">
              <Link
                href="/privacy/request"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F7A46] bg-[#E8EFE9] hover:bg-[#D8E6DA] px-3.5 py-2 rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                تقديم طلب ممارسة حقوق صاحب البيانات ←
              </Link>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              7. التدابير الأمنية والتعامل مع الحوادث
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              تطبق المنصة معايير التشفير (AES-256 للبيانات أثناء التخزين، وTLS 1.3 أثناء النقل)، مع عزل كامل بين سجلات كل مساحة عمل، وتسجيل تدقيق مفصل لجميع العمليات. في حال الاشتباه بحدوث أي تسريب أو وصول غير مصرح، يتم تقييم الحادث وإخطار الهيئة السعودية للبيانات والذكاء الاصطناعي (سدايا) وأصحاب الشأن وفق المهل النظامية.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-[#CCD8CE] p-6 space-y-3 shadow-xs">
            <h2 className="text-lg font-bold text-[#1B281F] font-heading flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#1F7A46]" />
              8. التواصل ومسؤول حماية البيانات
            </h2>
            <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
              لأي استفسارات أو شكاوى تتعلق بحماية البيانات والخصوصية، يُرجى مراسلتنا مباشرة عبر البريد المخصص:
            </p>
            <div className="flex items-center gap-2 pt-1 text-sm font-mono text-[#1F7A46]">
              <Mail className="w-4 h-4" />
              <a href="mailto:ahmed@sanad.sa" className="hover:underline">ahmed@sanad.sa</a>
            </div>
          </section>
        </div>

        {/* Navigation back */}
        <div className="pt-4 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4 rotate-180" /> العودة للصفحة الرئيسية
          </Link>
          <Link href="/terms" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            شروط الاستخدام ←
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
