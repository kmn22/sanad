'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import {
  ShieldCheck,
  KeyRound,
  Bell,
  Download,
  AlertTriangle,
  Copy,
  Check,
  ArrowRight,
  Building2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type NotificationType = 'system' | 'assignment' | 'workflow' | 'portal' | 'approval' | 'security' | 'reminder'

const NOTIFICATION_LABELS: Array<{ type: NotificationType; label: string; desc: string }> = [
  { type: 'security', label: 'تنبيهات الأمان والحساب', desc: 'تسجيلات الدخول، تغييرات كلمة المرور، والتحقق الثنائي' },
  { type: 'reminder', label: 'تذكيرات الجلسات والمواعيد', desc: 'مواعيد المحاكم، المهام المستحقة، وانتهاء التراخيص' },
  { type: 'assignment', label: 'إسناد القضايا والمهام', desc: 'عند تكليفك بقضية أو مهمة جديدة داخل المكتب' },
  { type: 'workflow', label: 'تحديثات سير العمل', desc: 'انتقال القضايا بين المراحل وتحديثات الفريق' },
  { type: 'portal', label: 'بوابة الموكل والملفات', desc: 'رفع الموكلين للمستندات أو استفسارات البوابة' },
  { type: 'approval', label: 'طلبات الاعتماد والمراجعة', desc: 'مسودات العقود والمذكرات بانتظار موافقتك' },
  { type: 'system', label: 'إشعارات النظام العامة', desc: 'التحديثات التشغيلية والتنبيهات الإدارية' },
]

type PrefState = Record<NotificationType, { inApp: boolean; email: boolean }>

function defaultPrefs(): PrefState {
  return {
    security: { inApp: true, email: true },
    reminder: { inApp: true, email: true },
    assignment: { inApp: true, email: true },
    workflow: { inApp: true, email: true },
    portal: { inApp: true, email: true },
    approval: { inApp: true, email: true },
    system: { inApp: true, email: true },
  }
}

