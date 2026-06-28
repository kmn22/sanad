import React from 'react'

export default function ApiDocs() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-8" dir="rtl">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-3xl font-bold mb-2">توثيق الواجهة البرمجية (API Documentation)</h1>
        <p className="text-gray-500 mb-8">الإصدار 1.0.0 — واجهات "سند" الخاصة بالذكاء الاصطناعي</p>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-emerald-700">1. تحليل القضية (Case Insights)</h2>
          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm mb-4">
            <span className="font-bold text-blue-600">POST</span> /api/ai/analyze
          </div>
          <p className="mb-2"><strong>الوصف:</strong> يحلل نصوص وتفاصيل القضية لاستخراج ملخص تنفيذي والمخاطر والخطوات التالية بناءً على الأنظمة السعودية.</p>
          <h3 className="font-semibold mt-4 mb-2">المدخلات (Request Body - JSON)</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm" dir="ltr">
{`{
  "caseDetails": "تفاصيل القضية (نص)",
  "type": "litigation"
}`}
          </pre>
          <h3 className="font-semibold mt-4 mb-2">المخرجات (Response - JSON)</h3>
          <pre className="bg-gray-900 text-emerald-300 p-4 rounded-md text-sm" dir="ltr">
{`{
  "summary": "ملخص تنفيذي للقضية",
  "risks": ["خطر 1", "خطر 2"],
  "nextSteps": ["إجراء 1", "إجراء 2"]
}`}
          </pre>
        </section>

        <hr className="my-8" />

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-emerald-700">2. توليد العقود (AI Contract Draft)</h2>
          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm mb-4">
            <span className="font-bold text-blue-600">POST</span> /api/ai/draft
          </div>
          <p className="mb-2"><strong>الوصف:</strong> يولد مسودة عقد احترافية بناءً على وصف بسيط من المستخدم.</p>
          <h3 className="font-semibold mt-4 mb-2">المدخلات (Request Body - JSON)</h3>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-md text-sm" dir="ltr">
{`{
  "prompt": "وصف العقد المطلوب (مثال: عقد عمل مبرمج براتب 8000 ريال)"
}`}
          </pre>
          <h3 className="font-semibold mt-4 mb-2">المخرجات (Response - JSON)</h3>
          <pre className="bg-gray-900 text-emerald-300 p-4 rounded-md text-sm" dir="ltr">
{`{
  "draft": "النص الكامل للمسودة بالتنسيق القانوني"
}`}
          </pre>
        </section>

        <div className="mt-12 text-center text-sm text-gray-400">
          <p>للحصول على مفتاح الـ API يرجى التواصل مع فريق الدعم.</p>
        </div>
      </div>
    </div>
  )
}
