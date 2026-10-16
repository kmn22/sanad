import React from 'react'
import Link from 'next/link'
import { LandingHeader } from '../_landing/LandingHeader'
import { LandingFooter } from '../_landing/LandingFooter'
import { ArrowLeft, Code2 } from 'lucide-react'

export default function ApiDocs() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] text-[#1B281F] font-sans" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">توثيق الواجهة البرمجية</span>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-[#CCD8CE] p-6 sm:p-8 space-y-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
              <Code2 className="w-3.5 h-3.5" />
              <span>REST API v1.0</span>
            </div>
            <h1 className="text-3xl font-bold font-heading">توثيق الواجهة البرمجية (API Documentation)</h1>
            <p className="text-xs sm:text-sm text-[#566A5C]">الإصدار 1.0.0 — واجهات «سَنَد» الخاصة بالتحليل والصياغة القانونية</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1F7A46] font-heading">1. تحليل القضية (Case Insights)</h2>
            <div className="bg-[#F5F7F5] border border-[#CCD8CE] rounded-lg p-3.5 font-mono text-xs" dir="ltr">
              <span className="font-bold text-[#1F7A46]">POST</span> /api/ai/analyze
            </div>
            <p className="text-xs sm:text-sm text-[#4A5D50]">
              <strong className="text-[#1B281F]">الوصف:</strong> يحلل نصوص وتفاصيل القضية لاستخراج ملخص تنفيذي والمخاطر والخطوات التالية بناءً على الأنظمة السعودية.
            </p>
            <h3 className="font-bold text-xs text-[#1B281F] pt-1">المدخلات (Request Body - JSON)</h3>
            <pre className="bg-[#1B281F] text-white p-4 rounded-xl text-xs overflow-x-auto" dir="ltr">
{`{
  "caseDetails": "تفاصيل القضية (نص)",
  "type": "litigation"
}`}
            </pre>
            <h3 className="font-bold text-xs text-[#1B281F] pt-1">المخرجات (Response - JSON)</h3>
            <pre className="bg-[#1B281F] text-[#A7F3D0] p-4 rounded-xl text-xs overflow-x-auto" dir="ltr">
{`{
  "summary": "ملخص تنفيذي للقضية",
  "risks": ["خطر 1", "خطر 2"],
  "nextSteps": ["إجراء 1", "إجراء 2"]
}`}
            </pre>
          </section>

          <hr className="border-[#CCD8CE]" />

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[#1F7A46] font-heading">2. توليد العقود (AI Contract Draft)</h2>
            <div className="bg-[#F5F7F5] border border-[#CCD8CE] rounded-lg p-3.5 font-mono text-xs" dir="ltr">
              <span className="font-bold text-[#1F7A46]">POST</span> /api/ai/draft
            </div>
            <p className="text-xs sm:text-sm text-[#4A5D50]">
              <strong className="text-[#1B281F]">الوصف:</strong> يولد مسودة عقد احترافية متوافقة مع الأنظمة السعودية بناءً على وصف ومعطيات المستشار القانوني.
            </p>
            <h3 className="font-bold text-xs text-[#1B281F] pt-1">المدخلات (Request Body - JSON)</h3>
            <pre className="bg-[#1B281F] text-white p-4 rounded-xl text-xs overflow-x-auto" dir="ltr">
{`{
  "prompt": "وصف العقد المطلوب (مثال: عقد عمل مبرمج براتب 8000 ريال)"
}`}
            </pre>
            <h3 className="font-bold text-xs text-[#1B281F] pt-1">المخرجات (Response - JSON)</h3>
            <pre className="bg-[#1B281F] text-[#A7F3D0] p-4 rounded-xl text-xs overflow-x-auto" dir="ltr">
{`{
  "draft": "النص الكامل للمسودة بالتنسيق القانوني"
}`}
            </pre>
          </section>
        </div>

        <div className="pt-2">
          <Link href="/" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4 rotate-180" /> العودة للصفحة الرئيسية
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
