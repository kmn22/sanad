'use client'

import { useSandbox } from './_components/use-sandbox'
import { SandboxBanner } from './_components/SandboxBanner'
import { SandboxHeader } from './_components/SandboxHeader'
import { SandboxBody } from './_components/SandboxBody'
import { SandboxFooter } from './_components/SandboxFooter'

export default function SandboxPage() {
  const v = useSandbox()

  return (
    <div className="min-h-screen bg-[#F5F7F5] text-[#1B281F] font-sans flex flex-col justify-between" dir="rtl">
      {/* Top Persistent Countdown Banner for Sandbox */}
      <SandboxBanner v={v} />
      <SandboxHeader />
      <SandboxBody v={v} />
      <SandboxFooter />
    </div>
  )
}
