'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Scale, MailCheck, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  const [message, setMessage] = useState('جاري التحقق...')
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token')
    if (!token) {
      setStatus('error')
      setMessage('رابط التحقق غير صالح')
      return
    }
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => ({ ok: response.ok, body: await response.json().catch(() => ({})) }))
      .then(({ ok, body }) => {
        setStatus(ok ? 'ok' : 'error')
        setMessage(ok ? 'تم تأكيد البريد الإلكتروني بنجاح.' : body.error || 'تعذر التحقق')
      })
      .catch(() => {
        setStatus('error')
        setMessage('تعذر التحقق')
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F5] p-4 font-sans text-[#1B281F]" dir="rtl">
      <main className="w-full max-w-md bg-white border border-[#CCD8CE] rounded-3xl shadow-sm p-8 text-center space-y-5">
        <Link href="/" className="inline-flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          <div className="bg-[#1F7A46] p-2 rounded-xl text-white">
            <Scale className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span className="text-xl font-black text-[#1B281F] font-heading">سَنَد</span>
        </Link>

        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#E8EFE9] border border-[#CCD8CE] grid place-items-center">
          {status === 'error' ? (
            <AlertCircle className="h-7 w-7 text-[#DC2626]" />
          ) : (
            <MailCheck className="h-7 w-7 text-[#1F7A46]" />
          )}
        </div>

        <h1 className="text-2xl font-bold text-[#1B281F] font-heading">تأكيد البريد الإلكتروني</h1>
        <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed" role="status">
          {message}
        </p>

        <div className="pt-2">
          <Button asChild className="bg-[#1F7A46] hover:bg-[#165832] text-white font-bold h-11 text-xs px-6">
            <Link href="/login">
              تسجيل الدخول <ArrowLeft className="w-4 h-4 mr-1.5" />
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
