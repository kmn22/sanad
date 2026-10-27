'use client'

import React from 'react'
import {
  Bookmark,
  Search,
  Filter,
  Pin,
  Copy,
  Check,
  Trash2,
  Scale,
  Tag,
  FolderPlus,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TYPE_CONFIG, CATEGORY_LABELS } from './types'
import type { ResearchHubState } from './use-research-hub'

export function SavedResearchTab({ state }: { state: ResearchHubState }) {
  const {
    lang,
    loading,
    selectedType,
    setSelectedType,
    searchQuery,
    setSearchQuery,
    filteredItems,
    copiedId,
    handleTogglePin,
    handleCopyCitation,
    handleDelete,
    handleAddToDossier,
  } = state

  return (
    <div className="space-y-4">
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
                  <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
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
    </div>
  )
}
