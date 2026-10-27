'use client'

import { FormEvent, useEffect, useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { NotificationType, NOTIFICATION_LABELS, PrefState, defaultPrefs } from '../_lib/notifications'

export function useSecuritySettings() {
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

  return {
    session,
    user,
    privileged,
    secret,
    setSecret,
    uri,
    setUri,
    qrDataUrl,
    setQrDataUrl,
    token,
    setToken,
    recoveryCodes,
    setRecoveryCodes,
    copiedSecret,
    setCopiedSecret,
    message,
    setMessage,
    currentPassword,
    setCurrentPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    passwordOtp,
    setPasswordOtp,
    disablePassword,
    setDisablePassword,
    disableOtp,
    setDisableOtp,
    prefs,
    setPrefs,
    quietStart,
    setQuietStart,
    quietEnd,
    setQuietEnd,
    savingPrefs,
    setSavingPrefs,
    workspaceName,
    setWorkspaceName,
    exporting,
    setExporting,
    deleteConfirmName,
    setDeleteConfirmName,
    deletePassword,
    setDeletePassword,
    deleting,
    setDeleting,
    beginSetup,
    verify,
    changePassword,
    disableMfa,
    saveNotificationPreferences,
    exportWorkspaceData,
    deleteWorkspace,
  }
}

export type SecuritySettingsState = ReturnType<typeof useSecuritySettings>
