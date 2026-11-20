'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Scale,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Mail,
  Lock,
  User,
  GraduationCap,
  Briefcase,
  Building2,
  MailCheck,
  Check,
  Globe,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { PRIVACY_NOTICE_VERSION } from '@/lib/privacy-version'

type AccountType = 'student' | 'lawyer' | 'firm'
type Invitation = { workspaceName: string; role: string; email: string }

const ACCOUNT_OPTIONS: {
  id: AccountType
  title: string
  desc: string
  icon: typeof GraduationCap
  ring: string
  tile: string
  perks: string[]
}[] = [
  {
    id: 'lawyer',
    title: 'محامٍ مستقل',
    desc: 'صياغة ممتثلة وتدقيق عقود وإدارة قضايا ومحاكم',
    icon: Briefcase,
    ring: 'hover:border-[#1F7A46] data-[on=true]:border-[#1F7A46] data-[on=true]:bg-[#E8EFE9] data-[on=true]:shadow-xs',
    tile: 'bg-[#E8EFE9] text-[#1F7A46] border-[#CCD8CE]',
    perks: ['فحص لحظي للأنظمة', 'حاسبة المواعيد القضائية', 'بوابة الموكل'],
  },
  {
    id: 'firm',
    title: 'مكتب محاماة أو إدارة قانونية',
    desc: 'إدارة القضايا والمحاكم، العقود المؤسسية (CLM)، وصلاحيات الفريق',
    icon: Building2,
    ring: 'hover:border-[#1F7A46] data-[on=true]:border-[#1F7A46] data-[on=true]:bg-[#E8EFE9] data-[on=true]:shadow-xs',
    tile: 'bg-[#E8EFE9] text-[#1F7A46] border-[#CCD8CE]',
    perks: ['إدارة الفريق والصلاحيات', 'حوكمة العقود CLM', 'تقارير الشركاء'],
  },
  {
    id: 'student',
    title: 'طالب قانون أو باحث أكاديمي',
    desc: 'بنك السوابق القضائية والأنظمة والتدريب على الصياغة القضائية',
    icon: GraduationCap,
    ring: 'hover:border-[#1F7A46] data-[on=true]:border-[#1F7A46] data-[on=true]:bg-[#E8EFE9] data-[on=true]:shadow-xs',
    tile: 'bg-[#E8EFE9] text-[#1F7A46] border-[#CCD8CE]',
    perks: ['بنك السوابق والأنظمة', 'بطاقات الاستذكار', 'مجاني للجامعات'],
  },
]

const ROLE_AR: Record<string, string> = {
  lawyer: 'محامٍ',
  staff: 'فريق المكتب',
  student: 'متدرب',
  auditor: 'مدقق',
  client: 'موكّل (بوابة الموكّل)',
}

