'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scale, ArrowLeft, ShieldCheck, Mail, Lock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

/**
 * Resolve the post-login destination from `?callbackUrl=`.
 * Only local, single-slash paths are allowed — absolute URLs (`https://evil.com`)
 * and protocol-relative ones (`//evil.com`, `/\evil.com`) fall back to /dashboard
 * so the parameter can't be used as an open redirect.
 */
function safeCallbackUrl(): string {
  if (typeof window === 'undefined') return '/dashboard'
  const raw = new URLSearchParams(window.location.search).get('callbackUrl')
  if (!raw || !raw.startsWith('/')) return '/dashboard'
  if (raw.length > 1 && (raw[1] === '/' || raw[1] === '\\')) return '/dashboard'
  return raw
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    if (!email.trim()) {
      setErrorMsg('الرجاء إدخال البريد الإلكتروني')
      setLoading(false)
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg('صيغة البريد الإلكتروني غير صحيحة (مثال: name@lawfirm.sa)')
      setLoading(false)
      return
    }

    if (!password) {
      setErrorMsg('الرجاء إدخال كلمة المرور')
      setLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password: password,
        otp: otp.trim(),
        redirect: false,
      })

      if (result?.error) {
        setErrorMsg('بيانات الدخول غير صحيحة. تأكد من البريد وكلمة المرور.')
        toast.error('بيانات الدخول غير صحيحة')
        setLoading(false)
        return
      }

      toast.success('تم تسجيل الدخول بنجاح')
      window.location.assign(safeCallbackUrl())
    } catch (e) {
      console.warn('NextAuth sign in error:', e)
      setErrorMsg('حدث خطأ أثناء تسجيل الدخول. حاول مجدداً.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F5] p-4 font-sans relative" dir="rtl">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white border border-[#CCD8CE] rounded-3xl shadow-sm overflow-hidden relative z-10">
        
        {/* Left Side: Institutional Branding */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-[#E8EFE9] border-l border-[#CCD8CE]">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-10 hover:opacity-85 transition-opacity w-fit">
              <div className="bg-[#1F7A46] p-2.5 rounded-xl text-white">
                <Scale className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-2xl font-black text-[#1B281F] font-heading">سَنَد</span>
            </Link>

            <h2 className="text-3xl font-extrabold text-[#1B281F] font-heading leading-tight mb-4">
              مساعد الصياغة الممتثلة <br />
              <span className="text-[#1F7A46]">للأنظمة السعودية</span>
            </h2>
            <p className="text-[#4A5D50] text-sm leading-relaxed">
              سجل الدخول لإدارة مسوداتك القانونية، فحص العقود فورياً مقابل نظام العمل والمعاملات المدنية، ومتابعة قضايا مكتبك.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#566A5C] font-medium pt-8 border-t border-[#CCD8CE]">
            <ShieldCheck className="w-4 h-4 text-[#1F7A46]" />
            <span>بيئة معزولة • متوافق مع نظام حماية البيانات الشخصية (PDPL)</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-8 text-center md:text-right">
            <h1 className="text-2xl font-bold text-[#1B281F] font-heading mb-1">تسجيل الدخول</h1>
            <p className="text-xs text-[#566A5C]">أدخل بيانات اعتمادك للوصول إلى مساحة العمل</p>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-bold text-[#1B281F]">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-[#566A5C]" aria-hidden="true" />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  aria-label="البريد الإلكتروني"
                  placeholder="name@lawfirm.sa"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  className="bg-[#F5F7F5] border-[#CCD8CE] text-[#1B281F] placeholder:text-[#566A5C]/60 pl-4 pr-10 h-11 text-xs focus-visible:ring-[#1F7A46]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="login-password" className="text-xs font-bold text-[#1B281F]">
                  كلمة المرور
                </label>
                <Link href="/forgot-password" className="text-xs text-[#1F7A46] hover:underline">نسيت كلمة المرور؟</Link>
              </div>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-[#566A5C]" aria-hidden="true" />
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  aria-label="كلمة المرور"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errorMsg) setErrorMsg('')
                  }}
                  className="bg-[#F5F7F5] border-[#CCD8CE] text-[#1B281F] placeholder:text-[#566A5C]/60 pl-4 pr-10 h-11 text-xs focus-visible:ring-[#1F7A46]"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-otp" className="text-xs font-bold text-[#1B281F]">
                رمز التحقق بخطوتين (عند تفعيله)
              </label>
              <Input
                id="login-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label="رمز التحقق بخطوتين"
                placeholder="123456 أو رمز الاسترداد"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={16}
                className="bg-[#F5F7F5] border-[#CCD8CE] text-[#1B281F] placeholder:text-[#566A5C]/60 h-11 text-xs focus-visible:ring-[#1F7A46]"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 mt-2 bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold shadow-xs transition-all cursor-pointer" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  جاري التحقق...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  تسجيل الدخول
                  <ArrowLeft className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#CCD8CE] text-center">
            <p className="text-xs text-[#566A5C]">
              ليس لديك حساب بعد؟{' '}
              <Link href="/register" className="text-[#1F7A46] hover:underline font-bold">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