export default function SecuritySettingsPage() {
  const { data: session } = useSession()
  const user = session?.user as { role?: string; mfaEnabled?: boolean; isOwner?: boolean } | undefined
  const privileged = user?.role === 'admin' || user?.role === 'workspace_owner' || Boolean(user?.isOwner)

  const [secret, setSecret] = useState('')
  const [uri, setUri] = useState('')
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [token, setToken] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [message, setMessage] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordOtp, setPasswordOtp] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [disableOtp, setDisableOtp] = useState('')

  // Notification preferences state
  const [prefs, setPrefs] = useState<PrefState>(defaultPrefs)
  const [quietStart, setQuietStart] = useState('')
  const [quietEnd, setQuietEnd] = useState('')
  const [savingPrefs, setSavingPrefs] = useState(false)

  // Workspace export & self-service deletion state (for solo/firm owners)
  const [workspaceName, setWorkspaceName] = useState('')
  const [exporting, setExporting] = useState(false)
  const [deleteConfirmName, setDeleteConfirmName] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetch('/api/notification-preferences')
      .then(async (r) => (r.ok ? r.json() : []))
      .then((rows: Array<{ type: string; inApp: boolean; email: boolean; quietStart?: string | null; quietEnd?: string | null }>) => {
        if (!Array.isArray(rows) || rows.length === 0) return
        const next = defaultPrefs()
        for (const row of rows) {
          if (row.type in next) {
            next[row.type as NotificationType] = { inApp: row.inApp !== false, email: row.email !== false }
          }
          if (row.quietStart) setQuietStart(row.quietStart)
          if (row.quietEnd) setQuietEnd(row.quietEnd)
        }
        setPrefs(next)
      })
      .catch(() => {})

    fetch('/api/saas/status')
      .then(async (r) => (r.ok ? r.json() : null))
      .then((status) => {
        if (status?.workspace?.name) setWorkspaceName(status.workspace.name)
      })
      .catch(() => {})
  }, [])

  async function beginSetup() {
    const response = await fetch('/api/auth/mfa/setup', { method: 'POST' })
    const result = await response.json()
    if (!response.ok) return setMessage(result.error || 'تعذر بدء الإعداد')
    setSecret(result.secret)
    setUri(result.uri)
    setQrDataUrl(result.qrDataUrl || '')
    setMessage('امسح رمز QR بتطبيق المصادقة (Google Authenticator أو Microsoft Authenticator) ثم أدخل الرمز المكون من 6 أرقام.')
  }

  async function verify() {
    const response = await fetch('/api/auth/mfa/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const result = await response.json()
    if (!response.ok) return setMessage(result.error || 'رمز غير صالح')
    setRecoveryCodes(result.recoveryCodes)
    setMessage('تم تفعيل التحقق بخطوتين. احفظ رموز الاسترداد الآن، ثم سجّل الدخول من جديد.')
    toast.success('تم تفعيل التحقق بخطوتين بنجاح')
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) return setMessage('تأكيد كلمة المرور غير متطابق')
    const response = await fetch('/api/auth/password/change', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword, otp: passwordOtp }),
    })
    const result = await response.json()
    if (!response.ok) return setMessage(result.error || 'تعذر تغيير كلمة المرور')
    setMessage('تم تغيير كلمة المرور وإنهاء الجلسات الأخرى. سجّل الدخول مرة أخرى.')
    toast.success('تم تحديث كلمة المرور')
  }

  async function disableMfa(e: FormEvent) {
    e.preventDefault()
    const response = await fetch('/api/auth/mfa/disable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: disablePassword, otp: disableOtp }),
    })
    const result = await response.json()
    if (!response.ok) return setMessage(result.error || 'تعذر تعطيل التحقق بخطوتين')
    setMessage('تم تعطيل التحقق بخطوتين وإنهاء الجلسات الأخرى.')
  }

  async function saveNotificationPreferences(e: FormEvent) {
    e.preventDefault()
    setSavingPrefs(true)
    try {
      const payload = NOTIFICATION_LABELS.map(({ type }) => ({
        type,
        inApp: prefs[type].inApp,
        email: prefs[type].email,
        quietStart: quietStart || null,
        quietEnd: quietEnd || null,
      }))
      const res = await fetch('/api/notification-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: payload }),
      })
      if (!res.ok) throw new Error()
      toast.success('تم حفظ تفضيلات الإشعارات وساعات الهدوء')
    } catch {
      toast.error('تعذر حفظ تفضيلات الإشعارات')
    } finally {
      setSavingPrefs(false)
    }
  }

  async function exportWorkspaceData() {
    setExporting(true)
    try {
      const response = await fetch('/api/privacy/export', { method: 'POST' })
      if (!response.ok) throw new Error()
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `sanad-data-export-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
      toast.success('تم تنزيل نسخة البيانات الكاملة (JSON)')
    } catch {
      toast.error('تعذر تصدير البيانات')
    } finally {
      setExporting(false)
    }
  }

  async function deleteWorkspace() {
    setDeleting(true)
    const response = await fetch('/api/workspace', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ confirmName: deleteConfirmName.trim(), password: deletePassword }),
    })
    const result = await response.json().catch(() => ({}))
    setDeleting(false)
    if (!response.ok) {
      return toast.error(result.error || 'تعذر حذف مساحة العمل')
    }
    toast.success('تم حذف مساحة العمل نهائياً')
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <div className="min-h-screen bg-[#F5F7F5] text-[#1B281F] font-sans" dir="rtl">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-10 space-y-6">
        {/* Top Breadcrumb & Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1.5 flex items-center gap-2 text-xs text-[#566A5C]">
              <Link href="/dashboard" className="text-[#1F7A46] hover:underline font-bold inline-flex items-center gap-1">
                <ArrowRight className="w-3.5 h-3.5" /> العودة إلى مساحة العمل
              </Link>
              <span>/</span>
              <span>الأمان والخصوصية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-[#1B281F]">أمان الحساب والخصوصية</h1>
            <p className="text-xs sm:text-sm text-[#4A5D50] mt-1">
              التحقق بخطوتين (MFA)، كلمة المرور، تفضيلات الإشعارات، وحقوق صاحب البيانات وفق نظام (PDPL).
            </p>
          </div>
          {privileged && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#CCD8CE] bg-white px-3.5 py-2 text-xs font-bold text-[#1B281F] hover:border-[#1F7A46] transition-colors"
            >
              <Building2 className="w-4 h-4 text-[#1F7A46]" />
              لوحة الإدارة والامتثال
            </Link>
          )}
        </div>

        {message && (
          <div role="status" className="rounded-xl border border-[#CCD8CE] bg-[#E8EFE9] p-4 text-xs sm:text-sm text-[#1B281F] font-medium">
            {message}
          </div>
        )}

        {/* 1. Two-Factor Authentication (MFA) with Scannable QR Code */}
        <section className="rounded-2xl border border-[#CCD8CE] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold font-heading flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1F7A46]" />
                <span>التحقق بخطوتين (MFA / TOTP)</span>
              </h2>
              <p className="text-xs text-[#566A5C] mt-0.5">
                إلزامي لمالكي المكاتب والمديرين، ويحمي حسابك عبر تطبيقات المصادقة القياسية.
              </p>
            </div>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                user?.mfaEnabled
                  ? 'bg-[#E8EFE9] text-[#1F7A46] border-[#CCD8CE]'
                  : 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]'
              }`}
            >
              {user?.mfaEnabled ? 'مفعّل ✓' : 'غير مفعّل'}
            </span>
          </div>

          {!secret && !user?.mfaEnabled && (
            <Button
              onClick={beginSetup}
              className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold h-10 px-5 cursor-pointer"
            >
              بدء إعداد تطبيق المصادقة
            </Button>
          )}

          {secret && !recoveryCodes.length && (
            <div className="space-y-4 pt-2 border-t border-[#CCD8CE]">
              <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-5 items-center bg-[#F5F7F5] p-4 rounded-2xl border border-[#CCD8CE]">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="رمز QR لإعداد التحقق بخطوتين"
                    className="w-44 h-44 rounded-xl border border-[#CCD8CE] bg-white p-2 mx-auto"
                  />
                )}
                <div className="space-y-2.5 text-xs">
                  <p className="font-bold text-[#1B281F]">
                    1. امسح رمز QR بتطبيق المصادقة على جوالك، أو انسخ المفتاح السري يدوياً:
                  </p>
                  <div className="flex items-center gap-2 bg-white border border-[#CCD8CE] rounded-xl p-2.5 font-mono text-xs" dir="ltr">
                    <span className="truncate flex-1 select-all">{secret}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(secret)
                        setCopiedSecret(true)
                        setTimeout(() => setCopiedSecret(false), 2000)
                      }}
                      className="text-[#1F7A46] font-sans font-bold text-[11px] inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      {copiedSecret ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedSecret ? 'تم النسخ' : 'نسخ'}
                    </button>
                  </div>
                  <details className="text-[11px] text-[#566A5C]">
                    <summary className="cursor-pointer hover:text-[#1B281F]">رابط الإعداد المتقدم (otpauth)</summary>
                    <p className="break-all font-mono mt-1 bg-white p-2 rounded border border-[#CCD8CE]" dir="ltr">{uri}</p>
                  </details>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="أدخل الرمز المكون من 6 أرقام"
                  className="bg-[#F5F7F5] border-[#CCD8CE] h-10 text-xs sm:max-w-xs"
                />
                <Button
                  onClick={verify}
                  className="bg-[#1F7A46] hover:bg-[#165832] text-white text-xs font-bold h-10 px-6 cursor-pointer"
                >
                  تحقق وفعّل
                </Button>
              </div>
            </div>
          )}

          {recoveryCodes.length > 0 && (
            <div className="mt-4 rounded-xl border border-[#CCD8CE] bg-[#F5F7F5] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-[#1B281F]">رموز الاسترداد الاحتياطية — تظهر مرة واحدة فقط</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(recoveryCodes.join('\n'))
                    toast.success('تم نسخ رموز الاسترداد')
                  }}
                  className="h-7 text-xs"
                >
                  نسخ الرموز
                </Button>
              </div>
              <ul className="grid grid-cols-2 gap-2 font-mono text-xs bg-white p-3 rounded-lg border border-[#CCD8CE]" dir="ltr">
                {recoveryCodes.map((code) => (
                  <li key={code}>{code}</li>
                ))}
              </ul>
            </div>
          )}

          {user?.mfaEnabled && !privileged && (
            <form onSubmit={disableMfa} className="mt-4 grid gap-3 border-t border-[#CCD8CE] pt-4">
              <h3 className="font-bold text-sm">تعطيل التحقق بخطوتين</h3>
              <Input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                required
                placeholder="كلمة المرور الحالية"
                className="bg-[#F5F7F5] border-[#CCD8CE]"
              />
              <Input
                value={disableOtp}
                onChange={(e) => setDisableOtp(e.target.value)}
                required
                placeholder="رمز المصادقة أو الاسترداد"
                className="bg-[#F5F7F5] border-[#CCD8CE]"
              />
              <Button variant="destructive" className="w-fit text-xs">
                تعطيل MFA
              </Button>
            </form>
          )}
          {privileged && (
            <p className="text-xs text-[#566A5C]">
              لا يمكن تعطيل MFA للحسابات الإدارية ومالكي مساحات العمل إلا عبر إعادة تعيين من مدير آخر.
            </p>
          )}
        </section>

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

        {/* 4. PDPL Data Export & Workspace Self-Service Erasure */}
        <section className="rounded-2xl border border-[#CCD8CE] bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold font-heading flex items-center gap-2">
                <Download className="w-5 h-5 text-[#1F7A46]" />
                <span>تصدير البيانات وحقوق الخصوصية (PDPL)</span>
              </h2>
              <p className="text-xs text-[#566A5C] mt-0.5">
                احصل على نسخة مقروءة وموقعة رقمياً من بيانات حسابك ومساحة عملك بصيغة JSON.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={exportWorkspaceData}
              disabled={exporting}
              className="border-[#CCD8CE] text-xs font-bold h-9 cursor-pointer"
            >
              {exporting ? 'جارٍ التصدير...' : 'تنزيل نسخة البيانات الكاملة (JSON)'}
            </Button>
          </div>

          {privileged && workspaceName && (
            <div className="mt-4 pt-4 border-t border-rose-500/30 space-y-3">
              <div className="flex items-start gap-2.5 text-rose-800">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <h3 className="font-bold text-sm">حذف مساحة العمل نهائياً ({workspaceName})</h3>
                  <p className="text-xs text-[#4A5D50] mt-0.5">
                    يمسح هذا الإجراء كافة القضايا والمستندات والفواتير والبيانات المرتبطة بمساحة العمل بشكل غير قابل للتراجع. يتطلب تفعيل MFA وعدم وجود حجز قانوني نشط.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={`اكتب «${workspaceName}» للتأكيد`}
                  className="bg-[#F5F7F5] border-[#CCD8CE] h-10 text-xs"
                />
                <Input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="كلمة المرور الحالية"
                  className="bg-[#F5F7F5] border-[#CCD8CE] h-10 text-xs"
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                disabled={deleting || !deletePassword || deleteConfirmName.trim() !== workspaceName}
                onClick={deleteWorkspace}
                className="text-xs font-bold h-9 cursor-pointer"
              >
                {deleting ? 'جارٍ الحذف...' : 'حذف مساحة العمل نهائياً'}
              </Button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
