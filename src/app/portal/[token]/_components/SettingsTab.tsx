'use client'

import {
  Globe,
  ShieldCheck,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { PortalView } from '../_lib/use-portal-view'

export function SettingsTab({ v }: { v: PortalView }) {
  const { activeTab, setActiveTab, moreSubScreen, channelSms, setChannelSms, channelWhatsapp, setChannelWhatsapp, channelEmail, setChannelEmail, language, setLanguage, setShowDeleteModal, handleSignOutAll } = v
  return (
    <>
      {/* ========================================================
          SCREEN S8: NOTIFICATIONS & SETTINGS (الإعدادات)
         ======================================================== */}
      {activeTab === 'more' && moreSubScreen === 'settings' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">الإعدادات والتنبيهات</h2>
              <p className="text-xs text-muted-foreground">إدارة قنوات التواصل، الخصوصية، وحذف البيانات</p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab('home')}>
              عودة
            </Button>
          </div>

          {/* Channel Matrix */}
          <Card className="rounded-2xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">قنوات استلام التنبيهات:</h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 cursor-pointer">
                <span>الرسائل النصية (SMS) — قناة مضمونة</span>
                <input
                  type="checkbox"
                  checked={channelSms}
                  onChange={(e) => setChannelSms(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 cursor-pointer">
                <span>تنبيهات WhatsApp المباشرة</span>
                <input
                  type="checkbox"
                  checked={channelWhatsapp}
                  onChange={(e) => setChannelWhatsapp(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border bg-slate-50 dark:bg-slate-900 cursor-pointer">
                <span>البريد الإلكتروني للتقارير والملخصات</span>
                <input
                  type="checkbox"
                  checked={channelEmail}
                  onChange={(e) => setChannelEmail(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
              </label>
            </div>

            {/* Quiet Hours */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold block">ساعات الهدوء (Quiet Hours)</span>
                <span className="text-muted-foreground text-[11px]">9:00 مساءً — 8:00 صباحاً (بتوقيت الرياض)</span>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-700">مفعلة تلقائياً</Badge>
            </div>
          </Card>

          {/* Language Switch AR/EN */}
          <Card className="rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-xs">
              <Globe className="h-4 w-4 text-emerald-600" />
              <div>
                <span className="font-bold block">لغة الواجهة (Language)</span>
                <span className="text-muted-foreground text-[11px]">العربية الافتراضية • متاح English</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${language === 'ar' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-500'}`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage('en')
                  toast.info('تم تفعيل واجهة اللغة الإنجليزية التجريبية')
                }}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${language === 'en' ? 'bg-white dark:bg-slate-900 text-emerald-600 shadow-xs' : 'text-slate-500'}`}
              >
                English
              </button>
            </div>
          </Card>

          {/* Registered Devices List & Sign out */}
          <Card className="rounded-2xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">الوصول عبر رابط الدعوة:</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              من يحمل هذا الرابط يستطيع الوصول إلى البوابة حتى انتهاء صلاحيته أو إلغائه من المكتب. لا تتم إدارة جلسات أجهزة منفصلة لهذا الرابط.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50"
              onClick={handleSignOutAll}
            >
              كيفية إلغاء الوصول
            </Button>
          </Card>

          {/* PDPPL Data Deletion Request Workflow */}
          <Card className="rounded-2xl p-4 shadow-xs border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>نظام حماية البيانات الشخصية (PDPPL)</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              يحق لك نظاماً طلب مسح أو تصحيح بياناتك الشخصية المحفوظة لدى المكتب. يُرفع الطلب تلقائياً لمدير الامتثال في المنشأة.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-slate-600 dark:text-slate-400 underline p-0 h-auto"
              onClick={() => setShowDeleteModal(true)}
            >
              طلب حذف أو تصحيح البيانات الشخصية...
            </Button>
          </Card>
        </div>
      )}
    </>
  )
}
