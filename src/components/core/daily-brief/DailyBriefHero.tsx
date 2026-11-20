'use client'

import { RefreshCw, Sparkles, Bell, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { CATEGORY_MAP } from './data'
import type { DailyBriefState } from './use-daily-brief'

export function DailyBriefHero({ v }: { v: DailyBriefState }) {
  const { lang, briefs, syncing, isSubscribeOpen, setIsSubscribeOpen, subEmail, setSubEmail, subFreq, setSubFreq, subCategories, setSubCategories, handleSync, handleSaveSubscription } = v
  return (
    <>
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
              <Badge variant="secondary" className="text-[11px] font-semibold bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-none">
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

    </>
  )
}
