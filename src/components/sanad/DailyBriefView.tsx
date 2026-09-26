'use client'

import React, { useState, useEffect } from 'react'
import {
  BookOpen,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Scale,
  Sparkles,
  Building2,
  Receipt,
  Briefcase,
  Copy,
  Check,
  Calendar,
  AlertCircle,
  Search,
  Bookmark,
  Bell,
  Mail,
  Send,
  Share2,
  FileText,
  Clock,
  CheckCircle2,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'

export interface DailyBriefItem {
  id: string
  title: string
  summary: string
  source: string
  category: string
  url?: string | null
  publishedAt: string
  createdAt: string
  readTimeMin?: number
  gazetteIssue?: string
  practicalImpact?: string
}

const CATEGORY_MAP: Record<string, { labelAr: string; labelEn: string; color: string }> = {
  regulation: { labelAr: 'أنظمة ولوائح', labelEn: 'Regulations', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' },
  labor: { labelAr: 'العمل والتوطين', labelEn: 'Labor & HR', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30' },
  tax: { labelAr: 'الزكاة والضريبة', labelEn: 'ZATCA & Tax', color: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30' },
  commercial: { labelAr: 'المعاملات التجارية', labelEn: 'Commercial', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30' },
  corporate: { labelAr: 'الشركات والاستثمار', labelEn: 'Corporate', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30' },
  ip: { labelAr: 'الملكية الفكرية', labelEn: 'IP & Patents', color: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30' },
}

interface NewsletterIssue {
  id: string
  issueNumber: number
  title: string
  dateHijri: string
  dateGregorian: string
  summary: string
  leadTopic: string
  highlights: string[]
  readTime: string
}

const NEWSLETTER_ISSUES: NewsletterIssue[] = [
  {
    id: 'issue-12',
    issueNumber: 12,
    title: 'العدد الثاني عشر: الدليل الشامل لتعديلات نظام المحاكم التجارية ولائحة الوساطة الإلزامية',
    dateHijri: '24 ربيع الأول 1448هـ',
    dateGregorian: '25 سبتمبر 2026م',
    summary: 'قراءة تحليلية في القرارات الوزارية المحدثة لاختصاصات الدوائر التجارية، معايير جلسات التهيئة والتحضير خلال 20 يوماً، والشروط الشكلية لقبول الدعوى عبر منصة تراضي.',
    leadTopic: 'إلزامية اللجوء إلى المصالحة قبل قيد الدعاوى دون مليون ريال وعواقب إغفال الإخطار الكتابي.',
    highlights: [
      'وجوب إخطار المدعى عليه كتابةً قبل 15 يوماً من قيد الدعوى التجارية.',
      'تفعيل مسار تسوية المنازعات عبر منصة تراضي كشرط شكلي لسماع الدعوى.',
      'صلاحيات القاضي المشرف في شطب الدعوى لعدم الجدية أو تخلف الأطراف.',
    ],
    readTime: '3 دقائق',
  },
  {
    id: 'issue-11',
    issueNumber: 11,
    title: 'العدد الحادي عشر: الجاهزية الفنية والضريبية للمرحلة الثانية من الفوترة الإلكترونية (ZATCA)',
    dateHijri: '17 ربيع الأول 1448هـ',
    dateGregorian: '18 سبتمبر 2026م',
    summary: 'استعراض متطلبات الربط والتكامل المباشر مع منصة فاتورة وتشفير الأختام الرقمية وفق معايير هيئة الزكاة والضريبة والجمارك وتجنب الغرامات.',
    leadTopic: 'الالتزام بإصدار فواتير ضريبية بصيغة XML المعتمدة وتوليد رمز الاستجابة السريع TLV المشفر.',
    highlights: [
      'شمول المجموعة الحادية عشرة من المنشآت التي تتجاوز إيراداتها 15 مليون ريال.',
      'غرامات مخالفة إصدار الفواتير الإلكترونية تبدأ من 1,000 ريال وتتصاعد إلى 50,000 ريال.',
      'حظر إصدار فواتير يدوية للمنشآت المشمولة بالربط المباشر.',
    ],
    readTime: '4 دقائق',
  },
  {
    id: 'issue-10',
    issueNumber: 10,
    title: 'العدد العاشر: الحماية النظامية للأسرار التجارية وضوابط شروط عدم المنافسة في عقود العمل',
    dateHijri: '10 ربيع الأول 1448هـ',
    dateGregorian: '11 سبتمبر 2026م',
    summary: 'تحليل مشروع نظام حماية الأسرار التجارية الجديد عبر منصة استطلاع ومواءمته مع المادة (83) من نظام العمل واللائحة التنفيذية.',
    leadTopic: 'تشديد عقوبات إفشاء الأسرار التقنية والصناعية لتصل للسجن 5 سنوات وغرامات تصل لـ 5 ملايين ريال.',
    highlights: [
      'بطلان شرط عدم المنافسة إذا تجاوز سنتين أو كان غير محدد النطاق الجغرافي والنوعي.',
      'إلزامية قيد العقود الوظيفية عبر منصة قوى كمرجع إثبات وحيد أمام اللجان العمالية.',
      'أفضل ممارسات صياغة اتفاقيات عدم الإفصاح (NDA) للمنشآت والمحامين.',
    ],
    readTime: '3 دقائق',
  },
]

export function DailyBriefView({ onNavigateToResearch }: { onNavigateToResearch?: () => void }) {
  const { lang } = useLang()
  const [briefs, setBriefs] = useState<DailyBriefItem[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [savedToResearch, setSavedToResearch] = useState<Record<string, boolean>>({})

  // View Mode: 'feed' (Live Feed) | 'issues' (Newsletter Issues)
  const [viewMode, setViewMode] = useState<'feed' | 'issues'>('feed')

  // Newsletter Subscription Preferences Dialog
  const [isSubscribeOpen, setIsSubscribeOpen] = useState(false)
  const [subEmail, setSubEmail] = useState('')
  const [subFreq, setSubFreq] = useState('weekly')
  const [subCategories, setSubCategories] = useState<Record<string, boolean>>({
    commercial: true,
    labor: true,
    tax: true,
    regulation: true,
    corporate: true,
  })

  // Advisory Memo Dialog
  const [activeAdvisoryItem, setActiveAdvisoryItem] = useState<DailyBriefItem | null>(null)

  const fetchBriefs = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/sync/regulations')
      if (res.ok) {
        const data = await res.json()
        setBriefs(data.briefs || [])
      }
    } catch {
      toast.error(lang === 'ar' ? 'تعذر جلب موجز الأنظمة' : 'Failed to load regulations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBriefs()
    const saved = localStorage.getItem('sanad_newsletter_prefs')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.email) setSubEmail(parsed.email)
        if (parsed.freq) setSubFreq(parsed.freq)
        if (parsed.categories) setSubCategories(parsed.categories)
      } catch {}
    }
  }, [])

  const handleSync = async () => {
    setSyncing(true)
    const toastId = toast.loading(lang === 'ar' ? 'جاري الاتصال بالمصادر الرسمية وتلخيص المستجدات...' : 'Syncing regulations...')
    try {
      const res = await fetch('/api/sync/regulations', { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.success) {
        setBriefs(data.briefs || [])
        toast.success(data.message || (lang === 'ar' ? 'تمت مزامنة الأنظمة بنجاح' : 'Sync completed'), { id: toastId })
      } else {
        throw new Error(data.error || 'Sync failed')
      }
    } catch (err: any) {
      toast.error(err.message || (lang === 'ar' ? 'فشل التحديث' : 'Sync failed'), { id: toastId })
    } finally {
      setSyncing(false)
    }
  }

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success(lang === 'ar' ? 'تم نسخ ملخص القرار إلى الحافظة' : 'Copied to clipboard')
  }

  const handleSaveToResearch = async (item: DailyBriefItem) => {
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          content: `${item.summary}\n\n[الأثر التطبيقي]: ${item.practicalImpact || 'مراعاة التحديث عند صياغة العقود ومراجعة اللوائح.'}`,
          type: 'regulation',
          category: item.category,
          source: `${item.source} (${new Date(item.publishedAt).toLocaleDateString('ar-SA')})`,
          tags: `${item.category}, قرار وزاري, نشرة الأنظمة`,
          url: item.url || undefined,
        }),
      })

      if (res.ok) {
        setSavedToResearch((prev) => ({ ...prev, [item.id]: true }))
        toast.success(lang === 'ar' ? 'تم حفظ القرار في مركز الأبحاث القانونية' : 'Saved to Legal Research Hub', {
          action: onNavigateToResearch
            ? {
                label: lang === 'ar' ? 'عرض الأبحاث' : 'View Hub',
                onClick: () => onNavigateToResearch(),
              }
            : undefined,
        })
      } else {
        throw new Error('Failed to save')
      }
    } catch {
      toast.error(lang === 'ar' ? 'تعذر الحفظ في مركز الأبحاث' : 'Failed to save to research')
    }
  }

  const handleSaveSubscription = () => {
    if (!subEmail.trim() || !subEmail.includes('@')) {
      toast.error(lang === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter valid email')
      return
    }
    const payload = { email: subEmail, freq: subFreq, categories: subCategories }
    localStorage.setItem('sanad_newsletter_prefs', JSON.stringify(payload))
    setIsSubscribeOpen(false)
    toast.success(lang === 'ar' ? 'تم حفظ تفضيلات النشرة القانونية بنجاح' : 'Newsletter preferences saved')
  }

  const generateAdvisoryMemo = (item: DailyBriefItem) => {
    return `مذكرة إحاطة قانونية للعملاء والإدارة
الموضوع: ${item.title}
التاريخ: ${new Date(item.publishedAt).toLocaleDateString('ar-SA')}
الجهة المصدرة: ${item.source}

سعادة العميل / الإدارة المحترمين،
نود إحاطتكم بصدور التحديث التنظيمي المشار إليه أعلاه، وإليكم ملخصاً تنفيذياً وتحليلاً للأثر الإجرائي:

1. موجز القرار والتعديل:
${item.summary}

2. الأثر النظامي والتطبيقي على المنشأة:
${item.practicalImpact || 'يوصى بمواءمة العقود الحالية ونماذج العمليات مع هذا التحديث لتفادي الغرامات أو البطلان الشكلي.'}

3. التوصيات والخطوات الإجرائية المقترحة:
- مراجعة العقود واللوائح الداخلية ذات العلاقة.
- التحقق من تطبيق المدد والمواعيد المستحدثة في أي إجراءات أو اعتراضات حالية.

سند للاستشارات القانونية
`
  }

  const handleCopyAdvisoryMemo = (item: DailyBriefItem) => {
    navigator.clipboard.writeText(generateAdvisoryMemo(item))
    toast.success(lang === 'ar' ? 'تم نسخ مذكرة الإحاطة بصيغة العميل الرسمية' : 'Advisory memo copied')
  }

  const filteredBriefs = briefs.filter((b) => {
    const matchesCat = selectedCategory === 'all' || b.category === selectedCategory
    const matchesSearch =
      !searchQuery.trim() ||
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.source.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-7 border border-border/80 shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'النشرة وموجز الأنظمة السعودية' : 'Saudi Legal Newsletter & Brief'}
              </span>
              <Badge variant="outline" className="text-[11px] font-mono border-white/10">
                {briefs.length} {lang === 'ar' ? 'تحديث موثق' : 'updates'}
              </Badge>
              <Badge variant="secondary" className="text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border-none">
                {lang === 'ar' ? 'أم القرى والجريدة الرسمية' : 'Official Gazette'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {lang === 'ar' ? 'نشرة التشريعات والقرارات الدورية' : 'Legal Newsletter & Regulatory Monitor'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              {lang === 'ar'
                ? 'استخلاص فوري للمراسيم الملكية وقرارات مجلس الوزراء ولوائح وزارة العدل وهيئة الزكاة مع إمكانية الحفظ بمركز الأبحاث وتوليد مذكرات إحاطة للعملاء.'
                : 'Automated ingestion of Saudi gazette decrees, ministerial circulars, and ZATCA updates with one-click research archiving.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {/* Manage Subscription Dialog */}
            <Dialog open={isSubscribeOpen} onOpenChange={setIsSubscribeOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-border text-xs gap-1.5 cursor-pointer">
                  <Bell className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'ar' ? 'إدارة الاشتراك والتنبيهات' : 'Alerts & Sub'}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    <span>{lang === 'ar' ? 'إدارة تفضيلات النشرة القانونية' : 'Newsletter Preferences'}</span>
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-2 text-xs">
                  <div className="space-y-1">
                    <Label className="text-xs">{lang === 'ar' ? 'البريد الإلكتروني للإشعارات' : 'Email Address'}</Label>
                    <Input
                      value={subEmail}
                      onChange={(e) => setSubEmail(e.target.value)}
                      placeholder="lawyer@firm.sa"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">{lang === 'ar' ? 'دورية استلام النشرة' : 'Frequency'}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'instant', label: lang === 'ar' ? 'فوري' : 'Instant' },
                        { id: 'weekly', label: lang === 'ar' ? 'أسبوعي' : 'Weekly' },
                        { id: 'monthly', label: lang === 'ar' ? 'شهري' : 'Monthly' },
                      ].map((freq) => (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() => setSubFreq(freq.id)}
                          className={`p-2 rounded-lg border text-center font-semibold cursor-pointer transition-all ${
                            subFreq === freq.id
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                              : 'border-border hover:bg-muted text-muted-foreground'
                          }`}
                        >
                          {freq.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">{lang === 'ar' ? 'القطاعات والأنظمة المهتم بها:' : 'Topics of Interest:'}</Label>
                    <div className="space-y-1.5">
                      {Object.entries(CATEGORY_MAP).map(([key, item]) => (
                        <div key={key} className="flex items-center gap-2">
                          <Checkbox
                            id={`sub-${key}`}
                            checked={subCategories[key] ?? true}
                            onCheckedChange={(checked) =>
                              setSubCategories((prev) => ({ ...prev, [key]: Boolean(checked) }))
                            }
                          />
                          <label htmlFor={`sub-${key}`} className="cursor-pointer text-xs">
                            {lang === 'ar' ? item.labelAr : item.labelEn}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter className="pt-2">
                  <Button variant="outline" size="sm" onClick={() => setIsSubscribeOpen(false)}>
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button size="sm" onClick={handleSaveSubscription} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                    {lang === 'ar' ? 'حفظ التفضيلات' : 'Save Preferences'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleSync}
              disabled={syncing}
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-1.5 shadow-md cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{lang === 'ar' ? 'مزامنة وتلخيص' : 'Sync & Update'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Mode Selector: Live Feed vs Periodic Issues */}
      <div className="flex items-center justify-between gap-4 border-b border-border/80 pb-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={viewMode === 'feed' ? 'default' : 'ghost'}
            onClick={() => setViewMode('feed')}
            className={`text-xs gap-1.5 rounded-xl ${viewMode === 'feed' ? 'bg-primary text-primary-foreground font-semibold' : ''}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'البث الحي والمستجدات' : 'Live Regulations Feed'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-primary-foreground/20 font-mono">
              {briefs.length}
            </span>
          </Button>

          <Button
            size="sm"
            variant={viewMode === 'issues' ? 'default' : 'ghost'}
            onClick={() => setViewMode('issues')}
            className={`text-xs gap-1.5 rounded-xl ${viewMode === 'issues' ? 'bg-primary text-primary-foreground font-semibold' : ''}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'أعداد النشرة التحليلية' : 'Curated Issues'}</span>
            <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-600 font-mono">
              {NEWSLETTER_ISSUES.length} {lang === 'ar' ? 'أعداد' : 'issues'}
            </Badge>
          </Button>
        </div>

        {onNavigateToResearch && (
          <Button
            size="sm"
            variant="outline"
            onClick={onNavigateToResearch}
            className="text-xs text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-50 dark:hover:bg-blue-950/30 gap-1.5 hidden sm:flex"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'مركز الأبحاث المحفوظة' : 'View Research Hub'}</span>
          </Button>
        )}
      </div>

      {/* 3. MODE A: CURATED NEWSLETTER ISSUES */}
      {viewMode === 'issues' && (
        <div className="space-y-4">
          {NEWSLETTER_ISSUES.map((issue) => (
            <div
              key={issue.id}
              className="rounded-2xl border border-border/80 bg-card/70 hover:border-emerald-500/40 p-6 transition-all duration-200 shadow-2xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs px-2.5 py-0.5 font-bold">
                    العدد #{issue.issueNumber}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {issue.dateHijri} ({issue.dateGregorian})
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5" />
                    {issue.readTime}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-foreground hover:text-emerald-500 transition-colors">
                  {issue.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-1">
                  {issue.summary}
                </p>
              </div>

              {/* Lead Highlight */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 text-xs space-y-2">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>المحور التشريعي الأبرز: {issue.leadTopic}</span>
                </p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside ps-1">
                  {issue.highlights.map((h, i) => (
                    <li key={i} className="leading-relaxed">{h}</li>
                  ))}
                </ul>
              </div>

              {/* Footer Actions */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground text-[11px]">
                  نشرة رسمية موجهة لممارسي القانون والإدارات القانونية بالسعودية
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(`${issue.title}\n\n${issue.summary}\n\n${issue.highlights.join('\n')}`)
                      toast.success(lang === 'ar' ? 'تم نسخ ملخص العدد للحافظة' : 'Copied issue summary')
                    }}
                    className="h-7 text-xs gap-1"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{lang === 'ar' ? 'مشاركة العدد' : 'Share'}</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4. MODE B: LIVE REGULATIONS FEED */}
      {viewMode === 'feed' && (
        <div className="space-y-4">
          {/* Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {lang === 'ar' ? 'كافة التحديثات' : 'All'}
              </button>
              {Object.entries(CATEGORY_MAP).map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    selectedCategory === key
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {lang === 'ar' ? item.labelAr : item.labelEn}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث في القرارات والأنظمة...' : 'Search regulations...'}
                className="pr-9 h-9 text-xs bg-background/60"
              />
            </div>
          </div>

          {/* Regulations List */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted/60 rounded-2xl border border-border" />
              ))}
            </div>
          ) : filteredBriefs.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border/80 bg-muted/10 p-6">
              <Scale className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-semibold">{lang === 'ar' ? 'لا توجد قرارات مطابقة' : 'No matching regulations found'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === 'ar' ? 'جرّب البحث بكلمة أخرى أو اضغط على مزامنة الأنظمة الآن' : 'Try searching another term or click Sync'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBriefs.map((item) => {
                const catInfo = CATEGORY_MAP[item.category] || {
                  labelAr: item.category,
                  labelEn: item.category,
                  color: 'bg-muted text-muted-foreground',
                }
                const isSaved = savedToResearch[item.id]

                return (
                  <div
                    key={item.id}
                    className="group rounded-2xl border border-border/80 bg-card/60 hover:bg-card hover:border-emerald-500/40 p-5 sm:p-6 transition-all duration-200 shadow-2xs space-y-3"
                  >
                    {/* Card Top Metadata */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={`text-xs border px-2.5 py-0.5 font-medium ${catInfo.color}`}>
                          {lang === 'ar' ? catInfo.labelAr : catInfo.labelEn}
                        </Badge>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          {item.source}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(item.publishedAt).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>

                        {/* Save to Research Hub Button */}
                        <button
                          onClick={() => handleSaveToResearch(item)}
                          disabled={isSaved}
                          className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                            isSaved
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-300'
                              : 'hover:bg-blue-50 dark:hover:bg-blue-950/40 text-muted-foreground hover:text-blue-600'
                          }`}
                          title={lang === 'ar' ? 'حفظ للأبحاث اللاحقة' : 'Save to Research Hub'}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-blue-500' : ''}`} />
                          <span className="hidden sm:inline">
                            {isSaved ? (lang === 'ar' ? 'محفوظ بالأبحاث' : 'Saved') : (lang === 'ar' ? 'حفظ للأبحاث' : 'Research Later')}
                          </span>
                        </button>

                        {/* Copy summary */}
                        <button
                          onClick={() => handleCopy(item.id, `${item.title}\n\n${item.summary}`)}
                          className="hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted/80 cursor-pointer"
                          title={lang === 'ar' ? 'نسخ الملخص' : 'Copy summary'}
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        {/* Generate Client Advisory Memo */}
                        <button
                          onClick={() => handleCopyAdvisoryMemo(item)}
                          className="hover:text-emerald-600 transition-colors p-1 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/30 flex items-center gap-1 cursor-pointer"
                          title={lang === 'ar' ? 'نسخ كمذكرة إحاطة للعميل' : 'Copy as Client Advisory Memo'}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:text-emerald-500 transition-colors p-1 rounded-md hover:bg-muted/80 flex items-center gap-1"
                            title={lang === 'ar' ? 'المصدر الرسمي' : 'Source'}
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-emerald-500 transition-colors">
                      {item.title}
                    </h3>

                    {/* AI Executive Summary */}
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.summary}
                    </p>

                    {/* Practical Compliance Action Badge */}
                    <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong className="font-semibold block mb-0.5 text-foreground">
                          {lang === 'ar' ? 'الأثر التطبيقي للمحامي والمنشأة:' : 'Practical Impact & Action:'}
                        </strong>
                        {lang === 'ar'
                          ? item.practicalImpact || 'يوصى بمواءمة العقود الحالية ونماذج العمليات مع هذا التحديث لتفادي الغرامات أو البطلان الشكلي.'
                          : 'Recommended to review active client contracts to ensure compliance.'}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
