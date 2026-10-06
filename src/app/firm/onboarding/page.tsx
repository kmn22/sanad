'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Check, ChevronLeft, Copy, Loader2, Mail, ShieldCheck, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PortalPageHeader } from '@/components/portal/PortalShell'

const steps = [
  { title: 'هوية المكتب', icon: Building2 },
  { title: 'دعوة الفريق', icon: UsersRound },
  { title: 'الأمان والانطلاق', icon: ShieldCheck },
]

export default function FirmOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('lawyer')
  const [inviteUrl, setInviteUrl] = useState('')
  const [mfaEnabled, setMfaEnabled] = useState(false)

  useEffect(() => {
    Promise.all([fetch('/api/saas/status'), fetch('/api/auth/session')]).then(async ([statusResponse, sessionResponse]) => {
      if (statusResponse.ok) {
        const status = await statusResponse.json()
        setName(status.workspace.name || '')
        setDomain(status.workspace.domain || '')
        if (status.workspace.onboardingStatus === 'completed') setStep(2)
      }
      if (sessionResponse.ok) {
        const session = await sessionResponse.json()
        setMfaEnabled(Boolean(session?.user?.mfaEnabled))
      }
      setLoading(false)
    })
  }, [])

  async function saveIdentity() {
    setBusy(true)
    const response = await fetch('/api/workspace', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, domain }) })
    const result = await response.json().catch(() => ({}))
    setBusy(false)
    if (!response.ok) return toast.error(result.error || 'تعذر حفظ بيانات المكتب')
    setStep(1)
  }

  async function inviteMember(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    const response = await fetch('/api/invitations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, role }) })
    const result = await response.json().catch(() => ({}))
    setBusy(false)
    if (!response.ok) return toast.error(result.error || 'تعذر إنشاء الدعوة')
    setInviteUrl(result.url || '')
    setEmail('')
    toast.success(result.delivery === 'email' ? 'تم إرسال الدعوة' : 'تم إنشاء رابط الدعوة')
  }

  async function complete() {
    if (!mfaEnabled) return router.push('/settings/security')
    setBusy(true)
    const response = await fetch('/api/saas/onboarding', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'completed' }) })
    setBusy(false)
    if (!response.ok) return toast.error('تعذر إكمال الإعداد')
    toast.success('أصبح مكتبك جاهزاً للعمل')
    router.push('/firm')
    router.refresh()
  }

  if (loading) return <div className="space-y-4"><div className="h-28 animate-pulse rounded-3xl bg-muted/50" /><div className="h-80 animate-pulse rounded-3xl bg-muted/30" /></div>

  return <div className="mx-auto max-w-4xl space-y-6" dir="rtl">
    <PortalPageHeader portal="firm" title="إعداد مكتبك في سند" subtitle="ثلاث خطوات قصيرة لإنشاء مساحة عمل آمنة وجاهزة للفريق." />
    <div className="grid grid-cols-3 gap-2">{steps.map((item, index) => <div key={item.title} className={`rounded-2xl border p-3 text-center transition ${index === step ? 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300' : index < step ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700' : 'border-border/60 text-muted-foreground'}`}><item.icon className="mx-auto mb-1 h-5 w-5" /><p className="text-xs font-semibold">{item.title}</p></div>)}</div>

    {step === 0 && <Card className="border-border/60 bg-card/70 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Building2 className="h-5 w-5 text-amber-600" />هوية المكتب</CardTitle></CardHeader><CardContent className="space-y-4"><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">الاسم الرسمي أو التجاري</span><Input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={120} /></label><label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">نطاق المكتب</span><Input value={domain} onChange={(event) => setDomain(event.target.value)} dir="ltr" placeholder="lawfirm.sa" /></label><Button className="w-full bg-amber-600 text-white hover:bg-amber-500" onClick={saveIdentity} disabled={busy || name.trim().length < 2}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronLeft className="h-4 w-4" />}حفظ والمتابعة</Button></CardContent></Card>}

    {step === 1 && <div className="grid gap-5 lg:grid-cols-[1fr_.7fr]"><Card className="border-border/60 bg-card/70 shadow-sm"><CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-amber-600" />دعوة أول عضو</CardTitle></CardHeader><CardContent><form onSubmit={inviteMember} className="space-y-4"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="lawyer@lawfirm.sa" required /><select value={role} onChange={(event) => setRole(event.target.value)} className="h-10 w-full rounded-xl border bg-background px-3 text-sm"><option value="lawyer">محامٍ</option><option value="staff">موظف</option><option value="auditor">مدقق</option><option value="student">متدرب</option></select><Button type="submit" className="w-full" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}إنشاء الدعوة</Button>{inviteUrl && <button type="button" onClick={() => navigator.clipboard.writeText(inviteUrl).then(() => toast.success('تم نسخ الرابط'))} className="flex w-full items-center gap-2 rounded-xl border bg-muted/50 p-3 text-left text-xs" dir="ltr"><Copy className="h-4 w-4 shrink-0" /><span className="truncate">{inviteUrl}</span></button>}</form></CardContent></Card><Card className="border-border/60 bg-muted/20"><CardContent className="flex h-full flex-col justify-center p-6 text-center"><UsersRound className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><p className="font-semibold">يمكنك تخطي هذه الخطوة</p><p className="mt-2 text-xs leading-5 text-muted-foreground">ستتمكن من دعوة بقية الفريق وإدارة المقاعد من صفحة الفريق لاحقاً.</p><Button variant="outline" className="mt-5" onClick={() => setStep(2)}>المتابعة بدون دعوة</Button></CardContent></Card></div>}

    {step === 2 && <Card className="border-border/60 bg-card/70 shadow-sm"><CardContent className="p-7 text-center"><span className={`mx-auto grid h-14 w-14 place-items-center rounded-2xl ${mfaEnabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-700'}`}>{mfaEnabled ? <Check className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}</span><h2 className="mt-4 text-xl font-bold">{mfaEnabled ? 'مكتبك جاهز للانطلاق' : 'فعّل التحقق بخطوتين أولاً'}</h2><p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">حساب مالك المكتب يدير الفريق والقضايا والبيانات الحساسة، لذلك يتطلب سند التحقق بخطوتين قبل إكمال الإعداد.</p><Button className="mt-6 bg-amber-600 text-white hover:bg-amber-500" onClick={complete} disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{mfaEnabled ? 'إكمال الإعداد وفتح المكتب' : 'الانتقال إلى إعداد الأمان'}</Button></CardContent></Card>}
  </div>
}
