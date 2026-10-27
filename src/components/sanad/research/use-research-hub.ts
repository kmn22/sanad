'use client'

import { useState, useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import type { ResearchItem } from './types'

export function useResearchHub() {
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

  const compileDossierText = () => {
    return `مذكرة رأي واستشارة مهنية
العنوان: ${dossierTitle || 'استشارة نظامية'}
التاريخ: ${new Date().toLocaleDateString('ar-SA')}

أولاً: المسألة النظامية محل البحث:
${dossierQuestion || '—'}

ثانياً: الوقائع والسياق:
${dossierFacts || '—'}

ثالثاً: الأسانيد والنصوص النظامية والسوابق القضائية المؤيدة:
${dossierCitations.map((c, i) => `${i + 1}. ${c}`).join('\n') || '—'}

رابعاً: التحليل والرأي المهني:
${dossierAnalysis || '—'}

خامساً: النتيجة والتوصيات الإجرائية:
${dossierConclusion || '—'}
`
  }

  const handleCopyDossier = () => {
    navigator.clipboard.writeText(compileDossierText())
    toast.success(lang === 'ar' ? 'تم نسخ المذكرة البحثية كاملة بالصيغة النظامية' : 'Research dossier copied')
  }

  return {
    lang,
    items,
    loading,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedCategory,
    setSelectedCategory,
    copiedId,
    isAddOpen,
    setIsAddOpen,
    newTitle,
    setNewTitle,
    newContent,
    setNewContent,
    newType,
    setNewType,
    newCategory,
    setNewCategory,
    newSource,
    setNewSource,
    newTags,
    setNewTags,
    newNotes,
    setNewNotes,
    saving,
    dossierTitle,
    setDossierTitle,
    dossierQuestion,
    setDossierQuestion,
    dossierFacts,
    setDossierFacts,
    dossierAnalysis,
    setDossierAnalysis,
    dossierConclusion,
    setDossierConclusion,
    dossierCitations,
    setDossierCitations,
    handleTogglePin,
    handleDelete,
    handleCreate,
    handleCopyCitation,
    handleAddToDossier,
    filteredItems,
    compileDossierText,
    handleCopyDossier,
  }
}

export type ResearchHubState = ReturnType<typeof useResearchHub>
