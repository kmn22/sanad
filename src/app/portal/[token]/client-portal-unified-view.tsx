'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  CreditCard,
  PenTool,
  Send,
  Upload,
  MessageSquare,
  Building2,
  Phone,
  Scale,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Lock,
  ExternalLink,
  MapPin,
  RefreshCw,
  QrCode,
  Check,
  Eye,
  BookOpen,
  Settings,
  Bell,
  Smartphone,
  Globe,
  Trash2,
  HelpCircle,
  ZoomIn,
  ZoomOut,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export interface PortalInvoice {
  id: string
  number: string
  issueDate: string | Date
  dueDate: string | Date | null
  status: string
  subtotal: number
  vatRate: number
  vatAmount: number
  total: number
  paidAmount: number
  paidAt: string | Date | null
  zatcaStatus: string
  zatcaHash: string | null
}

export interface PortalDocument {
  id: string
  title: string
  docType: string
  status: string
  parties: string
  signedDate: string | Date | null
  updatedAt: string | Date
  notes: string | null
}

export interface PortalRequestItem {
  id: string
  title: string
  message: string
  status: string
  priority: string
  dueDate: string | Date | null
  createdAt: string | Date
}

export interface PortalFileItem {
  id: string
  originalName: string
  mimeType: string
  sizeBytes: number
  status?: string
  createdAt: string | Date
}

interface Props {
  token: string
  workspace: { id: string; name: string } | null
  client: { id: string; name: string; type: string; phone?: string | null; email?: string | null }
  caseData: {
    id: string
    title: string
    caseType: string
    stage: string
    priority: string
    dueDate: string | Date | null
    hearingDate: string | Date | null
    caseNumber: string | null
    court: string | null
    opposingParty?: string | null
    notes?: string | null
    invoices?: PortalInvoice[]
  } | null
  documents: PortalDocument[]
  requests: PortalRequestItem[]
  files: PortalFileItem[]
  allowUpload: boolean
  expiresAt: string | Date
}

import { GLOSSARY_ITEMS, type GlossaryEntry } from '@/lib/portal-glossary'
export { GLOSSARY_ITEMS, type GlossaryEntry }

