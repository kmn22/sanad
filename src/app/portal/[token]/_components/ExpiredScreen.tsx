'use client'

import {
  Clock,
  RefreshCw,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { PortalView } from '../_lib/use-portal-view'

export function ExpiredScreen({ v }: { v: PortalView }) {
  const { client } = v
  return (
    <>
return (
  <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans" dir="rtl">
    <Card className="max-w-md w-full bg-slate-900 border-slate-800 text-slate-100 shadow-2xl p-6 text-center space-y-4">
      <div className="h-16 w-16 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
        <Clock className="h-8 w-8" />
      </div>
      <h2 className="text-xl font-bold text-white">انتهت صلاحية الرابط</h2>
      <p className="text-sm text-slate-300 leading-relaxed">
        لحماية خصوصية ملفك القانوني وفق نظام حماية البيانات الشخصية، انتهت صلاحية هذا الرابط المؤقت.
      </p>
      <div className="pt-2">
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
          onClick={() => {
            const phone = client.phone ? client.phone.replace(/\D/g, '') : ''
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent('السلام عليكم، يرجى إعادة إرسال رابط بوابة الموكل الخاصة بقضيتي.')}`, '_blank')
          }}
        >
          <RefreshCw className="h-4 w-4" />
          <span>طلب رابط جديد بنقرة واحدة عبر WhatsApp</span>
        </Button>
      </div>
    </Card>
  </div>
)
    </>
  )
}
