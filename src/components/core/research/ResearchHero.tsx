'use client'

import React from 'react'
import { Bookmark, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { TYPE_CONFIG, CATEGORY_LABELS } from './types'
import type { ResearchHubState } from './use-research-hub'

export function ResearchHero({ state }: { state: ResearchHubState }) {
  const {
    lang,
    items,
    isAddOpen,
    setIsAddOpen,
    newTitle,
    setNewTitle,
    newType,
    setNewType,
    newCategory,
    setNewCategory,
    newSource,
    setNewSource,
    newContent,
    setNewContent,
    newTags,
    setNewTags,
    newNotes,
    setNewNotes,
    saving,
    handleCreate,
  } = state

  return (
    <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-7 border border-border/80 shadow-xs">
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'مركز الأبحاث والمصادر النظامية' : 'Legal Research & Citations Hub'}
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
  )
}
