'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Scale, Mail, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)
  const [loading, setLoading] = useState(false)
  const [devResetUrl, setDevResetUrl] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setIsError(false)
    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await response.json().catch(() => ({}))
      setDevResetUrl(data.devResetUrl || '')
      setIsError(!response.ok)
      setMessage(
        response.ok
          ? data.message || 'إذا كان الحساب موجوداً فسيصل رابط إعادة التعيين إلى بريدك الإلكتروني.'
          : data.error || 'تعذر إرسال الطلب. يرجى المحاولة لاحقاً.',
      )
    } catch {
      setIsError(true)
      setMessage('تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F5] p-4 font-sans text-[#1B281F]" dir="rtl">
      <main className="w-full max-w-md bg-white border border-[#CCD8CE] rounded-3xl shadow-sm p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
            <div className="bg-[#1F7A46] p-2 rounded-xl text-white">
              <Scale className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-xl font-black text-[#1B281F] font-heading">سَنَد</span>
          </Link>
          <Link href="/login" className="text-xs font-bold text-[#1F7A46] hover:underline inline-flex items-center gap-1">
            العودة لتسجيل الدخول <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-[#1B281F] font-heading">نسيت كلمة المرور</h1>
          <p className="text-xs text-[#566A5C] leading-relaxed">
            أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً آمناً ومؤقتاً لإعادة تعيين كلمة المرور.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="forgot-email" className="text-xs font-bold text-[#1B281F] block">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 h-4 w-4 text-[#566A5C]" aria-hidden="true" />
              <Input
                id="forgot-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@lawfirm.sa"
                className="bg-[#F5F7F5] border-[#CCD8CE] text-[#1B281F] pl-4 pr-10 h-11 text-xs focus-visible:ring-[#1F7A46]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            {loading ? 'جارٍ الإرسال...' : 'إرسال رابط آمن'}
          </Button>
        </form>

        {message && (
          <div
            role="status"
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 leading-relaxed ${
              isError
                ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
                : 'bg-[#E8EFE9] border-[#CCD8CE] text-[#1B281F]'
            }`}
          >
            {isError ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
            ) : (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1F7A46] mt-0.5" />
            )}
            <span>{message}</span>
          </div>
        )}

        {devResetUrl && (
          <a href={devResetUrl} className="block break-all text-xs text-[#D97706] underline font-mono">
            فتح رابط التجربة
          </a>
        )}

        <div className="pt-4 border-t border-[#CCD8CE] flex items-center justify-between text-[11px] text-[#566A5C]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1F7A46]" />
            روابط الاستعادة مشفرة ومؤقتة
          </span>
          <Link href="/register" className="text-[#1F7A46] font-bold hover:underline">
            إنشاء حساب جديد
          </Link>
        </div>
      </main>
    </div>
  )
}
