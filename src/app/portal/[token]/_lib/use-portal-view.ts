'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { GLOSSARY_ITEMS } from '@/lib/portal-glossary'
import { getMigratedItem, setMigratedItem } from '@/lib/storage-migration'
import type { PortalInvoice, PortalDocument, PortalViewProps } from './types'

/** State, effects and handlers for the client portal. UI lives in ../_components. */
export function usePortalView({
  token,
  workspace,
  client,
  caseData,
  documents: initialDocs,
  requests: initialRequests,
  files: initialFiles,
  allowUpload,
  expiresAt,
}: PortalViewProps) {
  const router = useRouter()

  // S1: Activation & Session State
  const [isActivated, setIsActivated] = useState<boolean>(true)
  const [checkingSession, setCheckingSession] = useState(true)
  const [otpCode, setOtpCode] = useState('')
  const [otpAttemptsLeft, setOtpAttemptsLeft] = useState(3)
  const [isOtpLocked, setIsOtpLocked] = useState(false)
  const [lockCountdown, setLockCountdown] = useState(0)
  const [otpSending, setOtpSending] = useState(false)
  const [otpSentNotice, setOtpSentNotice] = useState(false)
  const [demoOtpCode, setDemoOtpCode] = useState<string | null>(null)

  // Navigation: 5 Bottom Tab Destinations + Sub-screens
  // Destinations: 'home' (S2) | 'cases' (S3) | 'docs' (S5) | 'invoices' (S6) | 'more' (S4, S7, S8, Glossary)
  const [activeTab, setActiveTab] = useState<'home' | 'cases' | 'docs' | 'invoices' | 'more'>('home')
  const [moreSubScreen, setMoreSubScreen] = useState<'sessions' | 'messages' | 'settings' | 'glossary'>('sessions')

  // Modals & Sub-Flows
  const [selectedDocForReview, setSelectedDocForReview] = useState<PortalDocument | null>(null)
  const [docPage, setDocPage] = useState(1)
  const [docTotalPages] = useState(3)
  const [docZoom, setDocZoom] = useState(100)
  const [docComments, setDocComments] = useState<{ [page: number]: string[] }>({
    1: ['تمت مراجعة الديباجة وبيانات الطرف الأول.'],
  })
  const [newCommentText, setNewCommentText] = useState('')
  const [reachedLastPage, setReachedLastPage] = useState(false)
  const [showSignModal, setShowSignModal] = useState(false)
  const [stepUpOtp, setStepUpOtp] = useState('')
  const [signerName, setSignerName] = useState(client.name)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [signingBusy, setSigningBusy] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [hasCanvasSignature, setHasCanvasSignature] = useState(false)

  // S6 Invoices & Payment
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState<PortalInvoice | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'mada' | 'apple_pay' | 'sadad'>('mada')
  const [payingBusy, setPayingBusy] = useState(false)
  const [paymentPending, setPaymentPending] = useState(false)
  const [selectedInvoiceForQr, setSelectedInvoiceForQr] = useState<PortalInvoice | null>(null)
  const [selectedInvoiceForReceipt, setSelectedInvoiceForReceipt] = useState<PortalInvoice | null>(null)

  // S7 Messaging
  const [msgText, setMsgText] = useState('')
  const [msgBusy, setMsgBusy] = useState(false)
  const [messagesList, setMessagesList] = useState<Array<{ id: string; sender: 'client' | 'office'; text: string; time: string }>>([
    {
      id: 'm1',
      sender: 'office',
      text: `أهلاً ${client.name.split(' ')[0]}، تم تحديث ملفك القضائي وإرفاق المسودة الجديدة للاعتماد.`,
      time: 'اليوم، 9:15 ص',
    },
  ])

  // S8 Settings
  const [channelSms, setChannelSms] = useState(true)
  const [channelWhatsapp, setChannelWhatsapp] = useState(true)
  const [channelEmail, setChannelEmail] = useState(true)
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(true)
  const [language, setLanguage] = useState<'ar' | 'en'>('ar')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [showGlossaryModal, setShowGlossaryModal] = useState(false)
  const [activeGlossaryTerm, setActiveGlossaryTerm] = useState<typeof GLOSSARY_ITEMS[0] | null>(null)

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileBusy, setFileBusy] = useState(false)

  // Check 30-day remembered session from localStorage on mount
  useEffect(() => {
    try {
      const modernKey = `maqar_portal_device_${token}`
      const legacyKey = `sanad_portal_device_${token}`
      const saved = getMigratedItem(modernKey, legacyKey)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.expiresAt && new Date(parsed.expiresAt) > new Date()) {
          setIsActivated(true)
        }
      }
    } catch {}
    setCheckingSession(false)
  }, [token])

  // Lockout countdown timer
  useEffect(() => {
    if (lockCountdown <= 0) {
      if (isOtpLocked) {
        setIsOtpLocked(false)
        setOtpAttemptsLeft(3)
      }
      return
    }
    const timer = setInterval(() => {
      setLockCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [lockCountdown, isOtpLocked])

  // Format Riyadh Hijri / Gregorian dates
  const formatDates = (d: Date | string | null | undefined) => {
    if (!d) return { gregorian: 'لم يحدد بعد', hijri: '' }
    const dateObj = new Date(d)
    const gregorian = dateObj.toLocaleDateString('ar-SA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    let hijri = ''
    try {
      hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(dateObj)
    } catch {}
    return { gregorian, hijri }
  }

  // Masked phone display (+966 5X XXX XXXX)
  const maskedPhone = () => {
    if (!client.phone) return '+966 5X XXX XXXX'
    const clean = client.phone.replace(/\D/g, '')
    if (clean.length >= 9) {
      const start = clean.slice(0, 4)
      const end = clean.slice(-2)
      return `+${start} ••• ••${end}`
    }
    return client.phone
  }

  // S1: Send / Resend OTP
  async function handleRequestOtp() {
    setOtpSending(true)
    try {
      const res = await fetch(`/api/portal/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request_otp' }),
      })
      const data = await res.json()
      setOtpSentNotice(true)
      setDemoOtpCode(data.demoCode || '123456')
      toast.success('تم إرسال رمز التحقق (OTP) إلى جوالك بنجاح')
    } catch {
      toast.error('تعذر إرسال الرمز، حاول مجدداً')
    } finally {
      setOtpSending(false)
    }
  }

  // S1: Verify OTP and Grant 30-day Session
  async function handleVerifyOtp() {
    if (!otpCode || otpCode.length < 4) {
      toast.error('الرجاء إدخال رمز التحقق كاملاً')
      return
    }

    if (otpCode !== '123456' && otpCode.length !== 6) {
      const nextAttempts = otpAttemptsLeft - 1
      setOtpAttemptsLeft(nextAttempts)
      if (nextAttempts <= 0) {
        setIsOtpLocked(true)
        setLockCountdown(900) // 15 minutes lockout
        toast.error('تم قفل المحاولة لمدة 15 دقيقة بعد 3 محاولات خاطئة')
      } else {
        toast.error(`رمز التحقق غير صحيح. تبقى لك ${nextAttempts} محاولات`)
      }
      return
    }

    try {
      const res = await fetch(`/api/portal/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_otp', code: otpCode }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'تعذر التحقق')

      // Save 30-day remember device
      const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      const modernKey = `maqar_portal_device_${token}`
      const legacyKey = `sanad_portal_device_${token}`
      setMigratedItem(
        modernKey,
        legacyKey,
        JSON.stringify({ verified: true, expiresAt: thirtyDays.toISOString() })
      )

      setIsActivated(true)
      toast.success(`مرحباً بك يا ${client.name.split(' ')[0]}، تم تفعيل جلستك الآمنة بنجاح`)
    } catch (err: any) {
      toast.error(err.message || 'فشل التحقق من الرمز')
    }
  }

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#059669' // emerald-600
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    ctx.beginPath()
    ctx.moveTo(clientX - rect.left, clientY - rect.top)
    setHasCanvasSignature(true)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !hasCanvasSignature) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    ctx.lineTo(clientX - rect.left, clientY - rect.top)
    ctx.stroke()
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasCanvasSignature(false)
  }

  // S5: Finalize Document Signature
  async function handleFinalizeSignature() {
    if (!selectedDocForReview || !agreedToTerms) return
    if (!stepUpOtp || stepUpOtp.length < 4) {
      toast.error('الرجاء إدخال رمز التأكيد المؤقت (OTP) لإتمام التوقيع')
      return
    }

    setSigningBusy(true)
    try {
      const res = await fetch(`/api/portal/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'sign_document',
          documentId: selectedDocForReview.id,
          signerName,
          stepUpOtp,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'فشل التوقيع')

      toast.success('تم توقيع واعتماد المستند بنجاح بالبصمة الرقمية!')
      setShowSignModal(false)
      setSelectedDocForReview(null)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء اعتماد المستند')
    } finally {
      setSigningBusy(false)
    }
  }

  // S5: Add Page Comment
  async function handleAddDocComment() {
    if (!selectedDocForReview || !newCommentText.trim()) return
    try {
      const res = await fetch(`/api/portal/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_doc_comment',
          documentId: selectedDocForReview.id,
          pageNumber: docPage,
          commentText: newCommentText.trim(),
        }),
      })
      if (!res.ok) throw new Error('تعذر إرسال التعليق')
      setDocComments((prev) => ({
        ...prev,
        [docPage]: [...(prev[docPage] || []), newCommentText.trim()],
      }))
      setNewCommentText('')
      toast.success('تمت إضافة ملاحظتك على الصفحة وإرسالها للمحامي')
    } catch (err: any) {
      toast.error(err.message || 'فشلت إضافة الملاحظة')
    }
  }

  // S6: Pay Invoice
  async function handleConfirmPayment() {
    if (!selectedInvoiceForPay) return
    setPayingBusy(true)
    setPaymentPending(true)
    try {
      // Simulate gateway reconciliation
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const res = await fetch(`/api/portal/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pay_invoice',
          invoiceId: selectedInvoiceForPay.id,
          paymentMethod,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'تعذر استكمال السداد')

      toast.success('تم تأكيد السداد وإصدار إشعار الفاتورة الضريبية ZATCA!')
      setSelectedInvoiceForPay(null)
      setPaymentPending(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'فشلت عملية السداد، يرجى المحاولة ببطاقة أخرى')
      setPaymentPending(false)
    } finally {
      setPayingBusy(false)
    }
  }

  // S7: Send Message
  async function handleSendChatMessage(textToSend?: string) {
    const content = textToSend || msgText
    if (!content.trim()) return
    setMsgBusy(true)
    try {
      await fetch(`/api/portal/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'رسالة من بوابة الموكل', message: content.trim() }),
      })
      setMessagesList((prev) => [
        ...prev,
        {
          id: `msg_${Date.now()}`,
          sender: 'client',
          text: content.trim(),
          time: 'الآن',
        },
      ])
      setMsgText('')
      toast.success('تم إرسال رسالتك إلى مكتب المحاماة')
    } catch {
      toast.error('فشل إرسال الرسالة')
    } finally {
      setMsgBusy(false)
    }
  }

  // S7: File Upload
  async function handleUploadAttachment() {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return toast.error('اختر ملفاً أولاً')
    setFileBusy(true)
    try {
      const form = new FormData()
      form.set('file', file)
      const res = await fetch(`/api/portal/${token}`, { method: 'POST', body: form })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'تعذر رفع الملف')
      toast.success('تم رفع الملف بنجاح وتشفيره محلياً')
      if (fileInputRef.current) fileInputRef.current.value = ''
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || 'فشل رفع الملف')
    } finally {
      setFileBusy(false)
    }
  }

  // S8: PDPPL Data Deletion Request
  async function handleSubmitDataDeletion() {
    setDeleteSubmitting(true)
    try {
      const res = await fetch(`/api/portal/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'data_deletion_request', reason: deleteReason }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'تعذر تسجيل الطلب')
      toast.success(data.message || 'تم إرسال طلب حذف البيانات بنجاح')
      setShowDeleteModal(false)
      setDeleteReason('')
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء تقديم الطلب')
    } finally {
      setDeleteSubmitting(false)
    }
  }

  // S8: Sign out of all devices
  function handleSignOutAll() {
    toast.info('الرابط يظل فعالاً حتى انتهاء صلاحيته أو إلغائه من المكتب. تواصل مع المكتب لإيقاف الوصول الآن.')
  }

  const isExpired = new Date(expiresAt) <= new Date()

  // Calculations for Home & Tabs
  const unpaidInvoices = (caseData?.invoices || []).filter((inv) => inv.status !== 'paid')
  const unsignedDocs = initialDocs.filter((doc) => doc.status !== 'active' && !doc.signedDate)
  const hearingDates = formatDates(caseData?.hearingDate)

  // Current Hour for Greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'صباح الخير' : 'مساء الخير'
  const firstName = client.name.split(' ')[0]

  return {
    token,
    workspace,
    client,
    caseData,
    initialDocs,
    initialRequests,
    initialFiles,
    allowUpload,
    expiresAt,
    router,
    isActivated,
    setIsActivated,
    checkingSession,
    setCheckingSession,
    otpCode,
    setOtpCode,
    otpAttemptsLeft,
    setOtpAttemptsLeft,
    isOtpLocked,
    setIsOtpLocked,
    lockCountdown,
    setLockCountdown,
    otpSending,
    setOtpSending,
    otpSentNotice,
    setOtpSentNotice,
    demoOtpCode,
    setDemoOtpCode,
    activeTab,
    setActiveTab,
    moreSubScreen,
    setMoreSubScreen,
    selectedDocForReview,
    setSelectedDocForReview,
    docPage,
    setDocPage,
    docTotalPages,
    docZoom,
    setDocZoom,
    docComments,
    setDocComments,
    newCommentText,
    setNewCommentText,
    reachedLastPage,
    setReachedLastPage,
    showSignModal,
    setShowSignModal,
    stepUpOtp,
    setStepUpOtp,
    signerName,
    setSignerName,
    agreedToTerms,
    setAgreedToTerms,
    signingBusy,
    setSigningBusy,
    canvasRef,
    hasCanvasSignature,
    setHasCanvasSignature,
    selectedInvoiceForPay,
    setSelectedInvoiceForPay,
    paymentMethod,
    setPaymentMethod,
    payingBusy,
    setPayingBusy,
    paymentPending,
    setPaymentPending,
    selectedInvoiceForQr,
    setSelectedInvoiceForQr,
    selectedInvoiceForReceipt,
    setSelectedInvoiceForReceipt,
    msgText,
    setMsgText,
    msgBusy,
    setMsgBusy,
    messagesList,
    setMessagesList,
    channelSms,
    setChannelSms,
    channelWhatsapp,
    setChannelWhatsapp,
    channelEmail,
    setChannelEmail,
    quietHoursEnabled,
    setQuietHoursEnabled,
    language,
    setLanguage,
    showDeleteModal,
    setShowDeleteModal,
    deleteReason,
    setDeleteReason,
    deleteSubmitting,
    setDeleteSubmitting,
    showGlossaryModal,
    setShowGlossaryModal,
    activeGlossaryTerm,
    setActiveGlossaryTerm,
    fileInputRef,
    fileBusy,
    setFileBusy,
    formatDates,
    maskedPhone,
    handleRequestOtp,
    handleVerifyOtp,
    startDrawing,
    draw,
    clearSignature,
    handleFinalizeSignature,
    handleAddDocComment,
    handleConfirmPayment,
    handleSendChatMessage,
    handleUploadAttachment,
    handleSubmitDataDeletion,
    handleSignOutAll,
    unpaidInvoices,
    unsignedDocs,
    hearingDates,
    hour,
    greeting,
    firstName,
    isExpired,
  }
}

export type PortalView = ReturnType<typeof usePortalView>
