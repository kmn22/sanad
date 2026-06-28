'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Scale } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })

    if (res?.error) {
      setError('بيانات الدخول غير صحيحة (استخدم أي ايميل مع كلمة المرور: admin)')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4" dir="rtl">
      <Card className="w-full max-w-md shadow-lg border-primary/10">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-2">
            <Scale className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">تسجيل الدخول إلى سند</CardTitle>
          <CardDescription>
            منصة العمليات اليومية للمحامي السعودي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-xs">
            <p className="font-semibold mb-1">عرض توضيحي (Demo)</p>
            <p>استخدم أي بريد إلكتروني مع كلمة المرور: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono">admin</code></p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-3 rounded-md text-sm border border-rose-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <Input
                type="email"
                placeholder="admin@sanad.sa"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">كلمة المرور</label>
                <a href="#" className="text-xs text-primary hover:underline">نسيت كلمة المرور؟</a>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full mt-4 h-11" disabled={loading}>
              {loading ? 'جاري التحقق...' : 'دخول'}
            </Button>
            
            <div className="pt-4 text-center text-xs text-muted-foreground border-t border-border mt-6">
              <p>لغرض التحكيم في الهاكاثون:</p>
              <p className="font-mono mt-1 bg-muted p-1 rounded inline-block">password: admin</p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
