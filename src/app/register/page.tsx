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
    id: 'student',
    title: 'طالب قانون',
    desc: 'نظّم مقرراتك ومواعيدك وراجع بذكاء',
    icon: GraduationCap,
    ring: 'hover:border-indigo-400/60 data-[on=true]:border-indigo-400 data-[on=true]:bg-indigo-500/10 data-[on=true]:shadow-indigo-900/30',
    tile: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
    perks: ['المقررات والمحاضرات', 'بنك المصطلحات', 'دفتر القضايا'],
  },
  {
    id: 'lawyer',
    title: 'محامٍ مستقل',
    desc: 'أدر قضاياك ووقتك وفواتيرك',
    icon: Briefcase,
    ring: 'hover:border-emerald-400/60 data-[on=true]:border-emerald-400 data-[on=true]:bg-emerald-500/10 data-[on=true]:shadow-emerald-900/30',
    tile: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    perks: ['إدارة القضايا والمهام', 'صياغة بالذكاء الاصطناعي', 'بوابة الموكّل'],
  },
  {
    id: 'firm',
    title: 'مكتب محاماة',
    desc: 'فريق، توزيع قضايا، وتحصيل',
    icon: Building2,
    ring: 'hover:border-amber-400/60 data-[on=true]:border-amber-400 data-[on=true]:bg-amber-500/10 data-[on=true]:shadow-amber-900/30',
    tile: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    perks: ['إدارة الفريق والصلاحيات', 'لوحة أداء المكتب', 'فوترة ZATCA'],
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
  const [accountType, setAccountType] = useState<AccountType | null>(null)
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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden" dir="rtl">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-5 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        {/* Branding */}
        <div className="hidden md:flex md:col-span-2 flex-col justify-between p-10 bg-gradient-to-br from-slate-900 to-slate-800 relative">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-10 hover:opacity-80 transition-opacity w-fit">
              <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30">
                <Scale className="w-7 h-7 text-emerald-400" />
              </div>
              <span className="text-3xl font-bold text-white tracking-tight">سند</span>
            </Link>
            <h1 className="text-3xl font-extrabold text-white leading-tight mb-5">
              بوابة لكل دور <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">في المنظومة القانونية</span>
            </h1>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-indigo-300" /> بوابة الطالب</li>
              <li className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-emerald-300" /> بوابة المحامي</li>
              <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-amber-300" /> بوابة المكتب</li>
              <li className="flex items-center gap-2"><User className="h-4 w-4 text-sky-300" /> بوابة الموكّل (بدعوة من المكتب)</li>
            </ul>
          </div>
          <div className="relative z-10 mt-10 flex items-center gap-3 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>بياناتك مشفرة ومعزولة لكل مساحة عمل</span>
          </div>
        </div>

        {/* Form side */}
        <div className="md:col-span-3 p-7 md:p-10 flex flex-col justify-center">
          {step === 'done' ? (
            <div className="text-center space-y-5 animate-in fade-in-0 zoom-in-95 duration-300">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 grid place-items-center">
                <MailCheck className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">تحقّق من بريدك الإلكتروني</h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                أنشأنا مساحة العمل الخاصة بك. {doneInfo?.delivery === 'email' ? `أرسلنا رابط التفعيل إلى ${email}.` : 'يلزم تأكيد البريد قبل تسجيل الدخول.'}
              </p>
              {doneInfo?.devVerifyUrl && (
                <a href={doneInfo.devVerifyUrl} className="block text-xs text-amber-300 underline break-all" id="dev-verify-link">
                  (وضع التطوير) فعّل الحساب مباشرة
                </a>
              )}
              <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white">
                <Link href="/login">الذهاب لتسجيل الدخول</Link>
              </Button>
            </div>
          ) : step === 'type' ? (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <h2 className="text-2xl font-bold text-white mb-1">اختر نوع حسابك</h2>
              <p className="text-slate-400 text-sm mb-6">ستحصل على بوابة مصممة لاحتياجاتك</p>
              <div className="space-y-3">
                {ACCOUNT_OPTIONS.map((o) => (
                  <button
                    key={o.id}
                    id={`account-type-${o.id}`}
                    type="button"
                    data-on={accountType === o.id}
                    onClick={() => setAccountType(o.id)}
                    className={`w-full text-start flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-slate-800/40 transition-all duration-200 hover:-translate-y-0.5 shadow-lg shadow-transparent cursor-pointer ${o.ring}`}
                  >
                    <div className={`h-11 w-11 rounded-xl border grid place-items-center shrink-0 ${o.tile}`}>
                      <o.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-white">{o.title}</p>
                        {accountType === o.id && <Check className="h-4 w-4 text-white" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{o.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {o.perks.map((p) => (
                          <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">{p}</span>
                        ))}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-4">هل أنت موكّل؟ اطلب من مكتب المحاماة إرسال دعوة إلى بوابة الموكّل.</p>
              <Button
                id="account-type-continue"
                disabled={!accountType}
                onClick={() => setStep('details')}
                className="w-full h-12 mt-6 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-semibold cursor-pointer"
              >
                متابعة <ArrowLeft className="w-5 h-5 ms-2" />
              </Button>
            </div>
          ) : (
            <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <div className="mb-6 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">إنشاء حساب جديد</h2>
                  <p className="text-slate-400 text-sm">{invitation ? 'أكمل بياناتك لقبول الدعوة' : selected ? `حساب ${selected.title}` : ''}</p>
                </div>
                {!inviteToken && (
                  <button type="button" onClick={() => setStep('type')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer" id="change-account-type">
                    <ArrowRight className="h-3.5 w-3.5" /> تغيير النوع
                  </button>
                )}
              </div>

              <form onSubmit={handleRegister} noValidate className="space-y-4">
                {registrationError && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                  >
                    {registrationError}
                  </div>
                )}

                {inviteToken && (
                  invitation ? (
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
                      دعوة للانضمام إلى <strong>{invitation.workspaceName}</strong> بصفة <strong>{ROLE_AR[invitation.role] || invitation.role}</strong>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
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
                  <p className="text-xs text-slate-500">12 خانة على الأقل، وتتضمن حروفاً وأرقاماً.</p>
                </Field>

                <label htmlFor="reg-privacy" className="flex items-start gap-3 text-sm text-slate-300 cursor-pointer">
                  <input id="reg-privacy" type="checkbox" checked={acceptPrivacy} onChange={(e) => setAcceptPrivacy(e.target.checked)} required className="mt-1" />
                  <span>
                    أقر بقراءة وقبول <Link href="/privacy" className="text-emerald-400 underline">سياسة الخصوصية</Link> و<Link href="/terms" className="text-emerald-400 underline">شروط الاستخدام</Link>.
                  </span>
                </label>

                <Button
                  type="submit"
                  id="register-submit"
                  className="w-full h-12 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-semibold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.01] cursor-pointer"
                  disabled={loading || !canSubmit || !acceptPrivacy}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      جاري الإعداد...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      إنشاء الحساب <ArrowLeft className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>
            </div>
          )}

          {step !== 'done' && (
            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
              <p className="text-sm text-slate-400">
                لديك حساب بالفعل؟{' '}
                <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
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

const inputCls = 'bg-slate-800/50 border-slate-700 text-white pl-4 pr-11 h-12 focus-visible:ring-emerald-500'

function Field({ id, label, icon: Icon, children }: { id: string; label: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute right-3 top-3.5 h-5 w-5 text-slate-500 pointer-events-none" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}
