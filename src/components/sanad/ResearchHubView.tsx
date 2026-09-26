'use client'

import React, { useState, useEffect, useMemo } from 'react'
import {
  BookOpen,
  Search,
  Plus,
  Bookmark,
  Pin,
  Scale,
  FileText,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  Building2,
  Calendar,
  Filter,
  Download,
  Share2,
  Tag,
  FolderPlus,
  Gavel,
  Shield,
  HelpCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'

export interface ResearchItem {
  id: string
  title: string
  content: string
  type: string // statute | precedent | regulation | note | doctrine
  category: string // civil | commercial | labor | tax | corporate | procedural | general
  source?: string | null
  tags?: string | null
  notes?: string | null
  caseId?: string | null
  url?: string | null
  isPinned: boolean
  createdAt: string
  updatedAt: string
}

const TYPE_CONFIG: Record<string, { labelAr: string; labelEn: string; color: string; icon: any }> = {
  statute: { labelAr: 'نص نظامي', labelEn: 'Statute Article', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30', icon: BookOpen },
  precedent: { labelAr: 'سابقة قضائية', labelEn: 'Precedent', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30', icon: Gavel },
  regulation: { labelAr: 'قرار ولائحة', labelEn: 'Regulation', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30', icon: Scale },
  doctrine: { labelAr: 'مبدأ فقهي/قانوني', labelEn: 'Doctrine', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30', icon: Shield },
  note: { labelAr: 'مذكرة بحثية', labelEn: 'Research Note', color: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30', icon: FileText },
}

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
  civil: { ar: 'معاملات مدنية', en: 'Civil' },
  commercial: { ar: 'تجاري وشركات', en: 'Commercial' },
  labor: { ar: 'عمل وتأمينات', en: 'Labor' },
  procedural: { ar: 'مرافعات وإثبات', en: 'Procedural' },
  corporate: { ar: 'حوكمة واستثمار', en: 'Corporate' },
  tax: { ar: 'زكاة وضريبة', en: 'Tax & ZATCA' },
  general: { ar: 'عام', en: 'General' },
}

export function ResearchHubView({ onNavigateToDrafting }: { onNavigateToDrafting?: (text: string) => void }) {
  const { lang } = useLang()
  const [items, setItems] = useState<ResearchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'saved' | 'statutes' | 'dossier'>('saved')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Dialog State
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newType, setNewType] = useState('statute')
  const [newCategory, setNewCategory] = useState('civil')
  const [newSource, setNewSource] = useState('')
  const [newTags, setNewTags] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [saving, setSaving] = useState(false)

  // Dossier Builder State
  const [dossierTitle, setDossierTitle] = useState('')
  const [dossierQuestion, setDossierQuestion] = useState('')
  const [dossierFacts, setDossierFacts] = useState('')
  const [dossierAnalysis, setDossierAnalysis] = useState('')
  const [dossierConclusion, setDossierConclusion] = useState('')
  const [dossierCitations, setDossierCitations] = useState<string[]>([])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/research')
      if (res.ok) {
        const data = await res.json()
        setItems(data.items || [])
      }
    } catch {
      toast.error(lang === 'ar' ? 'تعذر جلب بيانات مركز الأبحاث' : 'Failed to load research items')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleTogglePin = async (item: ResearchItem) => {
    try {
      const nextPin = !item.isPinned
      setItems((prev) =>
        prev
          .map((i) => (i.id === item.id ? { ...i, isPinned: nextPin } : i))
          .sort((a, b) => Number(b.isPinned) - Number(a.isPinned))
      )
      await fetch(`/api/research/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPinned: nextPin }),
      })
      toast.success(
        nextPin
          ? lang === 'ar' ? 'تم تثبيت المستند في أعلى الأبحاث' : 'Item pinned'
          : lang === 'ar' ? 'تم إلغاء التثبيت' : 'Item unpinned'
      )
    } catch {
      toast.error(lang === 'ar' ? 'تعذر تعديل التثبيت' : 'Failed to update')
      fetchItems()
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setItems((prev) => prev.filter((i) => i.id !== id))
      await fetch(`/api/research/${id}`, { method: 'DELETE' })
      toast.success(lang === 'ar' ? 'تم حذف المستند من الأبحاث' : 'Item deleted')
    } catch {
      toast.error(lang === 'ar' ? 'تعذر الحذف' : 'Failed to delete')
      fetchItems()
    }
  }

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error(lang === 'ar' ? 'يرجى كتابة العنوان والمحتوى' : 'Title and content required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          type: newType,
          category: newCategory,
          source: newSource.trim() || undefined,
          tags: newTags.trim() || undefined,
          notes: newNotes.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success(lang === 'ar' ? 'تمت إضافة المستند بنجاح لمركز الأبحاث' : 'Added to research hub')
        setItems((prev) => [data.item, ...prev])
        setIsAddOpen(false)
        setNewTitle('')
        setNewContent('')
        setNewSource('')
        setNewTags('')
        setNewNotes('')
      } else {
        throw new Error(data.error || 'Failed to save')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving')
    } finally {
      setSaving(false)
    }
  }

  const handleCopyCitation = (item: ResearchItem) => {
    const citation = `«${item.content}»\n[السند: ${item.source || item.title}]`
    navigator.clipboard.writeText(citation)
    setCopiedId(item.id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success(lang === 'ar' ? 'تم نسخ الاستشهاد القضائي الرسمي للحافظة' : 'Citation copied to clipboard')
  }

  const handleAddToDossier = (item: ResearchItem) => {
    const citation = `${item.title} (${item.source || ''})`
    if (!dossierCitations.includes(citation)) {
      setDossierCitations((prev) => [...prev, citation])
      toast.success(lang === 'ar' ? 'تم إدراج المستند في مذكرة الرأي القانوني' : 'Added to legal opinion dossier')
      setActiveTab('dossier')
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType = selectedType === 'all' || item.type === selectedType
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        (item.source && item.source.toLowerCase().includes(q)) ||
        (item.tags && item.tags.toLowerCase().includes(q)) ||
        (item.notes && item.notes.toLowerCase().includes(q))

      return matchesType && matchesCategory && matchesSearch
    })
  }, [items, selectedType, selectedCategory, searchQuery])

  // Dossier Compilation
  const compileDossierText = () => {
    return `مذكرة رأي قانوني وبحث نظامي
العنوان: ${dossierTitle || 'استشارة نظامية'}
التاريخ: ${new Date().toLocaleDateString('ar-SA')}

أولاً: المسألة النظامية محل البحث:
${dossierQuestion || '—'}

ثانياً: الوقائع والسياق:
${dossierFacts || '—'}

ثالثاً: الأسانيد والنصوص النظامية والسوابق القضائية المؤيدة:
${dossierCitations.map((c, i) => `${i + 1}. ${c}`).join('\n') || '—'}

رابعاً: التحليل والرأي القانوني:
${dossierAnalysis || '—'}

خامساً: النتيجة والتوصيات الإجرائية:
${dossierConclusion || '—'}
`
  }

  const handleCopyDossier = () => {
    navigator.clipboard.writeText(compileDossierText())
    toast.success(lang === 'ar' ? 'تم نسخ المذكرة البحثية كاملة بالصيغة القضائية' : 'Research dossier copied')
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Header Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-7 border border-border/80 shadow-xs">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5" />
                {lang === 'ar' ? 'مركز الأبحاث والمصادر القانونية' : 'Legal Research & Citations Hub'}
              </span>
              <Badge variant="outline" className="text-[11px] font-mono border-white/10">
                {items.length} {lang === 'ar' ? 'مرجع محفوظ' : 'citations'}
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {lang === 'ar' ? 'أبحاث الأنظمة والسوابق القضائية' : 'Saudi Statutes & Case Law Research'}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
              {lang === 'ar'
                ? 'مستودع متكامل لحفظ النصوص النظامية، قرارات المحكمة العليا، واستخلاص الأسانيد القانونية لصياغة المذكرات والاستشارات.'
                : 'Central repository to bookmark statutes, Supreme Court precedents, and draft judicial research memos.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-2 shadow-md cursor-pointer">
                  <Plus className="w-4 h-4" />
                  <span>{lang === 'ar' ? 'إضافة مرجع / استشهاد' : 'Add Research Item'}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>{lang === 'ar' ? 'إضافة مستند إلى مركز الأبحاث' : 'Add to Research Hub'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-3.5 pt-2">
                  <div className="space-y-1">
                    <Label className="text-xs">{lang === 'ar' ? 'عنوان المسألة أو المبدأ' : 'Title'}</Label>
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: سلطة القاضي في تخفيض الشرط الجزائي' : 'e.g., Penalty clause reduction'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">{lang === 'ar' ? 'نوع المصدر' : 'Type'}</Label>
                      <Select value={newType} onValueChange={setNewType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{lang === 'ar' ? v.labelAr : v.labelEn}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">{lang === 'ar' ? 'الفرع القانوني' : 'Category'}</Label>
                      <Select value={newCategory} onValueChange={setNewCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{lang === 'ar' ? v.ar : v.en}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{lang === 'ar' ? 'السند النظامي أو رقم الحكم' : 'Citation Source'}</Label>
                    <Input
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      placeholder={lang === 'ar' ? 'مثال: المادة (179) من نظام المعاملات المدنية' : 'Statutory citation or court docket'}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{lang === 'ar' ? 'نص المادة أو منطوق المبدأ' : 'Content & Statutory Text'}</Label>
                    <Textarea
                      rows={3}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder={lang === 'ar' ? 'الصيغة الكاملة للنص أو المبدأ القضائي...' : 'Full text...'}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{lang === 'ar' ? 'الوسوم (مفصولة بفواصل)' : 'Tags'}</Label>
                    <Input
                      value={newTags}
                      onChange={(e) => setNewTags(e.target.value)}
                      placeholder="شرط جزائي, تعويض, مقاولات"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">{lang === 'ar' ? 'ملاحظات وتوجيه للدعوى' : 'Case Notes'}</Label>
                    <Input
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      placeholder={lang === 'ar' ? 'ملاحظة خاصة للاستخدام في مذكرات الرد...' : 'Usage notes...'}
                    />
                  </div>
                </div>
                <DialogFooter className="pt-3">
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
                  <Button onClick={handleCreate} disabled={saving} className="bg-blue-600 hover:bg-blue-500 text-white">
                    {saving ? (lang === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (lang === 'ar' ? 'حفظ في الأبحاث' : 'Save')}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-4">
        <TabsList className="grid grid-cols-3 max-w-md w-full">
          <TabsTrigger value="saved" className="gap-2">
            <Bookmark className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'المحفوظات والأبحاث' : 'Saved Research'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 font-mono">
              {items.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="statutes" className="gap-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'الأنظمة والسوابق' : 'Saudi Codes'}</span>
          </TabsTrigger>
          <TabsTrigger value="dossier" className="gap-2">
            <FileText className="w-3.5 h-3.5" />
            <span>{lang === 'ar' ? 'مذكرة الرأي القانوني' : 'Legal Opinion'}</span>
            {dossierCitations.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-600 font-mono">
                {dossierCitations.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: SAVED RESEARCH ================= */}
        <TabsContent value="saved" className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Filter className="w-3 h-3" />
                {lang === 'ar' ? 'النوع:' : 'Type:'}
              </span>
              <button
                onClick={() => setSelectedType('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedType === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                }`}
              >
                {lang === 'ar' ? 'الكل' : 'All'}
              </button>
              {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setSelectedType(k)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedType === k
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {lang === 'ar' ? v.labelAr : v.labelEn}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute right-3 top-2.5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={lang === 'ar' ? 'بحث في النصوص والمبادئ...' : 'Search citations...'}
                className="pr-9 h-9 text-xs bg-background/60"
              />
            </div>
          </div>

          {/* Cards List */}
          {loading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-muted/60 rounded-2xl border border-border" />
              ))}
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 rounded-2xl border border-dashed border-border/80 bg-muted/10 p-6">
              <Bookmark className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm font-semibold">
                {lang === 'ar' ? 'لا توجد أبحاث محفوظة تطابق البحث' : 'No matching research items'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {lang === 'ar' ? 'يمكنك إضافة مراجع جديدة أو حفظ مقالات النشرة القانونية' : 'Add new citations or save items from the newsletter'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const typeInfo = TYPE_CONFIG[item.type] || TYPE_CONFIG.statute
                const Icon = typeInfo.icon
                const catName = CATEGORY_LABELS[item.category]?.[lang === 'ar' ? 'ar' : 'en'] || item.category

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-5 transition-all duration-200 shadow-2xs space-y-3 relative group ${
                      item.isPinned
                        ? 'border-blue-500/50 bg-blue-500/[0.03] dark:bg-blue-500/[0.05]'
                        : 'border-border/80 bg-card/60 hover:bg-card hover:border-blue-500/30'
                    }`}
                  >
                    {/* Top Header */}
                    <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={`text-xs px-2 py-0.5 font-medium ${typeInfo.color}`}>
                          <Icon className="w-3 h-3 me-1 inline" />
                          {lang === 'ar' ? typeInfo.labelAr : typeInfo.labelEn}
                        </Badge>
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          {catName}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(item)}
                          className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                            item.isPinned ? 'text-blue-500 hover:bg-blue-500/10' : 'text-muted-foreground hover:bg-muted'
                          }`}
                          title={item.isPinned ? 'إلغاء التثبيت' : 'تثبيت في الأعلى'}
                        >
                          <Pin className={`w-3.5 h-3.5 ${item.isPinned ? 'fill-blue-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => handleCopyCitation(item)}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors cursor-pointer"
                          title="نسخ الاستشهاد النظامي"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-foreground leading-snug">
                      {item.title}
                    </h3>

                    {/* Source Citation */}
                    {item.source && (
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                        <Scale className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.source}</span>
                      </p>
                    )}

                    {/* Content */}
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4">
                      {item.content}
                    </p>

                    {/* Tags */}
                    {item.tags && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {item.tags.split(',').map((tag, idx) => (
                          <span key={idx} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Tag className="w-2.5 h-2.5 opacity-60" />
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Notes & Actions Bar */}
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                      {item.notes ? (
                        <p className="text-[11px] text-muted-foreground truncate max-w-[200px]" title={item.notes}>
                          💡 {item.notes}
                        </p>
                      ) : <span />}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddToDossier(item)}
                        className="h-7 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 gap-1"
                      >
                        <FolderPlus className="w-3.5 h-3.5" />
                        <span>{lang === 'ar' ? 'إدراج بالرأي القانوني' : 'Add to Opinion'}</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ================= TAB 2: SAUDI STATUTES REPOSITORY ================= */}
        <TabsContent value="statutes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:border-blue-500/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-500" />
                  <span>نظام المعاملات المدنية</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">مرسوم ملكي رقم (م/191) - 721 مادة</p>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>ينظم العقود، الضمان، الشرط الجزائي، المسؤولية التقصيرية، والملكية الشائعة.</p>
                <div className="pt-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">نافذ ومعتمد</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      setSearchQuery('المعاملات المدنية')
                      setActiveTab('saved')
                    }}
                  >
                    <Search className="w-3 h-3" />
                    تصفح المواد المحفوظة
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-blue-500/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-500" />
                  <span>نظام الشركات الجديد</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">مرسوم ملكي رقم (م/132)</p>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>استحدث شركة المساهمة المبسطة، اتفاقيات الشركاء، وحوكمة الشركات العائلية.</p>
                <div className="pt-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">المنظومة التجارية</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      setSearchQuery('الشركات')
                      setActiveTab('saved')
                    }}
                  >
                    <Search className="w-3 h-3" />
                    تصفح المواد المحفوظة
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:border-blue-500/40 transition-colors">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-purple-500" />
                  <span>نظام الإثبات ونظام المرافعات</span>
                </CardTitle>
                <p className="text-xs text-muted-foreground">مرسوم ملكي رقم (م/43)</p>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <p>قواعد الإثبات بالقرائن، حجية الدليل الرقمي، واستجواب الخصوم واليمين الحاسمة.</p>
                <div className="pt-2 flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px]">القضاء الإجرائي</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      setSearchQuery('الإثبات')
                      setActiveTab('saved')
                    }}
                  >
                    <Search className="w-3 h-3" />
                    تصفح المواد المحفوظة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================= TAB 3: LEGAL OPINION / DOSSIER BUILDER ================= */}
        <TabsContent value="dossier" className="space-y-4">
          <Card className="border border-border/80 bg-card/60 shadow-xs">
            <CardHeader className="pb-3 border-b border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span>مذكرة الرأي والبحث القانوني</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    قم بصياغة مذكرة بحثية متكاملة لعميلك أو لفريق المحامين مستندة إلى النصوص والسوابق المختارة.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleCopyDossier} className="gap-1.5 text-xs">
                    <Copy className="w-3.5 h-3.5" />
                    نسخ المذكرة كاملة
                  </Button>
                  {onNavigateToDrafting && (
                    <Button
                      size="sm"
                      onClick={() => onNavigateToDrafting(compileDossierText())}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      فتح في محرر الصياغة الذكي
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">عنوان الاستشارة أو المذكرة</Label>
                  <Input
                    value={dossierTitle}
                    onChange={(e) => setDossierTitle(e.target.value)}
                    placeholder="مثال: مذكرة استشارية بشأن مدى أحقية إنهاء عقد المقاولة بالشرط الفاسخ الصريح"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">المسألة النظامية محل البحث</Label>
                  <Input
                    value={dossierQuestion}
                    onChange={(e) => setDossierQuestion(e.target.value)}
                    placeholder="هل يحق للطرف الأول المطالبة بكامل قيمة الشرط الجزائي دون إثبات ضرر مباشر؟"
                  />
                </div>
              </div>

              {/* Citations Box */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold flex items-center justify-between">
                  <span>الأسانيد والنصوص النظامية المختارة ({dossierCitations.length})</span>
                  {dossierCitations.length > 0 && (
                    <button
                      onClick={() => setDossierCitations([])}
                      className="text-[10px] text-muted-foreground hover:text-rose-500"
                    >
                      تفريغ القائمة
                    </button>
                  )}
                </Label>
                {dossierCitations.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed text-center text-xs text-muted-foreground bg-muted/20">
                    لم تقم بإدراج أسانيد بعد. انتقل إلى تبويب <strong>المحفوظات والأبحاث</strong> واضغط على &quot;إدراج بالرأي القانوني&quot;.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 p-3 rounded-xl border bg-muted/30">
                    {dossierCitations.map((c, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                      >
                        <Scale className="w-3 h-3" />
                        {c}
                        <button
                          onClick={() => setDossierCitations((prev) => prev.filter((_, i) => i !== idx))}
                          className="hover:text-rose-500 ms-1"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">ملخص الوقائع والسياق</Label>
                <Textarea
                  rows={2}
                  value={dossierFacts}
                  onChange={(e) => setDossierFacts(e.target.value)}
                  placeholder="بيان مختصر لعلاقة الأطراف ومحل النزاع أو الاستفسار..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">التحليل والتأصيل القانوني</Label>
                <Textarea
                  rows={4}
                  value={dossierAnalysis}
                  onChange={(e) => setDossierAnalysis(e.target.value)}
                  placeholder="تطبيق النصوص النظامية والسوابق القضائية على وقائع المسألة..."
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">النتيجة والرأي والتوصية الإجرائية</Label>
                <Textarea
                  rows={2}
                  value={dossierConclusion}
                  onChange={(e) => setDossierConclusion(e.target.value)}
                  placeholder="خلاصة الرأي القانوني المقترح والخطوات القضائية أو العقدية الواجب اتخاذها..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
