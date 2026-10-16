'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LandingHeader } from '../../_landing/LandingHeader'
import { LandingFooter } from '../../_landing/LandingFooter'
import { FileCheck2, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react'

export default function PrivacyRequestPage() {
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function submit(formData: FormData) {
    setIsSubmitting(true)
    setMessage('')
    try {
      const response = await fetch('/api/privacy/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.get('email'),
          requestType: formData.get('requestType'),
          details: formData.get('details'),
        }),
      })
      const result = await response.json()
      if (response.ok) {
        setIsSuccess(true)
        setMessage(`تم تسجيل طلبك بنجاح برقم مرجعي: ${result.request.id}. سنتواصل معك بعد التحقق من الهوية.`)
      } else {
        setIsSuccess(false)
        setMessage(result.error || 'تعذر تسجيل الطلب، يرجى المحاولة لاحقاً.')
      }
    } catch {
      setIsSuccess(false)
      setMessage('حدث خطأ في الاتصال بالخادم، يرجى المحاولة لاحقاً.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7F5] font-sans text-[#1B281F]" dir="rtl">
      <LandingHeader />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#566A5C]">
          <Link href="/" className="hover:text-[#1F7A46]">الرئيسية</Link>
          <span>/</span>
          <Link href="/privacy" className="hover:text-[#1F7A46]">سياسة الخصوصية</Link>
          <span>/</span>
          <span className="text-[#1B281F] font-bold">طلب صاحب البيانات</span>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] border border-[#CCD8CE] text-[#1F7A46] text-xs font-bold">
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>نظام حماية البيانات الشخصية السعودي</span>
          </div>
          <h1 className="text-3xl font-black text-[#1B281F] font-heading">
            طلب ممارسة حقوق صاحب البيانات
          </h1>
          <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
            وفق أحكام نظام حماية البيانات الشخصية، نتحقق من هوية مقدم الطلب قبل الإفصاح عن البيانات أو تعديلها أو إتلافها. المدة النظامية المعتادة للرد هي 30 يوماً.
          </p>
        </div>

        {/* Form Container Card */}
        <div className="bg-white rounded-2xl border border-[#CCD8CE] p-6 sm:p-8 shadow-xs">
          <form action={submit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#1B281F] mb-1.5">
                البريد الإلكتروني المسجل <span className="text-rose-600">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="name@example.com"
                dir="ltr"
                className="w-full text-sm bg-white border border-[#CCD8CE] rounded-xl px-4 py-3 text-[#1B281F] focus:outline-hidden focus:border-[#1F7A46] focus:ring-1 focus:ring-[#1F7A46] transition-all placeholder:text-[#566A5C]/60"
              />
            </div>

            <div>
              <label htmlFor="requestType" className="block text-xs font-bold text-[#1B281F] mb-1.5">
                نوع الحق المطلوب ممارسته <span className="text-rose-600">*</span>
              </label>
              <select
                id="requestType"
                name="requestType"
                required
                className="w-full text-sm bg-white border border-[#CCD8CE] rounded-xl px-4 py-3 text-[#1B281F] focus:outline-hidden focus:border-[#1F7A46] focus:ring-1 focus:ring-[#1F7A46] transition-all"
              >
                <option value="access">طلب العلم والوصول إلى البيانات الشخصية</option>
                <option value="copy">طلب الحصول على نسخة مقروءة من البيانات</option>
                <option value="correction">طلب تصحيح أو إكمال البيانات</option>
                <option value="destruction">طلب إتلاف البيانات الشخصية</option>
                <option value="consent_withdrawal">سحب الموافقة على المعالجة</option>
                <option value="complaint">تقديم شكوى تتعلق بحماية الخصوصية</option>
              </select>
            </div>

            <div>
              <label htmlFor="details" className="block text-xs font-bold text-[#1B281F] mb-1.5">
                تفاصيل الطلب ومبرراته
              </label>
              <textarea
                id="details"
                name="details"
                maxLength={4000}
                rows={4}
                placeholder="يرجى ذكر أي معلومات إضافية تساعد في التحقق من هويتك وتحديد البيانات المعنية بدقة..."
                className="w-full text-sm bg-white border border-[#CCD8CE] rounded-xl px-4 py-3 text-[#1B281F] focus:outline-hidden focus:border-[#1F7A46] focus:ring-1 focus:ring-[#1F7A46] transition-all placeholder:text-[#566A5C]/60"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#1F7A46] hover:bg-[#165a33] text-white font-bold text-sm py-3.5 px-6 rounded-xl transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'جاري الإرسال والتحقق...' : 'إرسال الطلب رسمياً'}</span>
            </button>
          </form>

          {message && (
            <div
              className={`mt-6 p-4 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${
                isSuccess
                  ? 'bg-[#E8EFE9] border-[#CCD8CE] text-[#1F7A46]'
                  : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}
              role="status"
            >
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-[#1F7A46]" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              )}
              <div className="leading-relaxed">{message}</div>
            </div>
          )}
        </div>

        {/* Back navigation */}
        <div className="pt-2">
          <Link href="/privacy" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4 rotate-180" /> العودة لسياسة الخصوصية
          </Link>
        </div>
      </main>

      <LandingFooter />
    </div>
  )
}
