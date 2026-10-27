'use client'

import { KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SecuritySettingsState } from './use-security-settings'

export function ChangePasswordSection({ v }: { v: SecuritySettingsState }) {
  const { user, currentPassword, setCurrentPassword, newPassword, setNewPassword, confirmPassword, setConfirmPassword, passwordOtp, setPasswordOtp, changePassword } = v
  return (
    <>
        {/* 2. Change Password */}
        <section className="rounded-2xl border border-[#CCD8CE] bg-white p-6 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold font-heading flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-[#1F7A46]" />
              <span>تغيير كلمة المرور</span>
            </h2>
            <p className="text-xs text-[#566A5C] mt-0.5">
              يؤدي تغيير كلمة المرور إلى إنهاء كافة الجلسات النشطة الأخرى فوراً.
            </p>
          </div>
          <form onSubmit={changePassword} className="grid gap-3">
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              placeholder="كلمة المرور الحالية"
              className="bg-[#F5F7F5] border-[#CCD8CE] h-10 text-xs"
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={12}
                placeholder="كلمة المرور الجديدة (12 حرفاً على الأقل مع حرف ورقم)"
                className="bg-[#F5F7F5] border-[#CCD8CE] h-10 text-xs"
              />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={12}
                placeholder="تأكيد كلمة المرور الجديدة"
                className="bg-[#F5F7F5] border-[#CCD8CE] h-10 text-xs"
              />
            </div>
            {user?.mfaEnabled && (
              <Input
                value={passwordOtp}
                onChange={(e) => setPasswordOtp(e.target.value)}
                required
                inputMode="numeric"
                maxLength={6}
                placeholder="رمز المصادقة الحالي (6 أرقام)"
                className="bg-[#F5F7F5] border-[#CCD8CE] h-10 text-xs sm:max-w-xs"
              />
            )}
            <div>
              <Button type="submit" className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold h-10 px-6 cursor-pointer">
                تغيير كلمة المرور
              </Button>
            </div>
          </form>
        </section>

    </>
  )
}
