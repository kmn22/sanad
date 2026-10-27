'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NOTIFICATION_LABELS } from '../_lib/notifications'
import type { SecuritySettingsState } from './use-security-settings'

export function NotificationPreferencesSection({ v }: { v: SecuritySettingsState }) {
  const { prefs, setPrefs, quietStart, setQuietStart, quietEnd, setQuietEnd, savingPrefs, saveNotificationPreferences } = v
  return (
    <>
        {/* 3. Notification Preferences & Quiet Hours */}
        <section className="rounded-2xl border border-[#CCD8CE] bg-white p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold font-heading flex items-center gap-2">
              <Bell className="w-5 h-5 text-[#1F7A46]" />
              <span>تفضيلات الإشعارات وساعات الهدوء</span>
            </h2>
            <p className="text-xs text-[#566A5C] mt-0.5">
              تحكم في قنوات التنبيه لكل فئة وحدد ساعات الهدوء اليومية لكتم التنبيهات غير الطارئة.
            </p>
          </div>

          <form onSubmit={saveNotificationPreferences} className="space-y-4">
            <div className="divide-y divide-[#CCD8CE] border border-[#CCD8CE] rounded-xl overflow-hidden">
              {NOTIFICATION_LABELS.map(({ type, label, desc }) => (
                <div key={type} className="p-3.5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <p className="font-bold text-[#1B281F]">{label}</p>
                    <p className="text-[11px] text-[#566A5C]">{desc}</p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefs[type]?.inApp ?? true}
                        onChange={(e) =>
                          setPrefs((prev) => ({ ...prev, [type]: { ...prev[type], inApp: e.target.checked } }))
                        }
                        className="accent-[#1F7A46]"
                      />
                      <span>داخل المنصة</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={prefs[type]?.email ?? true}
                        onChange={(e) =>
                          setPrefs((prev) => ({ ...prev, [type]: { ...prev[type], email: e.target.checked } }))
                        }
                        className="accent-[#1F7A46]"
                      />
                      <span>البريد الإلكتروني</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#F5F7F5] p-3.5 rounded-xl border border-[#CCD8CE] text-xs">
              <label className="space-y-1">
                <span className="font-bold text-[#1B281F] block">بداية ساعات الهدوء (اختياري)</span>
                <Input
                  type="time"
                  value={quietStart}
                  onChange={(e) => setQuietStart(e.target.value)}
                  className="bg-white border-[#CCD8CE] h-9 text-xs"
                />
              </label>
              <label className="space-y-1">
                <span className="font-bold text-[#1B281F] block">نهاية ساعات الهدوء (اختياري)</span>
                <Input
                  type="time"
                  value={quietEnd}
                  onChange={(e) => setQuietEnd(e.target.value)}
                  className="bg-white border-[#CCD8CE] h-9 text-xs"
                />
              </label>
            </div>

            <Button
              type="submit"
              disabled={savingPrefs}
              className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold h-10 px-6 cursor-pointer"
            >
              {savingPrefs ? 'جارٍ الحفظ...' : 'حفظ تفضيلات الإشعارات'}
            </Button>
          </form>
        </section>

    </>
  )
}
