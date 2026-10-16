'use client'

import Link from 'next/link'
import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { PRIVACY_NOTICE_VERSION } from '@/lib/privacy-version'
import { Scale, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AcceptPrivacyPage() {
  const [accepted, setAccepted] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    const response = await fetch('/api/privacy/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ version: PRIVACY_NOTICE_VERSION, accept: accepted }),
    })
    const result = await response.json().catch(() => ({}))
    setLoading(false)
    if (!response.ok) return setMessage(result.error || 'تعذر حفظ الإقرار')
    setMessage('تم حفظ الإقرار. يرجى تسجيل الدخول مجدداً لتحديث الجلسة.')
    await signOut({ callbackUrl: '/login?privacyAccepted=1' })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F5] p-4 font-sans text-[#1B281F]" dir="rtl">
      <main className="w-full max-w-xl bg-white border border-[#CCD8CE] rounded-3xl shadow-sm p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="bg-[#1F7A46] p-2 rounded-xl text-white">
              <Scale className="w-5 h-5 stroke-[2.2]" />
            </div>
            <span className="text-xl font-black text-[#1B281F] font-heading">سَنَد</span>
          </Link>
          <span className="inline-flex items-center gap-1 text-xs text-[#1F7A46] bg-[#E8EFE9] px-2.5 py-1 rounded-full font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> إصدار {PRIVACY_NOTICE_VERSION}
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold mb-1 font-heading">تحديث إشعار الخصوصية</h1>
          <p className="text-xs sm:text-sm text-[#4A5D50] leading-relaxed">
            يلزم الإقرار بالإصدار الحالي قبل متابعة استخدام المنصة. اقرأ{' '}
            <Link href="/privacy" className="text-[#1F7A46] font-bold underline">
              سياسة الخصوصية
            </Link>{' '}
            و
            <Link href="/terms" className="text-[#1F7A46] font-bold underline">
              شروط الاستخدام
            </Link>
            .
          </p>
        </div>

        <label className="flex items-start gap-3 p-4 rounded-xl bg-[#F5F7F5] border border-[#CCD8CE] text-xs sm:text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-1 accent-[#1F7A46]"
          />
          <span className="leading-relaxed">
            قرأت إشعار الخصوصية إصدار {PRIVACY_NOTICE_VERSION} وأقر بالعلم بمحتواه. أفهم أن الموافقة الاختيارية، عند طلبها، تكون منفصلة.
          </span>
        </label>

        <Button
          onClick={submit}
          disabled={!accepted || loading}
          className="w-full h-11 bg-[#1F7A46] hover:bg-[#165832] text-white font-bold text-xs cursor-pointer"
        >
          {loading ? 'جارٍ الحفظ...' : 'حفظ ومتابعة'}
        </Button>

        {message && (
          <p className="text-xs text-[#1F7A46] font-medium" role="status">
            {message}
          </p>
        )}
      </main>
    </div>
  )
}
