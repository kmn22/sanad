'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ShieldCheck,
  Share2,
  Copy,
  ExternalLink,
  Trash2,
  Clock,
  Upload,
  MessageSquare,
  Sparkles,
  Phone,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'

interface Props {
  caseId: string
  clientId: string | null
  clientName: string
  clientPhone?: string | null
  caseTitle: string
}

interface PortalLinkData {
  id: string
  clientId: string
  caseId: string | null
  expiresAt: string
  allowUpload: boolean
  revokedAt: string | null
  lastAccessedAt: string | null
  _count?: {
    files: number
    requests: number
  }
}

export default function CasePortalTab({
  caseId,
  clientId,
  clientName,
  clientPhone,
  caseTitle,
}: Props) {
  const { lang } = useLang()
  const [loading, setLoading] = useState(true)
  const [activeLink, setActiveLink] = useState<PortalLinkData | null>(null)
  const [activeUrl, setActiveUrl] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [days, setDays] = useState(30)
  const [allowUpload, setAllowUpload] = useState(true)

  async function loadPortalLinks() {
    setLoading(true)
    try {
      const res = await fetch('/api/portal-links')
      if (res.ok) {
        const links: PortalLinkData[] = await res.json()
        const found = links.find(
          (l) => l.caseId === caseId && !l.revokedAt && new Date(l.expiresAt) > new Date()
        )
        if (found) {
          setActiveLink(found)
        } else {
          setActiveLink(null)
          setActiveUrl('')
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPortalLinks()
  }, [caseId])

  async function handleCreateLink() {
    if (!clientId) {
      toast.error('يجب ربط القضية بعميل أولاً لإنشاء رابط البوابة')
      return
    }
    setGenerating(true)
    try {
      const res = await fetch('/api/portal-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          caseId,
          days,
          allowUpload,
          label: `بوابة: ${caseTitle}`,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'تعذر إنشاء الرابط')
      setActiveUrl(data.url)
      setActiveLink({
        id: data.portal.id,
        clientId: data.portal.clientId,
        caseId: data.portal.caseId,
        expiresAt: data.portal.expiresAt,
        allowUpload: data.portal.allowUpload,
        revokedAt: null,
        lastAccessedAt: null,
      })
      toast.success('تم توليد رابط بوابة العميل الآمن بنجاح!')
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ أثناء إنشاء الرابط')
    } finally {
      setGenerating(false)
    }
  }

  async function handleRevokeLink() {
    if (!activeLink) return
    if (!confirm('هل أنت متأكد من إلغاء صلاحية هذا الرابط فوراً؟ لن يتمكن العميل من الدخول بعد ذلك.')) return
    setRevoking(true)
    try {
      const res = await fetch(`/api/portal-links/${activeLink.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('تعذر إلغاء الرابط')
      toast.success('تم إلغاء صلاحية الرابط فوراً')
      setActiveLink(null)
      setActiveUrl('')
    } catch (err: any) {
      toast.error(err.message || 'فشل إلغاء الرابط')
    } finally {
      setRevoking(false)
    }
  }

  function handleCopy() {
    if (!activeUrl) return
    navigator.clipboard.writeText(activeUrl)
    toast.success('تم نسخ رابط البوابة للحافظة')
  }

  function handleShareWhatsApp() {
    if (!activeUrl) return
    const cleanPhone = clientPhone ? clientPhone.replace(/\D/g, '') : ''
    const msg = `السلام عليكم ورحمة الله وبركاته،\nالأستاذ/ة ${clientName}،\n\nتجدون عبر هذا الرابط الآمن بوابة متابعة ملفكم وقضيتكم (${caseTitle}) لدى مكتبنا لمتابعة الحالة وإرسال الطلبات والملفات:\n${activeUrl}\n\nيرجى عدم مشاركة الرابط مع أي شخص آخر.`
    const waUrl = cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(waUrl, '_blank')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-sm text-muted-foreground gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
        <p>جاري التحقق من روابط البوابة...</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 text-right" dir="rtl">
      {/* Intro Header */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800 p-4 flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-emerald-600 text-white shrink-0">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-emerald-950 dark:text-emerald-100">بوابة الموكل السيادية (Client Portal)</h4>
            <Badge className="bg-emerald-600 text-[10px] px-1.5 py-0">ميزة حصرية</Badge>
          </div>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
            وفّر قناة محدودة الصلاحية للموكل لمتابعة حالة القضية، إرسال الطلبات، ورفع الملفات المطلوبة بأمان. يمكن إلغاء الرابط فوراً في أي وقت.
          </p>
        </div>
      </div>

      {activeLink ? (
        <Card className="border-emerald-300 dark:border-emerald-800">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <CardTitle className="text-sm font-bold">رابط البوابة مفعل حالياً للعميل</CardTitle>
              </div>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 text-xs">
                صالح حتى {new Date(activeLink.expiresAt).toLocaleDateString('ar-SA')}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              الموكل: <strong>{clientName}</strong> {clientPhone && `(${clientPhone})`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeUrl ? (
              <div className="space-y-2">
                <label className="text-xs font-semibold block">رابط الوصول المباشر:</label>
                <div className="flex items-center gap-2">
                  <Input value={activeUrl} readOnly className="font-mono text-xs bg-slate-50 dark:bg-slate-900" />
                  <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1 text-xs shrink-0">
                    <Copy className="h-3.5 w-3.5" />
                    <span>نسخ</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(activeUrl, '_blank')}
                    className="gap-1 text-xs shrink-0"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>فتح</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg text-xs space-y-1">
                <p className="text-muted-foreground">تم إنشاء الرابط وتوزيعه مسبقاً لهذا الملف.</p>
                <p className="text-muted-foreground">
                  آخر دخول للعميل: {activeLink.lastAccessedAt ? new Date(activeLink.lastAccessedAt).toLocaleString('ar-SA') : 'لم يسجل دخول بعد'}
                </p>
              </div>
            )}

            {/* Quick Share Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
              {activeUrl && (
                <Button
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5"
                  onClick={handleShareWhatsApp}
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>مشاركة عبر WhatsApp بنقرة واحدة</span>
                </Button>
              )}

              <Button
                size="sm"
                variant="destructive"
                disabled={revoking}
                onClick={handleRevokeLink}
                className="text-xs gap-1 mr-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{revoking ? 'جاري الإلغاء...' : 'إلغاء صلاحية الرابط'}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold">إنشاء رابط بوابة آمن للعميل</CardTitle>
            <CardDescription className="text-xs">
              سيتم إنشاء رابط مشفر خاص بهذا الملف القضائي يمكن للعميل فتحه عبر جواله فوراً
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">مدة الصلاحية:</label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs"
                >
                  <option value={15}>١٥ يوماً</option>
                  <option value={30}>٣٠ يوماً (الافتراضي)</option>
                  <option value={60}>٦٠ يوماً</option>
                  <option value={90}>٩٠ يوماً</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">صلاحية رفع الملفات:</label>
                <select
                  value={allowUpload ? 'yes' : 'no'}
                  onChange={(e) => setAllowUpload(e.target.value === 'yes')}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-xs"
                >
                  <option value="yes">السماح للموكل برفع المستندات</option>
                  <option value="no">للاطلاع والموافقة فقط (بدون رفع)</option>
                </select>
              </div>
            </div>

            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-2"
              disabled={generating || !clientId}
              onClick={handleCreateLink}
            >
              <Sparkles className="h-4 w-4" />
              <span>{generating ? 'جاري إنشاء وتشفير الرابط...' : 'توليد رابط البوابة للموكل الآن'}</span>
            </Button>

            {!clientId && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>يرجى تعيين عميل لهذه القضية لتتمكن من إنشاء رابط البوابة.</span>
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
