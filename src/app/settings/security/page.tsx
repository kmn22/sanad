'use client'

import { useSecuritySettings } from './_components/use-security-settings'
import { SecurityHeader } from './_components/SecurityHeader'
import { MfaSection } from './_components/MfaSection'
import { ChangePasswordSection } from './_components/ChangePasswordSection'
import { NotificationPreferencesSection } from './_components/NotificationPreferencesSection'
import { DataPrivacySection } from './_components/DataPrivacySection'

export default function SecuritySettingsPage() {
  const v = useSecuritySettings()

  return (
    <div className="min-h-screen bg-[#F5F7F5] text-[#1B281F] font-sans" dir="rtl">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
        <SecurityHeader v={v} />
        <MfaSection v={v} />
        <ChangePasswordSection v={v} />
        <NotificationPreferencesSection v={v} />
        <DataPrivacySection v={v} />
      </main>
    </div>
  )
}
