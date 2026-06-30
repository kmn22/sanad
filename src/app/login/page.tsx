'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Scale, ArrowLeft, ShieldCheck, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Dummy login delay for premium feel
    setTimeout(() => {
      router.push('/')
    }, 1200)
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
            <div className="flex items-center gap-3 mb-12">
              <div className="bg-emerald-500/20 p-3 rounded-xl border border-emerald-500/30">
                <Scale className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">سند</h1>
            </div>

            <h2 className="text-4xl font-extrabold text-white leading-tight mb-6">
              مساحة العمل القانونية <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">الذكية المتكاملة</span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed">
              قم بإدارة قضاياك، عملائك، وفواتيرك في منصة واحدة مدعومة بالذكاء الاصطناعي وبأعلى معايير الأمان المعتمدة في المملكة.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 text-sm text-slate-500 font-medium">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>متوافق مع هيئة الزكاة (ZATCA) وأنظمة الأمن السيبراني (NCA)</span>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-right">
            <h3 className="text-2xl font-bold text-white mb-2">مرحباً بعودتك</h3>
            <p className="text-slate-400">سجل الدخول للمتابعة إلى مساحة العمل الخاصة بك</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-slate-300">كلمة المرور</label>
                <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors">نسيت كلمة المرور؟</a>
              </div>
              <div className="relative">
                <Lock className="absolute right-3 top-3 h-5 w-5 text-slate-500" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-800/50 border-slate-700 text-white pl-4 pr-11 h-12 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 mt-4 bg-emerald-600 hover:bg-emerald-500 text-white text-base font-semibold shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02]" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  جاري التحقق...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  تسجيل الدخول
                  <ArrowLeft className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-sm text-slate-500">
              <span className="bg-slate-800 px-2 py-1 rounded text-emerald-400 font-mono text-xs ml-2">Demo Mode</span>
              يمكنك تسجيل الدخول باستخدام أي بيانات تجريبية.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
