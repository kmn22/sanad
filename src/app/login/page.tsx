'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Scale,
  ArrowLeft,
  ShieldCheck,
  Mail,
  Lock,
  AlertCircle,
  Globe,
  KeyRound,
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * Resolve the post-login destination from `?callbackUrl=`.
 * Only local, single-slash paths are allowed so the parameter cannot be used
 * as an open redirect.
 */
function safeCallbackUrl(): string {
  if (typeof window === 'undefined') return '/dashboard'
  const raw = new URLSearchParams(window.location.search).get('callbackUrl')
  if (!raw || !raw.startsWith('/')) return '/dashboard'
  if (raw.length > 1 && (raw[1] === '/' || raw[1] === '\\')) return '/dashboard'
  return raw
}

type AuthLocale = 'ar' | 'en'

export default function LoginPage() {
  const [locale, setLocale] = useState<AuthLocale>('ar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const isAr = locale === 'ar'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    if (!email.trim()) {
      setErrorMsg(isAr ? 'الرجاء إدخال البريد الإلكتروني' : 'Please enter your email address')
      setLoading(false)
      return
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorMsg(
        isAr
          ? 'صيغة البريد الإلكتروني غير صحيحة (مثال: name@lawfirm.sa)'
          : 'Invalid email format (example: name@lawfirm.sa)',
      )
      setLoading(false)
      return
    }

    if (!password) {
      setErrorMsg(isAr ? 'الرجاء إدخال كلمة المرور' : 'Please enter your password')
      setLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password: password.trim() || password,
        otp: otp.trim(),
        redirect: false,
      })

      if (result?.error) {
        setErrorMsg(
          isAr
            ? 'بيانات الدخول أو رمز التحقق غير صحيحة.'
            : 'Invalid credentials or verification code.',
        )
        toast.error(isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid login details')
        setLoading(false)
        return
      }

      toast.success(isAr ? 'تم تسجيل الدخول بنجاح' : 'Signed in successfully')
      window.location.assign(safeCallbackUrl())
    } catch (e) {
      console.warn('NextAuth sign in error:', e)
      setErrorMsg(isAr ? 'حدث خطأ أثناء تسجيل الدخول. حاول مجدداً.' : 'Login error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-[#F5F7F5] p-4 sm:p-6 font-sans"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-[#CCD8CE] shadow-sm overflow-hidden">
        {/* Info Panel */}
        <div className="lg:col-span-5 bg-[#165832] text-white p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
                <div className="bg-white/15 p-2 rounded-xl">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-black text-lg block leading-none">مقر</span>
                  <span className="text-[10px] font-mono text-white/75">MAQAR</span>
                </div>
              </Link>
              <button
                type="button"
                data-testid="auth-language-toggle"
                onClick={() => setLocale((l) => (l === 'ar' ? 'en' : 'ar'))}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isAr ? 'EN' : 'عربي'}</span>
              </button>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black font-heading leading-snug">
                {isAr
                  ? 'مرحباً بعودتك إلى مكتبك الرقمي'
                  : 'Welcome back to your digital practice'}
              </h1>
              <p className="text-xs text-white/80 leading-relaxed">
                {isAr
                  ? 'سجّل الدخول لإدارة القضايا والمستندات المشفرة، متابعة انتهاء الوكالات والتراخيص، وإصدار روابط بوابة الموكل.'
                  : 'Sign in to manage your cases, encrypted documents, compliance renewals, and client portal links.'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 border border-white/15 p-4 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{isAr ? 'مصادقة آمنة والتحقق الثنائي' : 'Protected with TOTP 2FA'}</span>
            </div>
            <p className="text-[11px] text-white/80 leading-relaxed">
              {isAr
                ? 'إذا كنت قد فعّلت التحقق الثنائي (TOTP) لحسابك، أدخل الرمز السداسي من تطبيق المصادقة.'
                : 'If TOTP 2FA is active on your account, enter your 6-digit authenticator code.'}
            </p>
          </div>
        </div>

        {/* Form Panel */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1F7A46] mb-1">
              <KeyRound className="w-3.5 h-3.5" />
              <span>{isAr ? 'تسجيل الدخول بالبريد وكلمة المرور' : 'Email & Password Sign In'}</span>
            </div>
            <h2 className="text-xl font-bold text-[#1B281F] font-heading">
              {isAr ? 'دخول الأعضاء' : 'Member Sign In'}
            </h2>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-xs text-[#991B1B] flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-xs font-bold text-[#1B281F]">
                {isAr ? 'البريد الإلكتروني' : 'Email'}
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-4 w-4 text-[#566A5C]" aria-hidden="true" />
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  aria-label={isAr ? 'البريد الإلكتروني' : 'Email'}
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
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <Link href="/forgot-password" className="text-xs text-[#1F7A46] hover:underline">
                  {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-4 w-4 text-[#566A5C]" aria-hidden="true" />
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  aria-label={isAr ? 'كلمة المرور' : 'Password'}
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
                {isAr ? 'رمز التحقق الثنائي (عند تفعيله)' : 'Two-Factor OTP (if enabled)'}
              </label>
              <Input
                id="login-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                aria-label={isAr ? 'رمز التحقق بخطوتين' : 'Two-factor code'}
                placeholder={isAr ? '123456 أو رمز الاسترداد' : '123456 or recovery code'}
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
                  {isAr ? 'جاري التحقق...' : 'Signing in...'}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                  <ArrowLeft className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#CCD8CE] text-center space-y-1.5">
            <p className="text-xs text-[#566A5C]">
              {isAr ? 'ليس لديك حساب بعد؟' : "Don't have an account?"}{' '}
              <Link href="/register" className="text-[#1F7A46] hover:underline font-bold">
                {isAr ? 'أنشئ مساحة مكتبك مجاناً (١٤ يوماً)' : 'Start 14-day free trial'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
