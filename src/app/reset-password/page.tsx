'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Scale, Lock, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasToken, setHasToken] = useState(true)

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')
    setHasToken(Boolean(token))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) {
      setIsSuccess(false)
      setMessage('رابط إعادة التعيين غير مكتمل أو مفقود. يرجى طلب رابط جديد.')
      return
    }
    if (password.length < 12 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setIsSuccess(false)
      setMessage('كلمة المرور يجب أن تكون 12 خانة على الأقل وتحتوي على حروف وأرقام.')
      return
    }
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/api/auth/password-reset/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const result = await response.json().catch(() => ({}))
      setIsSuccess(response.ok)
      setMessage(response.ok ? 'تم تغيير كلمة المرور. يمكنك تسجيل الدخول الآن.' : result.error || 'تعذر تغيير كلمة المرور')
    } catch {
      setIsSuccess(false)
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
            تسجيل الدخول <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-[#1B281F] font-heading">إعادة تعيين كلمة المرور</h1>
          <p className="text-xs text-[#566A5C] leading-relaxed">
            أدخل كلمة مرور جديدة قوية لا تقل عن 12 خانة وتحتوي على حروف وأرقام.
          </p>
        </div>

        {!hasToken && (
          <div className="p-3.5 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs leading-relaxed">
            لم يتم العثور على رمز التحقق في الرابط. يمكنك{' '}
            <Link href="/forgot-password" className="font-bold underline">
              طلب رابط استعادة جديد
            </Link>
            .
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reset-password" className="text-xs font-bold text-[#1B281F] block">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-4 w-4 text-[#566A5C]" aria-hidden="true" />
              <Input
                id="reset-password"
                type="password"
                required
                minLength={12}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="12 خانة مع حروف وأرقام"
                className="bg-[#F5F7F5] border-[#CCD8CE] text-[#1B281F] pl-4 pr-10 h-11 text-xs focus-visible:ring-[#1F7A46]"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            {loading ? 'جارٍ الحفظ...' : 'حفظ كلمة المرور'}
          </Button>
        </form>

        {message && (
          <div
            role="status"
            className={`p-3.5 rounded-xl border text-xs flex items-start gap-2 leading-relaxed ${
              isSuccess
                ? 'bg-[#E8EFE9] border-[#CCD8CE] text-[#1B281F]'
                : 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1F7A46] mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626] mt-0.5" />
            )}
            <span>{message}</span>
          </div>
        )}
      </main>
    </div>
  )
}
