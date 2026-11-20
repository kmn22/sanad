import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import { Cpu, ShieldCheck, AlertTriangle, UserCheck, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'إفصاح استخدام الذكاء الاصطناعي — مقر للتقنية القانونية',
  description: 'الشفافية التقنية لآلية عمل أدوات الفحص الحتمية ومساعدة المسودات الاختيارية في منصة مقر.',
}

export default function AiDisclosurePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-10">
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">إفصاح الذكاء الاصطناعي</span>
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <Cpu className="w-3.5 h-3.5" />
            <span>الشفافية في أدوات القراءة والمسودات</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#1B281F] font-heading">
            حدود وآلية عمل الأدوات الذكية في «مقر»
          </h1>
          <p className="text-sm sm:text-base text-[#4A5D50] leading-relaxed">
            توضح هذه الصفحة الفرق بين أدوات الفحص الأولية المبرمجة ومزايا الصياغة الاختيارية داخل مساحة العمل، مع تأكيد المسؤولية المهنية للمحامي.
          </p>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[#CCD8CE] bg-white p-6 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-sm text-[#1F7A46]">
              <ShieldCheck className="w-4 h-4" />
              <span>١. الأدوات العامة على الصفحة الرئيسية (حتمية وبلا LLM خارجي)</span>
            </div>
            <p className="text-xs text-[#4A5D50] leading-relaxed">
              يعمل مساعد قراءة البنود وملخص العقد في الصفحة الرئيسية بقواعد برمجية حتمية محلية داخل الخادم؛ وإذا لم يندرج البند ضمن القواعد الثابتة المبرمجة، يُصنّف مباشرةً كـ «يتطلب مراجعة محامٍ مختص» دون افتراض سلامته النظامية.
            </p>
          </div>

          <div className="rounded-2xl border border-[#CCD8CE] bg-white p-6 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-sm text-[#1F7A46]">
              <Cpu className="w-4 h-4" />
              <span>٢. الصياغة الاختيارية داخل مساحة العمل المحمية</span>
            </div>
            <p className="text-xs text-[#4A5D50] leading-relaxed">
              تعتمد أدوات مسودة النصوص داخل الحساب المسجّل على خادم نموذج محلي مُهيأ (Ollama) إن كان متصلاً ببيئة التشغيل، أو تعود لقالب استرشادي أولي قابل للتحرير من المحامي.
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-6 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>٣. ليست استشارة قانونية ولا تغني عن المحامي المرخّص</span>
            </div>
            <p className="text-xs text-amber-950 leading-relaxed">
              تُعد جميع التنبيهات والملخصات والمسودات الآلية أدوات مساعدة أولية فقط. قد تتضمن الأنظمة التعديلات اللاحقة أو الوقائع الخاصة بحالتك ما لم ترصده الأداة؛ لذا تبقى المراجعة والاعتماد النهائي من اختصاص المحامي المرخّص وحده.
            </p>
          </div>

          <div className="rounded-2xl border border-[#CCD8CE] bg-white p-6 space-y-2.5">
            <div className="flex items-center gap-2 font-bold text-sm text-[#1B281F]">
              <UserCheck className="w-4 h-4 text-[#1F7A46]" />
              <span>٤. عدم تدريب نماذج خارجية بملفات موكّليك</span>
            </div>
            <p className="text-xs text-[#4A5D50] leading-relaxed">
              لا تُرسل نصوص عقودك أو ملفات موكّليك إلى واجهات تدريب عامة، ولا تُستخدم بيانات العملاء لتحسين أي نماذج خارج نطاق المنصة.
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
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
