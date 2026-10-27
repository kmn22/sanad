'use client'

import { ExternalLink, ShieldCheck, Scale, Building2, Copy, Check, Calendar, Search, Bookmark, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CATEGORY_MAP } from './data'
import type { DailyBriefState } from './use-daily-brief'

export function LiveFeedSection({ v }: { v: DailyBriefState }) {
  const { lang, loading, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, copiedId, savedToResearch, viewMode, handleCopy, handleSaveToResearch, handleCopyAdvisoryMemo, filteredBriefs } = v
  return (
    <>
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
                    <div className="bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-3 text-xs text-emerald-900 dark:text-emerald-200 flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
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
    </>
  )
}