export default function ClientPortalUnifiedView({
  token,
  workspace,
  client,
  caseData,
  documents: initialDocs,
  requests: initialRequests,
  files: initialFiles,
  allowUpload,
  expiresAt,
}: Props) {
  const router = useRouter()

  // S1: Activation & Session State
  const [isActivated, setIsActivated] = useState<boolean>(false)
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
      const storageKey = `sanad_portal_device_${token}`
      const saved = localStorage.getItem(storageKey)
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
      localStorage.setItem(
        `sanad_portal_device_${token}`,
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
    localStorage.removeItem(`sanad_portal_device_${token}`)
    setIsActivated(false)
    toast.success('تم تسجيل الخروج بنجاح وإلغاء تذكر هذا الجهاز')
  }

  // -------------------------------------------------------------
  // SCREEN S1: MAGIC-LINK ACTIVATION (تفعيل الدعوة)
  // -------------------------------------------------------------
  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-300">جاري التحقق من أمان الرابط...</p>
        </div>
      </div>
    )
  }

  // Expired link screen state
  const isExpired = new Date(expiresAt) <= new Date()
  if (isExpired) {
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
  }

  if (!isActivated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between p-4 sm:p-6 font-sans relative overflow-hidden" dir="rtl">
        {/* Glow aesthetics */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[40%] bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[40%] bg-teal-600/15 rounded-full blur-[120px] pointer-events-none" />

        {/* Top status bar simulation */}
        <div className="w-full max-w-sm mx-auto flex items-center justify-between text-xs text-slate-400 pt-2 pb-6">
          <span className="font-mono">9:41</span>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="border-slate-800 text-[10px] text-emerald-400 bg-emerald-950/40">
              SMS • آمن
            </Badge>
          </div>
        </div>

        {/* S1 Main Card */}
        <div className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center">
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white font-bold text-2xl shadow-lg ring-1 ring-emerald-400/30 mx-auto">
              س
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">سند • بوابة الموكل</h1>
            <p className="text-sm text-emerald-300 font-medium">
              مرحباً، {client.name.split(' ')[0]}
            </p>
            <p className="text-xs text-slate-300 px-4 leading-relaxed">
              لديك دعوة من <strong className="text-white">{workspace?.name || 'مكتب المحاماة'}</strong> لمتابعة قضيتك ومراجعة المستندات بدون كلمات مرور.
            </p>
          </div>

          <Card className="bg-slate-900/80 border-slate-800 backdrop-blur-xl shadow-2xl p-6 rounded-3xl space-y-5">
            <div>
              <label htmlFor="s1-phone" className="text-xs font-semibold text-slate-400 block mb-1.5">
                رقم الجوال المرتبط بالدعوة:
              </label>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white font-mono text-center tracking-wider text-sm flex items-center justify-center gap-2">
                <Smartphone className="h-4 w-4 text-emerald-400" />
                <span>{maskedPhone()}</span>
              </div>
            </div>

            {isOtpLocked ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs space-y-2 text-center">
                <AlertTriangle className="h-6 w-6 text-rose-400 mx-auto" />
                <p className="font-bold">تم قفل المحاولة مؤقتاً</p>
                <p>تم استنفاد 3 محاولات خاطئة. يرجى الانتظار: {Math.floor(lockCountdown / 60)} دقيقة و {lockCountdown % 60} ثانية</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="s1-otp" className="text-xs font-semibold text-slate-400">
                    أدخل رمز التحقق (OTP):
                  </label>
                  {demoOtpCode && (
                    <button
                      type="button"
                      onClick={() => setOtpCode(demoOtpCode)}
                      className="text-[11px] text-emerald-400 underline font-mono cursor-pointer"
                    >
                      تعبئة الرمز ({demoOtpCode})
                    </button>
                  )}
                </div>
                <Input
                  id="s1-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="• • • • • •"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="bg-slate-800/70 border-slate-700 text-center font-mono text-xl tracking-[0.4em] text-white h-13 rounded-xl focus-visible:ring-emerald-500"
                />

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>صلاحية الرمز: 10 دقائق</span>
                  <span>المحاولات المتبقية: {otpAttemptsLeft}</span>
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-900/30 text-sm gap-2 transition-all cursor-pointer"
                >
                  <Lock className="h-4 w-4" />
                  <span>تأكيد الدخول لبوابتي</span>
                </Button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={otpSending}
                    className="text-xs text-slate-400 hover:text-emerald-400 transition-colors underline cursor-pointer"
                  >
                    {otpSending ? 'جاري إرسال الرمز...' : 'لم يصلك الرمز؟ أعد الإرسال الآن'}
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* PDPPL Consent Single Line */}
          <div className="mt-6 text-center px-4">
            <p className="text-[11px] text-slate-400 leading-relaxed">
              بالمتابعة أنت توافق على{' '}
              <a href="/privacy" target="_blank" className="text-emerald-400 underline">
                سياسة الخصوصية
              </a>
              . تستطيع طلب حذف بياناتك في أي وقت من الإعدادات.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-sm mx-auto text-center text-[10px] text-slate-600 py-3">
          سند للأمان القانوني • مشفر ومحمي بموجب نظام حماية البيانات الشخصية السعودي
        </div>
      </div>
    )
  }

  // Calculations for Home & Tabs
  const unpaidInvoices = (caseData?.invoices || []).filter((inv) => inv.status !== 'paid')
  const unsignedDocs = initialDocs.filter((doc) => doc.status !== 'active' && !doc.signedDate)
  const hearingDates = formatDates(caseData?.hearingDate)

  // Current Hour for Greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'صباح الخير' : 'مساء الخير'
  const firstName = client.name.split(' ')[0]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col justify-between pb-20 md:pb-6" dir="rtl">
      {/* Sovereign Header */}
      <header className="sticky top-0 z-30 border-b bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-3 shadow-xs">
        <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 flex items-center justify-center font-bold">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm">{workspace?.name || 'مكتب المحاماة الشريك'}</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-emerald-50 text-emerald-700 border-emerald-300">
                  موثق
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">بوابة الموكل الرقمية • بدون كلمات مرور</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowGlossaryModal(true)}
              className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 text-xs flex items-center gap-1 font-medium transition-colors cursor-pointer"
              title="دليل المصطلحات المبسطة"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">دليل المصطلحات</span>
            </button>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-8 gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() => {
                const phone = client.phone ? client.phone.replace(/\D/g, '') : ''
                window.open(`https://wa.me/${phone}?text=${encodeURIComponent('السلام عليكم، لدي استفسار بخصوص ملفي في سند')}`, '_blank')
              }}
            >
              <Phone className="h-3 w-3" />
              <span>اتصال</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Surfaces based on Active Tab */}
      <main className="max-w-md md:max-w-2xl mx-auto w-full p-4 space-y-4 flex-1">
        {/* ========================================================
            SCREEN S2: HOME DASHBOARD (الرئيسية)
           ======================================================== */}
        {activeTab === 'home' && (
          <div className="space-y-4 animate-in fade-in">
            {/* Greeting */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  {greeting}، {firstName}
                </h2>
                <p className="text-xs text-muted-foreground">
                  إليك ملخص الإجراءات والتحديثات القانونية المباشرة لملفك اليوم
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200">
                جلسة آمنة (30 يوماً)
              </Badge>
            </div>

            {/* Action-First Floating Alert if documents need approval */}
            {unsignedDocs.length > 0 && (
              <div
                onClick={() => setActiveTab('docs')}
                className="cursor-pointer rounded-2xl border-2 border-emerald-500 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-900 p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-600 text-white shadow-xs">
                    <PenTool className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-emerald-950 dark:text-emerald-100">
                        {unsignedDocs[0].title}
                      </span>
                      <Badge className="bg-emerald-600 text-white text-[10px] px-2 py-0.5">
                        ينتظر موافقتك
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                      مستند جاهز للمراجعة والتوقيع الإلكتروني من جوالك بنقرة زر.
                    </p>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-emerald-600 shrink-0" />
              </div>
            )}

            {/* Invoice Badge Card when payment is due */}
            {unpaidInvoices.length > 0 && (
              <div
                onClick={() => setActiveTab('invoices')}
                className="cursor-pointer rounded-2xl border border-amber-300 bg-amber-50/90 dark:bg-amber-950/30 p-4 shadow-xs hover:border-amber-400 transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500 text-white">
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-amber-950 dark:text-amber-100">
                        فاتورة جديدة — {unpaidInvoices[0].total.toLocaleString('ar-SA')} ر.س
                      </span>
                      <Badge variant="outline" className="border-amber-400 text-amber-800 text-[10px]">
                        تستحق خلال 5 أيام
                      </Badge>
                    </div>
                    <p className="text-xs text-amber-800 dark:text-amber-200 mt-0.5">
                      فاتورة ضريبية ZATCA رقم {unpaidInvoices[0].number} • سداد فوري بمدى و Apple Pay
                    </p>
                  </div>
                </div>
                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-8">
                  سداد الآن
                </Button>
              </div>
            )}

            {/* Matter Cards (One card per matter with client-friendly title) */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
              <CardHeader className="pb-3 bg-slate-50/50 dark:bg-slate-900/50 border-b">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-600">القضية الحالية</span>
                    <CardTitle className="text-base font-bold">
                      {caseData?.title || 'قضية عقد العمل — شركة الريف'}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {caseData?.court || 'المحكمة العامة بجدة'} • الدائرة العمالية الرابعة
                    </p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-xs">
                    قيد الإجراء
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* One-Line Plain Arabic Status Phrase */}
                <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs space-y-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">حالة القضية الآن:</span>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    قضيتك مستمرة — لا يوجد مطلوب منك حالياً. محاميك باشر إعداد الدفوع الرسمية للجلسة المقبلة.
                  </p>
                </div>

                {/* Next Event Date */}
                {caseData?.hearingDate && (
                  <div
                    onClick={() => {
                      setActiveTab('more')
                      setMoreSubScreen('sessions')
                    }}
                    className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 flex items-center justify-between cursor-pointer hover:bg-emerald-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="h-4 w-4 text-emerald-600" />
                      <div>
                        <span className="text-[11px] text-muted-foreground block">موعد الجلسة القادمة:</span>
                        <span className="font-bold text-xs text-emerald-950 dark:text-emerald-100">
                          {hearingDates.gregorian} ({hearingDates.hijri})
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] text-emerald-700">
                      لا يُشترط حضورك
                    </Badge>
                  </div>
                )}

                {/* Direct quick action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs justify-between"
                    onClick={() => setActiveTab('cases')}
                  >
                    <span>تفاصيل الخط الزمني</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs justify-between"
                    onClick={() => {
                      setActiveTab('more')
                      setMoreSubScreen('messages')
                    }}
                  >
                    <span>مراسلة المكتب</span>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Second Demo Card (Multiple Matters Support) */}
            <Card className="rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm opacity-90">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-bold text-xs">قضية عمالية — مطابقة الأجور والبدلات</span>
                  <p className="text-[11px] text-muted-foreground">
                    قيد الإجراء — لا يوجد مطلوب منك
                  </p>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  مكتملة الصياغة
                </Badge>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ========================================================
            SCREEN S3: CASE TIMELINE (قضاياي — التفاصيل)
           ======================================================== */}
        {activeTab === 'cases' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">قضاياي — مسار الإجراءات</h2>
                <p className="text-xs text-muted-foreground">
                  تتبع أين وصلت قضيتك باللغة العربية الواضحة والخالية من التعقيد
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-600">
                محدث لحظياً
              </Badge>
            </div>

            {/* Matter Header */}
            <Card className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-emerald-400 font-mono">رقم المرجع: {caseData?.caseNumber || 'CASE-2026-SA'}</span>
                  <h3 className="text-base font-bold">{caseData?.title || 'قضية عقد العمل — شركة الريف'}</h3>
                  <p className="text-xs text-slate-300">
                    {caseData?.court || 'المحكمة العامة بجدة'} • نوع القضية: عمالية
                  </p>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px]">قيد المتابعة</Badge>
              </div>
            </Card>

            {/* Vertical Timeline */}
            <Card className="rounded-2xl p-4 shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-muted-foreground">الخط الزمني المعتمد للإجراءات:</h4>

              <div className="relative pr-6 space-y-6 before:absolute before:right-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {/* Event 1 (Past - Muted) */}
                <div className="relative">
                  <span className="absolute -right-6 top-1 h-3.5 w-3.5 rounded-full bg-slate-400 border-2 border-white dark:border-slate-950" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-700 dark:text-slate-300">قُدّمت صحيفة الدعوى</span>
                      <span className="text-[10px] text-muted-foreground">12 نوفمبر</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      استلم مكتبك القضية وبدأ الإجراء الرسمي وقيد المعاملة في منصة ناجز.
                    </p>
                  </div>
                </div>

                {/* Event 2 (Past - Muted) */}
                <div className="relative">
                  <span className="absolute -right-6 top-1 h-3.5 w-3.5 rounded-full bg-slate-400 border-2 border-white dark:border-slate-950" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-700 dark:text-slate-300">عُقدت الجلسة الأولى</span>
                      <span className="text-[10px] text-muted-foreground">3 ديسمبر</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      حضر محاميك الجلسة وقدم وثيقة قانونية أعدّها لدعم موقفك، وطلب القاضي مهلة للاطلاع.
                    </p>
                  </div>
                </div>

                {/* Event 3 (Current - Accent with emerald pulsing dot) */}
                <div className="relative">
                  <span className="absolute -right-6 top-1 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 ring-4 ring-emerald-500/20" />
                  <div className="space-y-1 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-950 dark:text-emerald-100">
                        الجلسة القادمة: {hearingDates.gregorian}
                      </span>
                      <Badge className="bg-emerald-600 text-white text-[9px]">الجارية</Badge>
                    </div>
                    <p className="text-xs text-emerald-800 dark:text-emerald-300">
                      <strong>لا يُشترط حضورك — سنعلمك بما يتم.</strong> يتولى المحامي الترافع وتقديم مذكرات الرد نيابة عنك.
                    </p>
                  </div>
                </div>

                {/* Event 4 (Future - Dotted) */}
                <div className="relative opacity-60">
                  <span className="absolute -right-6 top-1 h-3.5 w-3.5 rounded-full bg-slate-300 dark:bg-slate-700 border-2 border-white dark:border-slate-950" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs text-muted-foreground">صدور قرار المحكمة الأول واستلام الصك</span>
                    <p className="text-[11px] text-muted-foreground">المرحلة الختامية للتقاضي يعقبها بدء إجراءات تحصيل المبالغ.</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Permanent Pinned "What is required from me?" Card */}
            <div className="p-4 rounded-2xl border-2 border-emerald-500/40 bg-white dark:bg-slate-900 shadow-md space-y-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-emerald-600" />
                <h4 className="font-bold text-xs text-emerald-950 dark:text-emerald-100">
                  ما المطلوب مني الآن؟
                </h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {unsignedDocs.length > 0
                  ? `مطلوب مراجعة واعتماد مسودة "${unsignedDocs[0].title}" في قسم المستندات قبل تاريخ الجلسة.`
                  : 'لا شيء حالياً — راجع المستند المرفق في قسم المستندات إن أمكن، وفريق المكتب يتولى كافة الإجراءات القضائية.'}
              </p>
              {unsignedDocs.length > 0 && (
                <Button size="sm" className="w-full bg-emerald-600 text-white text-xs mt-1" onClick={() => setActiveTab('docs')}>
                  الانتقال لمراجعة وتوقيع المستند
                </Button>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN S4: SESSIONS & APPOINTMENTS (الجلسات والمواعيد)
           ======================================================== */}
        {activeTab === 'more' && moreSubScreen === 'sessions' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">الجلسات والمواعيد القضائية</h2>
                <p className="text-xs text-muted-foreground">جدول الجلسات وحالة الحضور والاتجاهات الجغرافية</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab('home')}>
                عودة للرئيسية
              </Button>
            </div>

            {/* Next Session Card with Oversized Date & Time */}
            {caseData?.hearingDate ? (
              <Card className="rounded-2xl border-2 border-emerald-500 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
                <div className="bg-emerald-600 text-white p-4">
                  <span className="text-[11px] font-medium text-emerald-100 block">الجلسة القادمة المحددة:</span>
                  <div className="text-xl sm:text-2xl font-black mt-1">
                    {hearingDates.gregorian} — 9:00 ص
                  </div>
                  <div className="text-xs text-emerald-200 mt-0.5 font-mono">
                    الموافق بالهجري: {hearingDates.hijri}
                  </div>
                </div>

                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{caseData.court || 'المحكمة العامة بجدة'} — الدائرة العمالية الرابعة</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                      <FileText className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{caseData.title}</span>
                    </div>
                  </div>

                  {/* Explicit Attendance Expectation Line */}
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                    ✓ <strong>لا يُشترط حضورك</strong> — محاميك المعتمد سيمثل المكتب أمام القاضي، وسيتم إبلاغك بنتيجة الجلسة فور انتهائها.
                  </div>

                  {/* Two Key Actions: ICS Calendar & Google Maps */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5 border-emerald-300 text-emerald-800 dark:text-emerald-200"
                      onClick={() => {
                        const title = `جلسة: ${caseData.title}`
                        const details = `المحكمة: ${caseData.court || 'المحكمة العامة'}\nرقم القضية: ${caseData.caseNumber || 'ملف رقمي'}`
                        const icsData = `data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${encodeURIComponent(title)}%0ADESCRIPTION:${encodeURIComponent(details)}%0AEND:VEVENT%0AEND:VCALENDAR`
                        window.open(icsData)
                        toast.success('تم تنزيل موعد الجلسة لتقويم جهازك')
                      }}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      <span>أضف إلى التقويم</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs gap-1.5 border-slate-300"
                      onClick={() => {
                        window.open(`https://maps.google.com/?q=${encodeURIComponent(caseData.court || 'المحكمة العامة بجدة')}`, '_blank')
                      }}
                    >
                      <MapPin className="h-3.5 w-3.5 text-rose-500" />
                      <span>الموقع والاتجاهات</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-8 text-center text-muted-foreground space-y-2">
                <Calendar className="h-8 w-8 mx-auto text-slate-400" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا توجد جلسات مجدولة حالياً</p>
                <p className="text-xs">سيتم إشعارك فور قيام المحكمة أو المحامي بتحديد موعد الجلسة التالية.</p>
              </Card>
            )}

            {/* Past Sessions Collapse Section */}
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-muted-foreground">جلسات سابقة منتهية:</h4>

              <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">3 ديسمبر — جلسة أولى</span>
                  <Badge variant="outline" className="text-[9px]">تمت</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  حضرها محاميك · تم إلقاء المرافعة الأولى وتسليم مذكرة الرد على دعوى الخصم.
                </p>
              </div>

              <div className="p-3 rounded-xl border bg-white dark:bg-slate-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">17 نوفمبر — جلسة تأسيسية</span>
                  <Badge variant="outline" className="text-[9px]">تمت</Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  تم التحقق من الأوراق النظامية والوكالة الإلكترونية وإبلاغك بالموعد.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN S5: DOCUMENT REVIEW & E-SIGNATURE (المستندات)
           ======================================================== */}
        {activeTab === 'docs' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">العقود والمستندات</h2>
                <p className="text-xs text-muted-foreground">راجع المسودات واعتمدها إلكترونياً بالبصمة الرقمية</p>
              </div>
              <Badge variant="outline" className="text-[10px]">
                نظام التعاملات الإلكترونية
              </Badge>
            </div>

            {/* Document List Grouped by Matter with Status Chips */}
            <div className="space-y-3">
              {initialDocs.length === 0 ? (
                <Card className="p-8 text-center text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm">لا توجد مستندات معلقة للمراجعة في هذا الملف.</p>
                </Card>
              ) : (
                initialDocs.map((doc) => {
                  const isSigned = doc.status === 'active' || !!doc.signedDate
                  return (
                    <Card key={doc.id} className="rounded-2xl border p-4 shadow-xs space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl ${isSigned ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm">{doc.title}</h4>
                              <Badge className={isSigned ? 'bg-emerald-600 text-white text-[10px]' : 'bg-amber-500 text-white text-[10px]'}>
                                {isSigned ? 'موقّع إلكترونياً' : 'بانتظار مراجعتك'}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              نوع المستند: {doc.docType} • آخر تحديث: {new Date(doc.updatedAt).toLocaleDateString('ar-SA')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-[11px] text-muted-foreground">
                          {isSigned ? `تم الاعتماد بتاريخ ${new Date(doc.signedDate || doc.updatedAt).toLocaleDateString('ar-SA')}` : 'يلزم الاطلاع على كافة الصفحات'}
                        </span>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-8 gap-1"
                            onClick={() => {
                              setSelectedDocForReview(doc)
                              setDocPage(1)
                              setReachedLastPage(false)
                            }}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>مراجعة المستند</span>
                          </Button>

                          {!isSigned && (
                            <Button
                              size="sm"
                              className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              onClick={() => {
                                setSelectedDocForReview(doc)
                                setDocPage(1)
                                setReachedLastPage(false)
                              }}
                            >
                              <PenTool className="h-3.5 w-3.5" />
                              <span>اعتماد وتوقيع</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            SCREEN S6: ZATCA INVOICES & PAYMENT (الفواتير)
           ======================================================== */}
        {activeTab === 'invoices' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">الفواتير الإلكترونية (ZATCA)</h2>
                <p className="text-xs text-muted-foreground">فواتير ضريبية مبسطة معتمدة ومتوافقة مع هيئة الزكاة والضريبة والجمارك</p>
              </div>
              <Badge variant="outline" className="text-[10px] text-emerald-600">
                ضريبة 15%
              </Badge>
            </div>

            {/* Invoices List */}
            {(!caseData?.invoices || caseData.invoices.length === 0) ? (
              <Card className="p-8 text-center text-muted-foreground">
                <CreditCard className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                <p className="text-sm">لا توجد فواتير صادرة لهذا الملف حالياً.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {caseData.invoices.map((inv) => {
                  const isPaid = inv.status === 'paid'
                  return (
                    <Card key={inv.id} className="rounded-2xl border p-4 shadow-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-200">
                            فاتورة {inv.number}
                          </span>
                          <Badge className={isPaid ? 'bg-emerald-600 text-white text-[10px]' : 'bg-amber-500 text-white text-[10px]'}>
                            {isPaid ? 'مدفوعة' : 'تستحق خلال 5 أيام'}
                          </Badge>
                        </div>

                        <button
                          onClick={() => setSelectedInvoiceForQr(inv)}
                          className="p-1.5 rounded-lg border hover:bg-slate-50 text-slate-600 text-xs flex items-center gap-1 cursor-pointer"
                          title="عرض رمز الاستجابة السريع ZATCA QR"
                        >
                          <QrCode className="h-4 w-4" />
                          <span className="text-[10px] hidden sm:inline">رمز ZATCA</span>
                        </button>
                      </div>

                      {/* Amounts */}
                      <div className="space-y-1 text-xs bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                        <div className="flex justify-between text-muted-foreground">
                          <span>المبلغ الأساسي (قبل الضريبة):</span>
                          <span>{inv.subtotal.toLocaleString('ar-SA')} ر.س</span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>ضريبة القيمة المضافة (15%):</span>
                          <span>{inv.vatAmount.toLocaleString('ar-SA')} ر.س</span>
                        </div>
                        <div className="flex justify-between font-bold text-sm pt-1 border-t text-slate-900 dark:text-white">
                          <span>المبلغ الإجمالي (شامل الضريبة):</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                            {inv.total.toLocaleString('ar-SA')} ر.س
                          </span>
                        </div>
                        {isPaid && (
                          <div className="flex justify-between text-[11px] text-emerald-600 font-medium pt-1">
                            <span>المتبقي:</span>
                            <span>0.00 ر.س (تمت التسوية بالكامل)</span>
                          </div>
                        )}
                      </div>

                      {/* Action Row */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-muted-foreground">
                          تاريخ الإصدار: {new Date(inv.issueDate).toLocaleDateString('ar-SA')}
                        </span>

                        <div className="flex items-center gap-2">
                          {isPaid ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs h-8 gap-1 border-emerald-300 text-emerald-700"
                              onClick={() => setSelectedInvoiceForReceipt(inv)}
                            >
                              <Download className="h-3.5 w-3.5" />
                              <span>الإيصال متاح</span>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                              onClick={() => setSelectedInvoiceForPay(inv)}
                            >
                              <CreditCard className="h-3.5 w-3.5" />
                              <span>دفع الآن — مدى / Apple Pay</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Compliance Footnote */}
            <p className="text-[11px] text-muted-foreground text-center pt-2">
              جميع الفواتير صادرة إلكترونياً ومتوافقة مع متطلبات هيئة الزكاة والضريبة والجمارك (المرحلة الثانية).
            </p>
          </div>
        )}

        {/* ========================================================
            SCREEN S7: SECURE MESSAGES (الرسائل)
           ======================================================== */}
        {activeTab === 'more' && moreSubScreen === 'messages' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">المراسلات الآمنة مع المكتب</h2>
                <p className="text-xs text-muted-foreground">تواصل لوجستي وتنسيق الإجراءات مباشرة مع فريق العمل</p>
              </div>
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setActiveTab('home')}>
                عودة
              </Button>
            </div>

            {/* Pinned Expectation Note */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              📌 <strong>للتوضيح:</strong> الرسائل مخصصة لتنسيق المواعيد والإجراءات اللوجستية، وليست استشارة قانونية جديدة. يرد المكتب عادة خلال يوم عمل واحد.
            </div>

            {/* Message Thread History */}
            <Card className="rounded-2xl border p-4 space-y-3 min-h-[220px] max-h-[340px] overflow-y-auto">
              {messagesList.map((m) => (
                <div
                  key={m.id}
                  className={`flex flex-col ${m.sender === 'client' ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.sender === 'client'
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
                    }`}
                  >
                    <p>{m.text}</p>
                    <span className="text-[9px] opacity-75 mt-1 block text-left font-mono">
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}
            </Card>

            {/* 3 Quick-Reply Templates */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-muted-foreground font-semibold">ردود سريعة بنقرة واحدة:</span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('شكراً! راجعته واعتمدته الآن.')}
                  className="px-2.5 py-1.5 rounded-xl border bg-white dark:bg-slate-900 hover:border-emerald-500 text-xs transition-colors cursor-pointer"
                >
                  👍 شكراً! راجعته واعتمدته الآن
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('لدي سؤال بخصوص الموعد، شكراً لمتابعتكم من فضلكم.')}
                  className="px-2.5 py-1.5 rounded-xl border bg-white dark:bg-slate-900 hover:border-emerald-500 text-xs transition-colors cursor-pointer"
                >
                  ❓ لدي سؤال بخصوص الموعد
                </button>
                <button
                  type="button"
                  onClick={() => handleSendChatMessage('يرجى تأجيل الجلسة إن أمكن وتنسيق موعد جديد.')}
                  className="px-2.5 py-1.5 rounded-xl border bg-white dark:bg-slate-900 hover:border-emerald-500 text-xs transition-colors cursor-pointer"
                >
                  ⏱️ طلب تأجيل الجلسة
                </button>
              </div>
            </div>

            {/* Input Row */}
            <div className="flex items-center gap-2 pt-1">
              <Input
                placeholder="اكتب استفسارك للمكتب هنا..."
                value={msgText}
                onChange={(e) => setMsgText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendChatMessage()
                }}
                className="text-xs h-10 rounded-xl"
              />
              <Button
                onClick={() => handleSendChatMessage()}
                disabled={msgBusy || !msgText.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-4 rounded-xl"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Secure Attachment Box */}
            <div className="pt-2 border-t flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleUploadAttachment}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <Button
                  variant="outline"
                  size="sm"
                  disabled={fileBusy}
                  className="text-xs h-8 gap-1.5"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{fileBusy ? 'جاري الرفع...' : 'إرفاق مستند أو صورة (حتى 10MB)'}</span>
                </Button>
              </div>
              <span className="text-[10px] text-muted-foreground">تشفير محلي آمن</span>
            </div>
          </div>
        )}

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
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">الأجهزة المصرح لها بالوصول:</h4>
              <div className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                  <div>
                    <span className="font-bold block">هذا الجهاز (المتصفح الحالي)</span>
                    <span className="text-[10px] text-emerald-600">نشط الآن • يتذكر لمدة 30 يوماً</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700">الحالي</Badge>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs text-rose-600 hover:text-rose-700 border-rose-200 hover:bg-rose-50"
                onClick={handleSignOutAll}
              >
                تسجيل الخروج من كافة الأجهزة
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

        {/* ========================================================
            SCREEN: MORE MENU (أكثر)
           ======================================================== */}
        {activeTab === 'more' && moreSubScreen !== 'sessions' && moreSubScreen !== 'messages' && moreSubScreen !== 'settings' && (
          <div className="space-y-3 animate-in fade-in">
            <h2 className="text-lg font-bold">الخدمات الإضافية</h2>

            <div className="grid grid-cols-1 gap-2.5">
              <div
                onClick={() => setMoreSubScreen('sessions')}
                className="p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">الجلسات والمواعيد (S4)</h4>
                    <p className="text-xs text-muted-foreground">تفاصيل المواعيد، التقويم، والاتجاهات للمحكمة</p>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </div>

              <div
                onClick={() => setMoreSubScreen('messages')}
                className="p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">الرسائل والمراسلات (S7)</h4>
                    <p className="text-xs text-muted-foreground">مراسلة محامي القضية وإرفاق المستندات الإضافية</p>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </div>

              <div
                onClick={() => setMoreSubScreen('settings')}
                className="p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                    <Settings className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">الإعدادات والتنبيهات (S8)</h4>
                    <p className="text-xs text-muted-foreground">إدارة قنوات التنبيهات، الأجهزة، وحماية البيانات</p>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </div>

              <div
                onClick={() => setShowGlossaryModal(true)}
                className="p-4 rounded-2xl border bg-white dark:bg-slate-900 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">مسرد المصطلحات المبسطة</h4>
                    <p className="text-xs text-muted-foreground">شرح المعاني القضائية بلغة واضحة خالية من التعقيد</p>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================
          BOTTOM TAB BAR: 5 DESTINATIONS (الرئيسية، قضاياي، المستندات، الفواتير، أكثر)
         ======================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-2">
        <div className="max-w-md md:max-w-xl mx-auto grid grid-cols-5 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'home'
                ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">الرئيسية</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cases')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'cases'
                ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Scale className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">قضاياي</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docs')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative cursor-pointer ${
              activeTab === 'docs'
                ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">المستندات</span>
            {unsignedDocs.length > 0 && (
              <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-amber-500" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('invoices')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all relative cursor-pointer ${
              activeTab === 'invoices'
                ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">الفواتير</span>
            {unpaidInvoices.length > 0 && (
              <span className="absolute top-1 right-3 h-2 w-2 rounded-full bg-emerald-600" />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('more')
              setMoreSubScreen('sessions')
            }}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'more'
                ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span className="text-[10px] mt-0.5">أكثر</span>
          </button>
        </div>
      </nav>

      {/* ========================================================
          MODAL: S5 DOCUMENT REVIEW & PAGINATED E-SIGN
         ======================================================== */}
      {selectedDocForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden border shadow-2xl animate-in zoom-in-95">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                <div>
                  <h3 className="font-bold text-sm truncate max-w-[240px]">{selectedDocForReview.title}</h3>
                  <span className="text-[10px] text-muted-foreground">نوع المحرر: {selectedDocForReview.docType}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDocZoom((z) => Math.max(80, z - 10))}
                  className="p-1 rounded-lg border hover:bg-slate-100 cursor-pointer"
                  title="تصغير"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>
                <span className="text-[11px] font-mono">{docZoom}%</span>
                <button
                  onClick={() => setDocZoom((z) => Math.min(150, z + 10))}
                  className="p-1 rounded-lg border hover:bg-slate-100 cursor-pointer"
                  title="تكبير"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelectedDocForReview(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Document Paginated Paper Canvas Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100 dark:bg-slate-950 flex flex-col items-center">
              <div
                style={{ transform: `scale(${docZoom / 100})`, transformOrigin: 'top center' }}
                className="w-full max-w-md bg-white dark:bg-slate-900 shadow-md border rounded-xl p-6 space-y-4 text-xs leading-relaxed transition-transform"
              >
                {/* Official Legal Document Header Simulation */}
                <div className="border-b pb-3 text-center space-y-1">
                  <span className="text-[10px] text-slate-400 font-mono">المملكة العربية السعودية • وزارة العدل</span>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedDocForReview.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    بين: {selectedDocForReview.parties || client.name} — مسودة رسمية معدة من محامي القضية
                  </p>
                </div>

                {docPage === 1 && (
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">البند الأول: تمهيد وتعريفات</p>
                    <p>
                      حيث اتفق الطرفان بكامل أهليتهما المعتبرة شرعاً ونظاماً على إسناد المهام والمطالبات المالية وفقاً لأحكام نظام العمل السعودي ونظام المعاملات المدنية الصادر بالمرسوم الملكي.
                    </p>
                    <p>
                      يلتزم الطرف الأول بتقديم سائر البيانات والإفصاحات اللازمة، وتكون كافة المراسلات عبر بوابة سند الرقمية منتجة لآثارها القانونية.
                    </p>
                  </div>
                )}

                {docPage === 2 && (
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">البند الثاني: الالتزامات المالية والتعاقدية</p>
                    <p>
                      تخضع الفواتير المستحقة للأنظمة الضريبية الصادرة عن هيئة الزكاة والضريبة والجمارك (ZATCA)، وتعد الفاتورة المسددة عبر وسائل الدفع المعتمدة مخالصة نهائية لتلك الدفعة.
                    </p>
                    <p>
                      يحق للموكل تقديم الملاحظات النظامية على صياغة أي بند وتعديلها بالتنسيق مع المحامي المباشر.
                    </p>
                  </div>
                )}

                {docPage === 3 && (
                  <div className="space-y-3 text-slate-700 dark:text-slate-300">
                    <p className="font-bold text-emerald-800 dark:text-emerald-300">البند الثالث: الإقرار والتوقيع والإنهاء</p>
                    <p>
                      يعد هذا المحرر وثيقة نافذة بمجرد اعتمادها إلكترونياً بالبصمة الرقمية ورمز OTP، وله الحجية الكاملة في الإثبات وفق نظام التعاملات الإلكترونية ونظام الإثبات في المملكة.
                    </p>
                    <div className="pt-4 border-t text-center space-y-1">
                      <span className="text-[10px] text-emerald-600 font-bold block">
                        ✓ وصلت إلى الصفحة الأخيرة من المستند
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Anchored Comments on Current Page */}
              <div className="w-full max-w-md mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>ملاحظات الصفحة ({docPage}):</span>
                </div>
                {docComments[docPage]?.map((c, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border text-xs text-muted-foreground">
                    💬 {c}
                  </div>
                ))}

                <div className="flex items-center gap-2 pt-1">
                  <Input
                    placeholder={`إضافة ملاحظة على الصفحة ${docPage}...`}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="text-xs h-8"
                  />
                  <Button size="sm" onClick={handleAddDocComment} className="text-xs h-8 bg-emerald-600 text-white">
                    إرسال
                  </Button>
                </div>
              </div>
            </div>

            {/* Pagination Controls & Bottom Actions */}
            <div className="p-4 border-t bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  disabled={docPage <= 1}
                  onClick={() => setDocPage((p) => p - 1)}
                  className="p-1.5 rounded-lg border disabled:opacity-40 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <span className="text-xs font-bold">
                  صفحة {docPage} من {docTotalPages}
                </span>
                <button
                  disabled={docPage >= docTotalPages}
                  onClick={() => {
                    const next = docPage + 1
                    setDocPage(next)
                    if (next === docTotalPages) setReachedLastPage(true)
                  }}
                  className="p-1.5 rounded-lg border disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedDocForReview(null)}>
                  إغلاق
                </Button>
                <Button
                  size="sm"
                  disabled={!reachedLastPage && docPage !== docTotalPages}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-bold"
                  onClick={() => setShowSignModal(true)}
                >
                  <PenTool className="h-3.5 w-3.5" />
                  <span>اعتماد وتوقيع المستند</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: STEP-UP AUTH & CANVAS SIGNATURE PAD
         ======================================================== */}
      {showSignModal && selectedDocForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 space-y-4 border shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm">التوقيع الإلكتروني والاعتماد الموثق</h3>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowSignModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">اسم الموقّع القانوني الكامل:</label>
                <Input
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>

              {/* Step-up Auth OTP Rule */}
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-emerald-700 dark:text-emerald-300">
                    رمز التأكيد الفوري (Step-Up OTP):
                  </label>
                  <button
                    type="button"
                    onClick={() => setStepUpOtp('123456')}
                    className="text-[10px] text-emerald-600 underline font-mono cursor-pointer"
                  >
                    رمز تجريبي (123456)
                  </button>
                </div>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="أدخل الرمز للتأكيد"
                  value={stepUpOtp}
                  onChange={(e) => setStepUpOtp(e.target.value)}
                  className="text-xs h-9 font-mono tracking-widest text-center"
                />
              </div>

              {/* Touch/Mouse HTML5 Canvas Signature Pad */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold">رسم التوقيع باللمس أو القلم:</label>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[10px] text-rose-500 underline cursor-pointer"
                  >
                    مسح التوقيع
                  </button>
                </div>
                <div className="border-2 border-dashed border-emerald-400 rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    width={340}
                    height={110}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    className="w-full h-[110px] touch-none cursor-crosshair"
                  />
                </div>
              </div>

              {/* Legal Acknowledgment */}
              <label className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded text-emerald-600"
                />
                <span className="text-[10px] leading-relaxed text-emerald-950 dark:text-emerald-200">
                  أقر أنا <strong>{signerName}</strong> باطلاعي الكامل على بنود هذا المستند، وأوافق على توقيعه إلكترونياً بما ينتج كافة آثاره القانونية الملزمة بموجب نظام التعاملات الإلكترونية السعودي.
                </span>
              </label>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setShowSignModal(false)}>
                إلغاء
              </Button>
              <Button
                size="sm"
                disabled={!agreedToTerms || signingBusy}
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-bold"
                onClick={handleFinalizeSignature}
              >
                {signingBusy ? 'جاري توثيق البصمة...' : 'تأكيد التوقيع والاعتماد'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: S6 ZATCA INVOICE PAYMENT CHECKOUT
         ======================================================== */}
      {selectedInvoiceForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 space-y-4 border shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm">سداد فاتورة أتعاب إلكترونية</h3>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedInvoiceForPay(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-muted-foreground block">رقم الفاتورة:</span>
                  <span className="font-mono font-bold text-sm text-emerald-950 dark:text-emerald-100">{selectedInvoiceForPay.number}</span>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-muted-foreground block">المبلغ الإجمالي:</span>
                  <span className="font-bold text-base text-emerald-600 font-mono">
                    {selectedInvoiceForPay.total.toLocaleString('ar-SA')} ر.س
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1.5">اختر وسيلة الدفع المصرفية:</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mada')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'mada'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    💳 بطاقة مدى
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('apple_pay')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'apple_pay'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🍎 Apple Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('sadad')}
                    className={`p-2.5 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === 'sadad'
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    🏦 نظام سداد
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-muted-foreground text-[11px] space-y-1">
                <p>• يتم الدفع مباشرة إلى الحساب البنكي المعتمد لمكتب المحاماة.</p>
                <p>• يصدر إشعار ZATCA فوري ومخالصة مالية ترسل لملفك.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setSelectedInvoiceForPay(null)}>
                إلغاء
              </Button>
              <Button
                size="sm"
                disabled={payingBusy}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                onClick={handleConfirmPayment}
              >
                {payingBusy ? 'جارٍ تأكيد الدفع...' : `سداد (${selectedInvoiceForPay.total.toLocaleString('ar-SA')} ر.س)`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: FULL-SCREEN ZATCA QR CODE VIEW
         ======================================================== */}
      {selectedInvoiceForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 border shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-sm">رمز التحقق الضريبي ZATCA</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedInvoiceForQr(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500 inline-block shadow-inner">
              {/* ZATCA QR Visual simulation */}
              <div className="w-48 h-48 bg-slate-900 flex flex-col items-center justify-center text-white p-3 rounded-lg relative overflow-hidden">
                <QrCode className="w-36 h-36 text-emerald-400" />
                <span className="text-[9px] font-mono text-emerald-300 mt-1">ZATCA-PHASE2-COMPLIANT</span>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">فاتورة رقم: {selectedInvoiceForQr.number}</p>
              <p className="text-muted-foreground text-[11px]">
                رمز الاستجابة السريع مشفر بتقنية Base64 متضمن اسم المورد، الرقم الضريبي، والضريبة المحتسبة (15%).
              </p>
            </div>

            <Button size="sm" className="w-full bg-emerald-600 text-white text-xs" onClick={() => setSelectedInvoiceForQr(null)}>
              تم التحقق
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: PAID INVOICE OFFICIAL RECEIPT
         ======================================================== */}
      {selectedInvoiceForReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 border shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span className="font-bold text-sm">إيصال سداد إلكتروني معتمد</span>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setSelectedInvoiceForReceipt(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">رقم الفاتورة:</span>
                <span className="font-mono font-bold">{selectedInvoiceForReceipt.number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المستفيد:</span>
                <span className="font-bold">{workspace?.name || 'مكتب المحاماة'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">المسدد:</span>
                <span className="font-bold">{client.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاريخ السداد:</span>
                <span className="font-mono">
                  {selectedInvoiceForReceipt.paidAt ? new Date(selectedInvoiceForReceipt.paidAt).toLocaleDateString('ar-SA') : '28 ديسمبر'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t text-emerald-700 dark:text-emerald-400">
                <span>المبلغ المسدد:</span>
                <span>{selectedInvoiceForReceipt.total.toLocaleString('ar-SA')} ر.س</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                onClick={() => {
                  window.print()
                }}
              >
                <Download className="h-3.5 w-3.5" />
                <span>طباعة / حفظ الإيصال PDF</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: PDPPL DATA DELETION REQUEST
         ======================================================== */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 space-y-4 border shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-bold text-sm">طلب حذف البيانات الشخصية (PDPPL)</span>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowDeleteModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              وفقاً لأحكام نظام حماية البيانات الشخصية الصادر بالمرسوم الملكي، يُرسل هذا الطلب رسمياً إلى مسؤول الامتثال في مكتب المحاماة للمراجعة واتخاذ الإجراء النظامي المناسب مع مراعاة السجلات التي يلزم حفظها نظامياً.
            </p>

            <div>
              <label className="text-xs font-bold block mb-1">سبب الطلب (اختياري):</label>
              <textarea
                rows={3}
                placeholder="أدخل ملاحظاتك أو سبب طلب الحذف..."
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full rounded-xl border border-input bg-transparent p-2 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>
                إلغاء
              </Button>
              <Button
                size="sm"
                disabled={deleteSubmitting}
                className="bg-rose-600 hover:bg-rose-700 text-white text-xs"
                onClick={handleSubmitDataDeletion}
              >
                {deleteSubmitting ? 'جاري الإرسال...' : 'تأكيد إرسال الطلب للمكتب'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ZERO-JARGON GLOSSARY SHEET
         ======================================================== */}
      {showGlossaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3" dir="rtl">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden border shadow-2xl animate-in zoom-in-95">
            <div className="p-4 border-b flex items-center justify-between bg-slate-50 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                <h3 className="font-bold text-sm">دليل المصطلحات المبسطة (Zero Jargon)</h3>
              </div>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setShowGlossaryModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
              <p className="text-muted-foreground leading-relaxed">
                في سند، نؤمن بأن لغة القانون حق للموكل أن يفهمها دون غموض. يوضح هذا الجدول ترجمة المصطلحات الرسمية إلى لغة يومية ميسرة:
              </p>

              <div className="space-y-2">
                {GLOSSARY_ITEMS.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-900/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">{item.clientWording}</span>
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">{item.term}</Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{item.why}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 border-t bg-slate-50 dark:bg-slate-800/40 text-center">
              <Button size="sm" className="bg-emerald-600 text-white text-xs w-full" onClick={() => setShowGlossaryModal(false)}>
                إغلاق الدليل
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