export default function RegisterPage() {
  const router = useRouter()
  const [locale, setLocale] = useState<'ar' | 'en'>('ar')
  const [step, setStep] = useState<'type' | 'details' | 'done'>('type')
  const [accountType, setAccountType] = useState<AccountType | null>('lawyer')
  const [name, setName] = useState('')
  const [orgName, setOrgName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [inviteToken, setInviteToken] = useState('')
  const [invitation, setInvitation] = useState<Invitation | null>(null)
  const [inviteError, setInviteError] = useState('')
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)
  const [acceptBetaTerms, setAcceptBetaTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [registrationError, setRegistrationError] = useState('')
  const [callbackUrl, setCallbackUrl] = useState('')
  const [doneInfo, setDoneInfo] = useState<{ delivery?: string; devVerifyUrl?: string } | null>(null)

  const isAr = locale === 'ar'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const rawCallback = params.get('callbackUrl') || ''
    if (rawCallback.startsWith('/') && !rawCallback.startsWith('//')) {
      setCallbackUrl(rawCallback)
    }
    const token = params.get('invite') || ''
    const preset =
      params.get('type') ||
      (params.get('plan') === 'firm'
        ? 'firm'
        : params.get('plan') === 'solo'
          ? 'lawyer'
          : params.get('plan') === 'student'
            ? 'student'
            : null)
    if (preset === 'student' || preset === 'lawyer' || preset === 'firm') {
      setAccountType(preset)
      setStep('details')
    }
    if (!token) return
    setInviteToken(token)
    setStep('details')
    fetch(`/api/invitations/preview?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Invalid invitation')
        setInvitation(data)
        setEmail(data.email)
      })
      .catch(() => setInviteError('رابط الدعوة غير صالح أو منتهي الصلاحية.'))
  }, [])

  const selected = ACCOUNT_OPTIONS.find((o) => o.id === accountType)
  const canSubmit = invitation ? true : Boolean(accountType) && !inviteToken

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegistrationError('')

    if (password.length < 12 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setRegistrationError('كلمة المرور يجب أن تكون 12 خانة على الأقل وتحتوي على حروف وأرقام')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          acceptPrivacy,
          acceptBetaTerms,
          privacyNoticeVersion: PRIVACY_NOTICE_VERSION,
          ...(invitation ? { inviteToken } : { accountType, organizationName: orgName.trim() }),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRegistrationError(data.error || 'تعذر إتمام التسجيل. يرجى مراجعة البيانات.')
        toast.error(data.error || 'تعذر إتمام التسجيل. يرجى مراجعة البيانات.')
        setLoading(false)
        return
      }
      if (data.requiresVerification) {
        setDoneInfo({ delivery: data.delivery, devVerifyUrl: data.devVerifyUrl })
        setStep('done')
        setLoading(false)
        return
      }
      toast.success(data.message || 'تم إنشاء الحساب بنجاح!')
      const loginUrl = callbackUrl
        ? `/login?registered=1&callbackUrl=${encodeURIComponent(callbackUrl)}`
        : '/login?registered=1'
      router.push(loginUrl)
    } catch (err) {
      console.error('Registration failed:', err)
      setRegistrationError('تعذر إنشاء الحساب. حاول مجدداً.')
      toast.error('تعذر إنشاء الحساب. حاول مجدداً.')
      setLoading(false)
    }
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

        <button
          type="button"
          data-testid="signup-language-toggle"
          onClick={() => setLocale(isAr ? 'en' : 'ar')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#CCD8CE] text-xs font-bold text-[#1B281F] hover:border-[#1F7A46] transition-all cursor-pointer shadow-2xs"
          aria-label="تبديل اللغة العربية أو الإنجليزية"
        >
          <Globe className="w-3.5 h-3.5 text-[#1F7A46]" />
          <span>{isAr ? 'AR | EN' : 'EN | AR'}</span>
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 bg-white border border-[#CCD8CE] rounded-3xl shadow-sm overflow-hidden relative z-10">
        {/* Branding Side */}
        <div className="hidden md:flex md:col-span-2 flex-col justify-between p-10 bg-[#E8EFE9] border-l border-[#CCD8CE] relative">
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
            <h1 className="text-2xl font-extrabold text-[#1B281F] font-heading leading-tight mb-4">
              {isAr ? (
                <>
                  المقر الرقمي للعمليات القانونية <br />
                  <span className="text-[#1F7A46]">والحوكمة في المملكة</span>
                </>
              ) : (
                <>
                  Digital HQ for Legal Operations <br />
                  <span className="text-[#1F7A46]">& Corporate Governance</span>
                </>
              )}
            </h1>
            <p className="text-[#4A5D50] text-xs leading-relaxed mb-6">
              {isAr
                ? 'أنشئ مساحة عملك السيادية اليوم وابدأ إدارة العقود والقضايا والأبحاث النظامية في بيئة معزولة.'
                : 'Create your sovereign workspace today to manage contracts, court cases, and statutory research.'}
            </p>
            <ul className="space-y-2.5 text-xs text-[#1B281F] font-medium">
              <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-[#1F7A46]" /> حوكمة العقود للشركات (CLM)</li>
              <li className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-[#1F7A46]" /> إدارة المحاكم لمكاتب المحاماة</li>
              <li className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-[#1F7A46]" /> بنك السوابق للباحثين والطلاب</li>
              <li className="flex items-center gap-2"><User className="h-4 w-4 text-[#1F7A46]" /> بوابة الموكل السيادية المشفرة</li>
            </ul>
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-[#566A5C] font-medium pt-4 border-t border-[#CCD8CE]">
            <ShieldCheck className="w-4 h-4 text-[#1F7A46]" />
            <span>بياناتك معزولة ومحلية بالكامل داخل المملكة</span>
          </div>
        </div>

        {/* Form side */}
        <div className="md:col-span-3 p-6 sm:p-10 flex flex-col justify-center">
          {step === 'done' ? (
            <div className="text-center space-y-4 animate-in fade-in-0 zoom-in-95 duration-200">
              <div className="mx-auto h-14 w-14 rounded-2xl bg-[#E8EFE9] border border-[#CCD8CE] grid place-items-center">
                <MailCheck className="h-7 w-7 text-[#1F7A46]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1B281F] font-heading">تحقّق من بريدك الإلكتروني</h2>
              <p className="text-[#4A5D50] text-xs sm:text-sm leading-relaxed max-w-sm mx-auto">
                أنشأنا مساحة العمل الخاصة بك في «مقر».{' '}
                {doneInfo?.delivery === 'email'
                  ? `أرسلنا رسالة تفعيل عربية منسقة إلى ${email}.`
                  : 'يلزم تأكيد البريد الإلكتروني عبر الرابط المشفر قبل تسجيل الدخول.'}
              </p>

              {/* Styled Arabic Transactional Email Preview Card */}
              <div className="text-right rounded-2xl border border-[#CCD8CE] bg-[#F5F7F5] p-4 text-xs space-y-2 max-w-md mx-auto">
                <div className="flex items-center justify-between border-b border-[#CCD8CE] pb-2">
                  <span className="font-bold text-[#1F7A46]">قالب رسالة التفعيل الرسمية — مقر</span>
                  <span className="text-[10px] font-mono text-[#566A5C]">PDPL Verified</span>
                </div>
                <p className="text-[#1B281F] font-semibold">الموضوع: تأكيد البريد الإلكتروني — مقر</p>
                <p className="text-[#4A5D50] leading-relaxed">
                  شكراً لتسجيلك في منظومة «مقر» — المقر الرقمي للعمليات القانونية والحوكمة. يرجى تأكيد بريدك الإلكتروني لتفعيل حسابك.
                </p>
                {doneInfo?.devVerifyUrl && (
                  <a
                    href={doneInfo.devVerifyUrl}
                    className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-lg bg-[#1F7A46] text-white text-xs font-bold"
                    id="dev-verify-link"
                  >
                    (وضع التطوير) فعّل الحساب مباشرة ←
                  </a>
                )}
              </div>

              <Button asChild className="bg-[#1F7A46] hover:bg-[#165832] text-white font-bold h-10 text-xs px-6">
                <Link
                  href={
                    callbackUrl
                      ? `/login?registered=1&callbackUrl=${encodeURIComponent(callbackUrl)}`
                      : '/login'
                  }
                >
                  الذهاب لتسجيل الدخول
                </Link>
              </Button>
            </div>
          ) : step === 'type' ? (
            <div className="animate-in fade-in-0 duration-200">
              <h2 className="text-2xl font-bold text-[#1B281F] font-heading mb-1">
                {isAr ? 'اختر نوع حسابك' : 'Select Your Account Type'}
              </h2>
              <p className="text-[#566A5C] text-xs mb-5">
                {isAr
                  ? 'حدد دورك لتهيئة مساحة العمل المناسبة لاحتياجاتك في «مقر»'
                  : 'Choose your persona to configure your Maqar workspace'}
              </p>
              <div className="space-y-3">
                {ACCOUNT_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    id={`account-type-${o.id}`}
                    type="button"
                    data-on={accountType === o.id}
                    onClick={() => setAccountType(o.id)}
                    className={`w-full text-start flex items-start gap-3.5 p-3.5 rounded-xl border border-[#CCD8CE] bg-white transition-all hover:border-[#1F7A46] cursor-pointer shadow-2xs ${o.ring}`}
                  >
                    <div className={`h-10 w-10 rounded-lg border grid place-items-center shrink-0 ${o.tile}`}>
                      <o.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-[#1B281F]">{o.title}</p>
                        {accountType === o.id && <Check className="h-4 w-4 text-[#1F7A46]" />}
                      </div>
                      <p className="text-[11px] text-[#4A5D50] mt-0.5">{o.desc}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {o.perks.map((p) => (
                          <span key={p} className="text-[10px] px-2 py-0.5 rounded-md bg-[#F5F7F5] text-[#1B281F] border border-[#CCD8CE]">{p}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-[#566A5C] mt-4">
                هل أنت موكّل؟ اطلب من مكتب المحاماة إرسال دعوة مشفرة إلى بوابة الموكل مباشرة.
              </p>
              <Button
                id="account-type-continue"
                disabled={!accountType}
                onClick={() => setStep('details')}
                className="w-full h-11 mt-5 bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                متابعة التسجيل <ArrowLeft className="w-4 h-4 ms-2" />
              </Button>

              {/* Unified SSO / Magic Link quick bar */}
              <div className="mt-4 pt-3 border-t border-[#CCD8CE]/70 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <Link
                  href="/login"
                  className="text-[#1F7A46] font-bold hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>التسجيل بالرابط السحري (Magic Link)</span>
                </Link>
                <Link
                  href="/login"
                  className="text-[#4A5D50] hover:text-[#1B281F] font-semibold inline-flex items-center gap-1"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#1F7A46]" />
                  <span>التسجيل الموحد للمنشآت (SSO)</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in-0 duration-200">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#1B281F] font-heading mb-0.5">
                    {isAr ? 'إنشاء حساب جديد' : 'Create New Account'}
                  </h2>
                  <p className="text-xs text-[#566A5C]">
                    {invitation ? 'أكمل بياناتك لقبول الدعوة' : selected ? `حساب ${selected.title}` : ''}
                  </p>
                </div>
                {!inviteToken && (
                  <button
                    type="button"
                    onClick={() => setStep('type')}
                    className="text-xs text-[#1F7A46] hover:underline flex items-center gap-1 cursor-pointer"
                    id="change-account-type"
                  >
                    <ArrowRight className="h-3.5 w-3.5" /> تغيير الدور
                  </button>
                )}
              </div>

              <form onSubmit={handleRegister} noValidate className="space-y-3.5">
                {registrationError && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3.5 py-2.5 text-xs text-[#991B1B]"
                  >
                    {registrationError}
                  </div>
                )}

                {inviteToken && (
                  invitation ? (
                    <div className="rounded-xl border border-[#CCD8CE] bg-[#E8EFE9] p-3 text-xs text-[#1B281F]">
                      دعوة للانضمام إلى <strong>{invitation.workspaceName}</strong> بصفة <strong>{ROLE_AR[invitation.role] || invitation.role}</strong>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-[#FDE68A] bg-[#FEF3C7] p-3 text-xs text-[#92400E]">
                      {inviteError || 'جارٍ التحقق من الدعوة...'}
                    </div>
                  )
                )}

                <Field id="reg-name" label="الاسم الكامل" icon={User}>
                  <Input id="reg-name" type="text" autoComplete="name" placeholder="محمد العبدالله" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
                </Field>

                {!invitation && accountType && accountType !== 'student' && (
                  <Field id="reg-org" label={accountType === 'firm' ? 'اسم المكتب أو المنشأة' : 'اسم المكتب (اختياري)'} icon={Building2}>
                    <Input id="reg-org" type="text" autoComplete="organization" placeholder="مكتب العبدالله للمحاماة" value={orgName} onChange={(e) => setOrgName(e.target.value)} required={accountType === 'firm'} className={inputCls} />
                  </Field>
                )}

                <Field id="reg-email" label="البريد الإلكتروني" icon={Mail}>
                  <Input id="reg-email" type="email" autoComplete="email" placeholder="name@lawfirm.sa" value={email} onChange={(e) => setEmail(e.target.value)} readOnly={Boolean(invitation)} required className={`${inputCls} read-only:opacity-70`} />
                </Field>

                <Field id="reg-password" label="كلمة المرور" icon={Lock}>
                  <Input id="reg-password" type="password" autoComplete="new-password" placeholder="12 خانة على الأقل" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={12} className={inputCls} />
                  <p className="text-[11px] text-[#566A5C]">12 خانة على الأقل، وتتضمن حروفاً وأرقاماً.</p>
                </Field>

                <label htmlFor="reg-privacy" className="flex items-start gap-2.5 text-xs text-[#1B281F] cursor-pointer pt-1">
                  <input id="reg-privacy" type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} required className="mt-0.5 accent-[#1F7A46]" />
                  <span>
                    أقر بقراءة وموافقة <Link href="/privacy" className="text-[#1F7A46] underline font-bold">سياسة الخصوصية</Link> و<Link href="/terms" className="text-[#1F7A46] underline font-bold">شروط الاستخدام</Link>.
                  </span>
                </label>

                <label htmlFor="reg-beta" className="flex items-start gap-2.5 text-xs text-[#1B281F] cursor-pointer rounded-lg border border-amber-200 bg-amber-50/60 p-2.5">
                  <input id="reg-beta" type="checkbox" checked={acceptBetaTerms} onChange={(e) => setAcceptBetaTerms(e.target.checked)} required className="mt-0.5 accent-[#1F7A46]" />
                  <span className="leading-relaxed">
                    أدرك أن «مقر» <b>منظومة تقنية للعمليات القانونية والحوكمة</b> وليس مكتب محاماة ولا يقدم استشارات قانونية مباشرة، وأن مخرجات الذكاء الاصطناعي مساعِدة فقط وتتطلب مراجعة محامٍ مرخّص قبل الاعتماد عليها، وأن الفواتير الصادرة منه مسوّدات داخلية غير معتمدة من هيئة الزكاة والضريبة والجمارك.
                  </span>
                </label>

                <Button
                  type="submit"
                  id="register-submit"
                  className="w-full h-11 mt-2 bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                  disabled={loading || !canSubmit || !acceptPrivacy || !acceptBetaTerms}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      جاري الإعداد...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      إنشاء الحساب <ArrowLeft className="w-4 h-4" />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          )}

          {step !== 'done' && (
            <div className="mt-5 pt-4 border-t border-[#CCD8CE] text-center">
              <p className="text-xs text-[#566A5C]">
                {isAr ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                <Link
                  href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login'}
                  className="text-[#1F7A46] hover:underline font-bold"
                >
                  {isAr ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const inputCls = 'bg-[#F5F7F5] border-[#CCD8CE] text-[#1B281F] placeholder:text-[#566A5C]/60 pl-4 pr-10 h-10 text-xs focus-visible:ring-[#1F7A46]'

function Field({ id, label, icon: Icon, children }: { id: string; label: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-bold text-[#1B281F]">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute right-3 top-2.5 h-4 w-4 text-[#566A5C] pointer-events-none" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}
