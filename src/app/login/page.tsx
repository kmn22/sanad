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
  Sparkles,
  Building2,
  Globe,
  CheckCircle2,
  KeyRound,
} from 'lucide-react'
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

type AuthMethod = 'password' | 'magic' | 'sso'
type AuthLocale = 'ar' | 'en'

export default function LoginPage() {
  const [authMethod, setAuthMethod] = useState<AuthMethod>('password')
  const [locale, setLocale] = useState<AuthLocale>('ar')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [ssoDomain, setSsoDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [magicSentMsg, setMagicSentMsg] = useState('')
  const [devMagicUrl, setDevMagicUrl] = useState('')

  const isAr = locale === 'ar'

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

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setMagicSentMsg('')
    setDevMagicUrl('')

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('الرجاء إدخال بريد إلكتروني صحيح لإرسال الرابط السحري')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/magic-link/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setErrorMsg(data.error || 'تعذر إرسال الرابط السحري')
      } else {
        setMagicSentMsg(
          data.message || 'تم إرسال رابط الدخول السحري (Magic Link) إلى بريدك الإلكتروني.',
        )
        if (data.devMagicUrl) setDevMagicUrl(data.devMagicUrl)
        toast.success('تم إرسال رابط الدخول السحري')
      }
    } catch {
      setErrorMsg('تعذر الاتصال بالخادم لإرسال الرابط السحري.')
    } finally {
      setLoading(false)
    }
  }

  const handleSsoRedirect = (providerName: string) => {
    setErrorMsg('')
    if (providerName === 'enterprise_saml' && !ssoDomain.trim()) {
      setErrorMsg('الرجاء إدخال نطاق المنشأة (مثال: company.com.sa) لبدء الدخول الموحد SSO')
      return
    }
    toast.info(`جارٍ تهيئة بوابة الدخول الموحد (${providerName === 'nafath' ? 'النفاذ الوطني الموحد' : ssoDomain})...`)
    setMagicSentMsg(
      providerName === 'nafath'
        ? 'تم إرسال طلب المصادقة لبوابة النفاذ الوطني الموحد (IAM) — يرجى استكمال التحقق المؤسسي.'
        : `تم التحقق من نطاق المنشأة (${ssoDomain}) — بانتظار استجابة مزود الهوية الموحدة (SAML 2.0 / OIDC).`,
    )
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-[#F5F7F5] p-3 sm:p-6 font-sans relative"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Responsive Mobile & Desktop Top Bar with Brand + Language Toggle (AR/EN) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-1">
        <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity">
          <div className="bg-[#1F7A46] p-2 rounded-xl text-white">
            <Scale className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-lg font-black text-[#1B281F] font-heading">مقر</span>
            <span className="text-[11px] text-[#566A5C] mr-2 hidden sm:inline">
              المقر الرقمي للعمليات القانونية والحوكمة
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            data-testid="auth-language-toggle"
            onClick={() => setLocale(isAr ? 'en' : 'ar')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#CCD8CE] text-xs font-bold text-[#1B281F] hover:border-[#1F7A46] transition-all cursor-pointer shadow-2xs"
            aria-label="تبديل اللغة العربية أو الإنجليزية"
          >
            <Globe className="w-3.5 h-3.5 text-[#1F7A46]" />
            <span>{isAr ? 'AR | EN' : 'EN | AR'}</span>
          </button>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white border border-[#CCD8CE] rounded-3xl shadow-sm overflow-hidden relative z-10">
        {/* Left Side: Institutional Branding */}
        <div className="hidden md:flex flex-col justify-between p-10 bg-[#E8EFE9] border-l border-[#CCD8CE]">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-8 hover:opacity-85 transition-opacity w-fit">
              <div className="bg-[#1F7A46] p-2.5 rounded-xl text-white">
                <Scale className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <span className="text-2xl font-black text-[#1B281F] font-heading block">مقر</span>
                <span className="text-[11px] text-[#34543F] font-bold">
                  المقر الرقمي للعمليات القانونية والحوكمة
                </span>
              </div>
            </Link>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-[#1B281F] font-heading leading-tight mb-4">
              {isAr ? (
                <>
                  المقر الرقمي للعمليات القانونية <br />
                  <span className="text-[#1F7A46]">والحوكمة المؤسسية</span>
                </>
              ) : (
                <>
                  Digital Headquarters for <br />
                  <span className="text-[#1F7A46]">Legal Operations & Governance</span>
                </>
              )}
            </h2>
            <p className="text-[#4A5D50] text-xs sm:text-sm leading-relaxed mb-6">
              {isAr
                ? 'سجّل الدخول لإدارة دورة حياة العقود المؤسسية (CLM)، متابعة القضايا والمواعيد القضائية، أو الوصول إلى بنك السوابق القضائية والأنظمة السعودية.'
                : 'Sign in to manage enterprise contract lifecycles (CLM), track court litigation deadlines, or access the Saudi Precedent Bank.'}
            </p>

            <div className="space-y-2 text-xs text-[#1B281F] font-semibold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A46]" />
                <span>دخول بالبريد وكلمة المرور أو التحقق بخطوتين (2FA)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A46]" />
                <span>رابط الدخول السحري الفوري (Magic Link)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#1F7A46]" />
                <span>الدخول الموحد للمنشآت (SSO / SAML & النفاذ الموحد)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#566A5C] font-medium pt-8 border-t border-[#CCD8CE]">
            <ShieldCheck className="w-4 h-4 text-[#1F7A46] shrink-0" />
            <span>بيئة معزولة • متوافق مع نظام حماية البيانات الشخصية (PDPL)</span>
          </div>
        </div>

        {/* Right Side: Responsive Login Form (Email/Password, Magic Link, SSO) */}
        <div className="p-6 sm:p-10 flex flex-col justify-center">
          <div className="mb-5 text-center md:text-right">
            <h1 className="text-2xl font-bold text-[#1B281F] font-heading mb-1">
              {isAr ? 'تسجيل الدخول' : 'Sign In to Maqar'}
            </h1>
            <p className="text-xs text-[#566A5C]">
              {isAr
                ? 'اختر وسيلة الدخول للوصول إلى مساحة العمل الخاصة بك'
                : 'Choose your authentication method to access your workspace'}
            </p>
          </div>

          {/* Auth Method Selector Tabs: Password | Magic Link | SSO */}
          <div
            role="tablist"
            aria-label="طرق تسجيل الدخول"
            className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#F5F7F5] border border-[#CCD8CE] mb-5 text-xs"
          >
            <button
              type="button"
              role="tab"
              aria-selected={authMethod === 'password'}
              data-testid="auth-tab-password"
              onClick={() => {
                setAuthMethod('password')
                setErrorMsg('')
                setMagicSentMsg('')
              }}
              className={`py-2 px-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                authMethod === 'password'
                  ? 'bg-white text-[#1F7A46] shadow-2xs border border-[#CCD8CE]'
                  : 'text-[#4A5D50] hover:text-[#1B281F]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isAr ? 'كلمة المرور' : 'Password'}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMethod === 'magic'}
              data-testid="auth-tab-magic"
              onClick={() => {
                setAuthMethod('magic')
                setErrorMsg('')
                setMagicSentMsg('')
              }}
              className={`py-2 px-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                authMethod === 'magic'
                  ? 'bg-white text-[#1F7A46] shadow-2xs border border-[#CCD8CE]'
                  : 'text-[#4A5D50] hover:text-[#1B281F]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isAr ? 'الرابط السحري' : 'Magic Link'}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authMethod === 'sso'}
              data-testid="auth-tab-sso"
              onClick={() => {
                setAuthMethod('sso')
                setErrorMsg('')
                setMagicSentMsg('')
              }}
              className={`py-2 px-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                authMethod === 'sso'
                  ? 'bg-white text-[#1F7A46] shadow-2xs border border-[#CCD8CE]'
                  : 'text-[#4A5D50] hover:text-[#1B281F]'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{isAr ? 'الدخول الموحد SSO' : 'SSO / Unified'}</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#DC2626]" />
              <span>{errorMsg}</span>
            </div>
          )}

          {magicSentMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-[#E8EFE9] border border-[#CCD8CE] text-[#1B281F] text-xs space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#1F7A46] mt-0.5" />
                <span>{magicSentMsg}</span>
              </div>
              {devMagicUrl && (
                <a
                  href={devMagicUrl}
                  className="block text-[11px] font-mono text-[#1F7A46] underline break-all"
                >
                  (وضع التطوير) فتح رابط الدخول السحري مباشرة
                </a>
              )}
            </div>
          )}

          {/* Method 1: Email & Password (always rendered in DOM or active tab) */}
          {authMethod === 'password' && (
            <form onSubmit={handleLogin} noValidate className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="login-email" className="text-xs font-bold text-[#1B281F]">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
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
                  {isAr ? 'رمز التحقق بخطوتين (عند تفعيله)' : 'Two-Factor OTP (if enabled)'}
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
          )}

          {/* Method 2: Passwordless Magic Link */}
          {authMethod === 'magic' && (
            <form onSubmit={handleMagicLink} noValidate className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#F5F7F5] border border-[#CCD8CE] text-xs text-[#4A5D50] leading-relaxed">
                أدخل بريدك الإلكتروني المسجل وسنرسل لك <strong>رابط دخول سحري (Magic Link)</strong> مشفراً صالحاً لمرة واحدة للدخول بدون كلمة مرور.
              </div>
              <div className="space-y-1.5">
                <label htmlFor="magic-email" className="text-xs font-bold text-[#1B281F]">
                  البريد الإلكتروني المهني أو الجامعي
                </label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-[#566A5C]" aria-hidden="true" />
                  <Input
                    id="magic-email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@company.sa"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#F5F7F5] border-[#CCD8CE] text-[#1B281F] pl-4 pr-10 h-11 text-xs focus-visible:ring-[#1F7A46]"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 ml-1.5" />
                {loading ? 'جارٍ إرسال الرابط السحري...' : 'إرسال رابط الدخول السحري (Magic Link)'}
              </Button>
            </form>
          )}

          {/* Method 3: SSO / Unified Login */}
          {authMethod === 'sso' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="sso-domain" className="text-xs font-bold text-[#1B281F] block">
                  نطاق المنشأة للدخول الموحد (Enterprise SAML 2.0 / OIDC)
                </label>
                <div className="flex gap-2">
                  <Input
                    id="sso-domain"
                    type="text"
                    placeholder="company.com.sa"
                    value={ssoDomain}
                    onChange={(e) => setSsoDomain(e.target.value)}
                    className="bg-[#F5F7F5] border-[#CCD8CE] text-[#1B281F] h-10 text-xs focus-visible:ring-[#1F7A46]"
                  />
                  <Button
                    type="button"
                    onClick={() => handleSsoRedirect('enterprise_saml')}
                    className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold h-10 px-4 shrink-0 cursor-pointer"
                  >
                    متابعة SSO
                  </Button>
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#CCD8CE]" />
                <span className="flex-shrink mx-3 text-[11px] text-[#566A5C]">أو عبر الهوية الموحدة</span>
                <div className="flex-grow border-t border-[#CCD8CE]" />
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => handleSsoRedirect('nafath')}
                className="w-full h-11 border-[#CCD8CE] bg-[#F5F7F5] hover:bg-[#E8EFE9] text-[#1B281F] text-xs font-bold cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-[#1F7A46]" />
                <span>الدخول عبر النفاذ الوطني الموحد (Unified Login)</span>
              </Button>
            </div>
          )}

          {/* Quick Unified Login Bar below Password mode */}
          {authMethod === 'password' && (
            <div className="mt-4 pt-4 border-t border-[#CCD8CE]/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setAuthMethod('magic')}
                className="text-[#1F7A46] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>الدخول بالرابط السحري (Magic Link)</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('sso')}
                className="text-[#4A5D50] hover:text-[#1B281F] font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-[#1F7A46]" />
                <span>الدخول الموحد للمنشآت (SSO)</span>
              </button>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-[#CCD8CE] text-center space-y-1.5">
            <p className="text-xs text-[#566A5C]">
              {isAr ? 'ليس لديك حساب بعد؟' : "Don't have an account?"}{' '}
              <Link href="/signup" className="text-[#1F7A46] hover:underline font-bold">
                {isAr ? 'إنشاء حساب جديد' : 'Create an account'}
              </Link>
            </p>
            <p className="text-[11px] text-[#566A5C]">
              <Link href="/onboarding" className="text-[#4A5D50] hover:text-[#1F7A46] underline">
                {isAr ? 'أو انتقل إلى معالج التهيئة السريعة (/onboarding)' : 'Or launch quick setup wizard (/onboarding)'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
