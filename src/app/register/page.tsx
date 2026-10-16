'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scale, ArrowLeft, ArrowRight, ShieldCheck, Mail, Lock, User, GraduationCap, Briefcase, Building2, MailCheck, Check } from 'lucide-react'
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
    desc: 'صياغة ممتثلة وتدقيق عقود وإدارة قضايا',
    icon: Briefcase,
    ring: 'hover:border-[#1F7A46] data-[on=true]:border-[#1F7A46] data-[on=true]:bg-[#E8EFE9] data-[on=true]:shadow-xs',
    tile: 'bg-[#E8EFE9] text-[#1F7A46] border-[#CCD8CE]',
    perks: ['فحص لحظي للأنظمة', 'صياغة بالذكاء الاصطناعي', 'بوابة الموكل'],
  },
  {
    id: 'firm',
    title: 'مكتب محاماة',
    desc: 'فريق عمل، توزيع مهام، وصلاحيات مشتركة',
    icon: Building2,
    ring: 'hover:border-[#1F7A46] data-[on=true]:border-[#1F7A46] data-[on=true]:bg-[#E8EFE9] data-[on=true]:shadow-xs',
    tile: 'bg-[#E8EFE9] text-[#1F7A46] border-[#CCD8CE]',
    perks: ['إدارة الفريق والصلاحيات', 'تقارير الشركاء', 'فواتير داخلية'],
  },
  {
    id: 'student',
    title: 'طالب قانون أو متدرب',
    desc: 'بنك الأنظمة والتدريب على الصياغة القضائية',
    icon: GraduationCap,
    ring: 'hover:border-[#1F7A46] data-[on=true]:border-[#1F7A46] data-[on=true]:bg-[#E8EFE9] data-[on=true]:shadow-xs',
    tile: 'bg-[#E8EFE9] text-[#1F7A46] border-[#CCD8CE]',
    perks: ['المقررات وبنك الأنظمة', 'بطاقات الاستذكار', 'مجاني للجامعات'],
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
  const [loading, setLoading] = useState(false)
  const [registrationError, setRegistrationError] = useState('')
  const [doneInfo, setDoneInfo] = useState<{ delivery?: string; devVerifyUrl?: string } | null>(null)

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('invite') || ''
    const params = new URLSearchParams(window.location.search)
    const preset = params.get('type') || (params.get('plan') === 'firm' ? 'firm' : params.get('plan') === 'solo' ? 'lawyer' : params.get('plan') === 'student' ? 'student' : null)
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
      router.push('/login?registered=1')
    } catch (err) {
      console.error('Registration failed:', err)
      setRegistrationError('تعذر إنشاء الحساب. حاول مجدداً.')
      toast.error('تعذر إنشاء الحساب. حاول مجدداً.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F5] p-4 font-sans relative" dir="rtl">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-5 bg-white border border-[#CCD8CE] rounded-3xl shadow-sm overflow-hidden relative z-10">
        {/* Branding Side */}
        <div className="hidden md:flex md:col-span-2 flex-col justify-between p-10 bg-[#E8EFE9] border-l border-[#CCD8CE] relative">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-10 hover:opacity-85 transition-opacity w-fit">
              <div className="bg-[#1F7A46] p-2.5 rounded-xl text-white">
                <Scale className="w-6 h-6 stroke-[2.2]" />
              </div>
              <span className="text-2xl font-black text-[#1B281F] font-heading">سَنَد</span>
            </Link>
            <h1 className="text-2xl font-extrabold text-[#1B281F] font-heading leading-tight mb-4">
              منظومة الصياغة <br />
              <span className="text-[#1F7A46]">الممتثلة للأنظمة السعودية</span>
            </h1>
            <p className="text-[#4A5D50] text-xs leading-relaxed mb-6">
              أنشئ مساحة عملك اليوم وابدأ فحص بنود العقود وتدقيق الضمانات في 60 ثانية.
            </p>
            <ul className="space-y-2.5 text-xs text-[#1B281F] font-medium">
              <li className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-[#1F7A46]" /> بوابة المحامي المستقل</li>
              <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-[#1F7A46]" /> بوابة مكتب المحاماة</li>
              <li className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-[#1F7A46]" /> بوابة الطالب والمتدرب</li>
              <li className="flex items-center gap-2"><User className="h-4 w-4 text-[#1F7A46]" /> بوابة الموكل السيادية</li>
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
                أنشأنا مساحة العمل الخاصة بك. {doneInfo?.delivery === 'email' ? `أرسلنا رابط التفعيل إلى ${email}.` : 'يلزم تأكيد البريد قبل تسجيل الدخول.'}
              </p>
              {doneInfo?.devVerifyUrl && (
                <a href={doneInfo.devVerifyUrl} className="block text-xs text-[#D97706] underline break-all font-mono" id="dev-verify-link">
                  (وضع التطوير) فعّل الحساب مباشرة
                </a>
              )}
              <Button asChild className="bg-[#1F7A46] hover:bg-[#165832] text-white font-bold h-10 text-xs px-6">
                <Link href="/login">الذهاب لتسجيل الدخول</Link>
              </Button>
            </div>
          ) : step === 'type' ? (
            <div className="animate-in fade-in-0 duration-200">
              <h2 className="text-2xl font-bold text-[#1B281F] font-heading mb-1">اختر نوع حسابك</h2>
              <p className="text-[#566A5C] text-xs mb-5">حدد دورك لتهيئة مساحة العمل المناسبة لاحتياجاتك</p>
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
              <p className="text-[11px] text-[#566A5C] mt-4">هل أنت موكّل؟ اطلب من مكتب المحاماة إرسال دعوة إلى بوابة الموكل مباشرة.</p>
              <Button
                id="account-type-continue"
                disabled={!accountType}
                onClick={() => setStep('details')}
                className="w-full h-11 mt-5 bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                متابعة التسجيل <ArrowLeft className="w-4 h-4 ms-2" />
              </Button>
            </div>
          ) : (
            <div className="animate-in fade-in-0 duration-200">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-[#1B281F] font-heading mb-0.5">إنشاء حساب جديد</h2>
                  <p className="text-xs text-[#566A5C]">{invitation ? 'أكمل بياناتك لقبول الدعوة' : selected ? `حساب ${selected.title}` : ''}</p>
                </div>
                {!inviteToken && (
                  <button type="button" onClick={() => setStep('type')} className="text-xs text-[#1F7A46] hover:underline flex items-center gap-1 cursor-pointer" id="change-account-type">
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
                  <Field id="reg-org" label={accountType === 'firm' ? 'اسم المكتب' : 'اسم المكتب (اختياري)'} icon={Building2}>
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

                <Button
                  type="submit"
                  id="register-submit"
                  className="w-full h-11 mt-2 bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                  disabled={loading || !canSubmit || !acceptPrivacy}
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
                لديك حساب بالفعل؟{' '}
                <Link href="/login" className="text-[#1F7A46] hover:underline font-bold">
                  تسجيل الدخول
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
