'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { getMigratedItem, setMigratedItem } from '@/lib/storage-migration'

const MAQAR_NEWSLETTER_KEY = 'maqar_newsletter_prefs'
const LEGACY_NEWSLETTER_KEY = 'sanad_newsletter_prefs'
import { DailyBriefItem } from './data'

export function useDailyBrief({ onNavigateToResearch }: { onNavigateToResearch?: () => void }) {
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
    const saved = getMigratedItem(MAQAR_NEWSLETTER_KEY, LEGACY_NEWSLETTER_KEY)
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
    setMigratedItem(MAQAR_NEWSLETTER_KEY, LEGACY_NEWSLETTER_KEY, JSON.stringify(payload))
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

  return {
    onNavigateToResearch,
    lang,
    briefs,
    setBriefs,
    loading,
    setLoading,
    syncing,
    setSyncing,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    copiedId,
    setCopiedId,
    savedToResearch,
    setSavedToResearch,
    viewMode,
    setViewMode,
    isSubscribeOpen,
    setIsSubscribeOpen,
    subEmail,
    setSubEmail,
    subFreq,
    setSubFreq,
    subCategories,
    setSubCategories,
    fetchBriefs,
    handleSync,
    handleCopy,
    handleSaveToResearch,
    handleSaveSubscription,
    generateAdvisoryMemo,
    handleCopyAdvisoryMemo,
    filteredBriefs,
  }
}

export type DailyBriefState = ReturnType<typeof useDailyBrief>
