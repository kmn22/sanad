'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scale, ArrowLeft, ShieldCheck, Mail, Lock, User, Briefcase, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [persona, setPersona] = useState<'lawyer' | 'student'>('lawyer')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
          persona,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'تعذر إتمام التسجيل. يرجى مراجعة البيانات.')
        setLoading(false)
        return
      }

      // Auto-login after successful registration
      const loginRes = await signIn('credentials', {
        email: email.trim(),
        password: password,
        redirect: false,
      })

      if (loginRes?.error || !loginRes?.ok) {
        toast.success(data.message || 'تم إنشاء الحساب بنجاح!')
        router.push('/login?registered=1')
        return
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('sanad.persona', persona)
      }

      toast.success(data.message || 'تم إنشاء الحساب بنجاح!')
      window.location.href = '/dashboard'
    } catch (e) {
      console.error('Registration failed:', e)
      toast.error('تعذر إنشاء الحساب. حاول مجدداً.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden" dir="rtl">
      {/* Background aesthetics */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden relative z-10">
        
        {/* Left Side: Branding & Info */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-slate-900 to-slate-800 relative">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
          
          <div className="relative z-10">
            <Link href="/" className="flex items-center gap-3 mb-12 hover:opacity-80 transition-opacity w-fit">
              <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30">
                <Scale className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">سند</h1>
            </Link>

            <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
              ابدأ رحلتك القانونية <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">الرقمية اليوم</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-6">
              أنشئ حسابك وانضم إلى مئات المحامين والمنشآت السعودية التي تدير أعمالها بكفاءة وأمان تام.
            </p>
            
            <ul className="space-y-4 text-slate-300 font-medium">
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                إدارة قضايا متكاملة
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                أتمتة صياغة العقود
              </li>
              <li className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                فوترة زكوية ZATCA
              </li>
            </ul>
          </div>

          <div className="relative z-10 mt-12 flex items-center gap-4 text-sm text-slate-500 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>بياناتك مشفرة ومحفوظة محلياً وفق معايير الأمن السيبراني</span>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-right">
            <h3 className="text-2xl font-bold text-white mb-2">إنشاء حساب جديد</h3>
            <p className="text-slate-400">سجل الآن للحصول على مساحة العمل الخاصة بك</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button
                type="button"
                onClick={() => setPersona('lawyer')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer ${
                  persona === 'lawyer'
                    ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <Briefcase className="w-6 h-6 mb-2" />
                <span className="text-sm font-semibold">محامي ممارس</span>
              </button>
              <button
                type="button"
                onClick={() => setPersona('student')}
                className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all cursor-pointer ${
                  persona === 'student'
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-300'
                }`}
              >
                <GraduationCap className="w-6 h-6 mb-2" />
                <span className="text-sm font-semibold">طالب قانون</span>
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-5 w-5 text-slate-500" />
                <Input
                  type="text"
                  placeholder="محمد العبدالله"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-700 text-white pl-4 pr-11 h-12 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 h-5 w-5 text-slate-500" />
                <Input
                  type="email"
                  placeholder="name@lawfirm.sa"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-700 text-white pl-4 pr-11 h-12 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-slate-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-slate-800/50 border-slate-700 text-white pl-4 pr-11 h-12 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 mt-6 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-semibold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] cursor-pointer" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  جاري الإعداد...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  إنشاء الحساب
                  <ArrowLeft className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-400">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
