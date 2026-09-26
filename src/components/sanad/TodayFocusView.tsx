'use client'

import React from 'react'
import {
  Timer,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  FileText,
  CalendarClock,
  Sparkles,
  ArrowRight,
  Plus,
  Camera,
  Scale,
  Zap,
  Clock,
  Check,
  BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLang } from '@/lib/sanad/i18n'
import {
  formatDuration,
  formatSAR,
  formatHijri,
  type DashboardData,
  type Task,
} from '@/lib/sanad/types'
import { toast } from 'sonner'

interface Props {
  data: DashboardData
  onNavigate: (view: string, refId?: string) => void
  onStartFocus: () => void
  onRefresh?: () => void
}

export function TodayFocusView({ data, onNavigate, onStartFocus, onRefresh }: Props) {
  const { lang, t } = useLang()
  const now = new Date()
  const hour = now.getHours()
  const greetingKey = hour < 12 ? 'greeting.morning' : hour < 17 ? 'greeting.afternoon' : 'greeting.evening'

  const overdueTasks = data?.tasks?.overdue || []
  const todayTasks = data?.tasks?.today || []
  const stats = data?.stats

  // Deduplicate critical tasks
  const seenIds = new Set<string>()
  const criticalTasks = [...overdueTasks, ...todayTasks]
    .filter((task) => {
      if (seenIds.has(task.id)) return false
      seenIds.add(task.id)
      return true
    })
    .slice(0, 6)

  const urgentCount = (stats?.overdueTasks || 0) + (stats?.urgentCases || 0)

  const markTaskDone = async (e: React.MouseEvent, task: Task) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: true }),
      })
      if (!res.ok) throw new Error('failed')
      toast.success(lang === 'ar' ? `✓ اكتملت: ${task.title}` : `✓ Done: ${task.title}`)
      onRefresh?.()
    } catch {
      toast.error(lang === 'ar' ? 'تعذر تحديث المهمة' : 'Failed to update task')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-7">
      {/* 1. Executive Briefing Header */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-7 border border-border/80 shadow-xs">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                {lang === 'ar' ? 'التركيز اليومي للمحامي' : 'Daily Lawyer Focus'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatHijri(now, lang)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t(greetingKey)}، <span className="text-primary font-black">أحمد</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {now.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {urgentCount > 0 ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-medium">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{lang === 'ar' ? `${urgentCount} بنود تتطلب اتخاذ إجراء` : `${urgentCount} items need action`}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{lang === 'ar' ? 'جدولك منظم ولا توجد متأخرات' : 'All schedules clear'}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Today's Metric Pulse */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          onClick={() => onNavigate('tasks')}
          className="glass-panel glass-card-hover rounded-xl p-4 cursor-pointer border border-border/80"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">{t('dash.open_tasks')}</span>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold tracking-tight">{stats?.openTasks ?? 0}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {stats?.todayTasks ?? 0} {t('dash.due_today')}
          </p>
        </div>

        <div
          onClick={() => onNavigate('cases')}
          className="glass-panel glass-card-hover rounded-xl p-4 cursor-pointer border border-border/80"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">{t('dash.active_cases')}</span>
            <Gavel className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight">{stats?.activeCases ?? 0}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {stats?.urgentCases ?? 0} {lang === 'ar' ? 'جلسة / موعد عاجل' : 'urgent hearings'}
          </p>
        </div>

        <div
          onClick={() => onNavigate('compliance')}
          className="glass-panel glass-card-hover rounded-xl p-4 cursor-pointer border border-border/80"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">{lang === 'ar' ? 'تجديدات وشيكة' : 'Expiring Docs'}</span>
            <CalendarClock className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight">{stats?.expiringCompliance ?? 0}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {lang === 'ar' ? 'خلال الـ 30 يوماً القادمة' : 'next 30 days'}
          </p>
        </div>

        <div
          onClick={() => onNavigate('deepwork')}
          className="glass-panel glass-card-hover rounded-xl p-4 cursor-pointer border border-border/80"
        >
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">{t('dash.billable_today')}</span>
            <Clock className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold tracking-tight">
            {formatDuration(stats?.billableTodaySec ?? 0, lang)}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {formatSAR(stats?.billableTodaySAR ?? 0, lang)}
          </p>
        </div>
      </div>

      {/* 3. Deep Work Launchpad */}
      <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
              <Timer className="h-4 w-4" />
              <span>{lang === 'ar' ? 'محطة التركيز والعمل العميق (Deep Work)' : 'Deep Work Focus Station'}</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-lg">
              {lang === 'ar'
                ? 'خصّص وقتاً غير منقطع لصياغة المذكرات، دراسة القضايا، أو التدقيق النظامي دون أي مشتتات مع احتساب الفوترة تلقائياً.'
                : 'Dedicate uninterrupted time for pleading drafting, legal review, and case study with automatic billing.'}
            </p>
          </div>

          <Button
            onClick={onStartFocus}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md gap-2 shrink-0 cursor-pointer"
          >
            <Zap className="h-4 w-4" />
            <span>{t('dash.start_focus')}</span>
          </Button>
        </div>

        {/* Quick timer presets */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-primary/20">
          <button
            onClick={onStartFocus}
            className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 hover:bg-background border border-border/60 hover:border-primary/40 text-xs transition-all cursor-pointer"
          >
            <span className="font-medium">{lang === 'ar' ? 'جلسة بومودورو سريعة' : 'Quick Pomodoro'}</span>
            <Badge variant="secondary" className="font-mono text-[10px]">25m</Badge>
          </button>
          <button
            onClick={onStartFocus}
            className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 hover:bg-background border border-border/60 hover:border-primary/40 text-xs transition-all cursor-pointer"
          >
            <span className="font-medium">{lang === 'ar' ? 'صياغة مذكرة جوابية' : 'Drafting Sprint'}</span>
            <Badge variant="secondary" className="font-mono text-[10px]">50m</Badge>
          </button>
          <button
            onClick={onStartFocus}
            className="flex items-center justify-between p-2.5 rounded-xl bg-background/60 hover:bg-background border border-border/60 hover:border-primary/40 text-xs transition-all cursor-pointer"
          >
            <span className="font-medium">{lang === 'ar' ? 'بحث وتحليل قضية عميق' : 'Case Analysis'}</span>
            <Badge variant="secondary" className="font-mono text-[10px]">90m</Badge>
          </button>
        </div>
      </div>

      {/* 4. Priority Tasks vs All-Clear */}
      <div className="rounded-2xl border border-border/80 glass-panel p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold tracking-tight">{t('dash.todays_priorities')}</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('tasks')}
            className="text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <span>{lang === 'ar' ? 'عرض كل المهام' : 'View all'}</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>

        {criticalTasks.length > 0 ? (
          <div className="space-y-2.5">
            {criticalTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => onNavigate('tasks', task.id)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-border/60 bg-background/50 hover:bg-muted/40 hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={(e) => markTaskDone(e, task)}
                    className="h-5 w-5 rounded-md border border-muted-foreground/40 hover:border-primary hover:bg-primary/10 grid place-items-center shrink-0 transition-colors cursor-pointer"
                    title={lang === 'ar' ? 'إتمام المهمة' : 'Complete task'}
                  >
                    <Check className="h-3 w-3 opacity-0 group-hover:opacity-40" />
                  </button>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold truncate group-hover:text-primary transition-colors">
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        {task.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {task.priority === 'urgent' && (
                    <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
                      {lang === 'ar' ? 'عاجل جداً' : 'Urgent'}
                    </Badge>
                  )}
                  {task.priority === 'high' && (
                    <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 text-[10px] px-2 py-0.5">
                      {lang === 'ar' ? 'هام' : 'High'}
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short' }) : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border/80 bg-muted/20">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center mx-auto mb-2.5">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-sm font-bold text-foreground">
              {lang === 'ar' ? 'يومك منظم ولا توجد أولويات متأخرة!' : 'All clear for today!'}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              {lang === 'ar'
                ? '«العدل أساس الملك» — بإمكانك استغلال الوقت في صياغة العقود أو بدء جلسة عمل عميق.'
                : 'Great job staying ahead of deadlines. You can use this time for contract drafting or deep analysis.'}
            </p>
          </div>
        )}
      </div>

      {/* 5. Quick Legal Actions Bar */}
      <div className="rounded-2xl border border-border/80 glass-panel p-5">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-3">
          {lang === 'ar' ? 'إجراءات قانونية سريعة' : 'Quick Legal Actions'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => onNavigate('documents')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-background/50 hover:bg-primary/10 border border-border/70 hover:border-primary/40 transition-all text-center gap-1.5 group cursor-pointer"
          >
            <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center group-hover:scale-110 transition-transform">
              <Scale className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold">{lang === 'ar' ? 'صياغة عقد / مذكرة' : 'Draft Document'}</span>
            <span className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'أتمتة ذكية' : 'Smart Hub'}</span>
          </button>

          <button
            onClick={() => onNavigate('cases')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-background/50 hover:bg-primary/10 border border-border/70 hover:border-primary/40 transition-all text-center gap-1.5 group cursor-pointer"
          >
            <div className="h-8 w-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center group-hover:scale-110 transition-transform">
              <Gavel className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold">{lang === 'ar' ? 'إدارة القضايا' : 'Cases Board'}</span>
            <span className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'كانبان تفاعلي' : 'Kanban view'}</span>
          </button>

          <button
            onClick={() => onNavigate('scanner')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-background/50 hover:bg-primary/10 border border-border/70 hover:border-primary/40 transition-all text-center gap-1.5 group cursor-pointer"
          >
            <div className="h-8 w-8 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 grid place-items-center group-hover:scale-110 transition-transform">
              <Camera className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold">{lang === 'ar' ? 'ماسح ضوئي ذكي' : 'Smart Scanner'}</span>
            <span className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'OCR واستخراج نص' : 'OCR & Extract'}</span>
          </button>

          <button
            onClick={() => onNavigate('invoices')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-background/50 hover:bg-primary/10 border border-border/70 hover:border-primary/40 transition-all text-center gap-1.5 group cursor-pointer"
          >
            <div className="h-8 w-8 rounded-lg bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 grid place-items-center group-hover:scale-110 transition-transform">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-xs font-semibold">{lang === 'ar' ? 'الفواتير والتحصيل' : 'Invoices'}</span>
            <span className="text-[10px] text-muted-foreground">{lang === 'ar' ? 'متوافق مع ZATCA' : 'ZATCA QR'}</span>
          </button>
        </div>
      </div>

      {/* 6. Live Regulatory Updates & Briefs Ticker */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-card/70 to-card/40 p-5 space-y-3.5 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                {lang === 'ar' ? 'موجز الأنظمة والقرارات الحكومية الحية' : 'Live Saudi Regulatory Updates'}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                {lang === 'ar' ? 'رصد آلي وتلخيص فوري للوائح وقرارات مجلس الوزراء والوزارات' : 'AI-summarized decrees, ministerial rules, and ZATCA updates'}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => onNavigate('briefs')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
          >
            <span>{lang === 'ar' ? 'استعراض كافة القرارات' : 'View All'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div
            onClick={() => onNavigate('briefs')}
            className="p-3.5 rounded-xl border border-border/70 bg-background/60 hover:bg-background hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                أم القرى • نظام المعاملات
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono">جديد</span>
            </div>
            <p className="text-xs font-bold text-foreground group-hover:text-emerald-500 transition-colors line-clamp-1">
              صدور اللائحة التنفيذية لنظام المعاملات المدنية المحدثة
            </p>
            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
              معايير قضائية دقيقة لتقدير التعويض وسقف الشروط الجزائية التقديرية وفق المادة (179).
            </p>
          </div>

          <div
            onClick={() => onNavigate('briefs')}
            className="p-3.5 rounded-xl border border-border/70 bg-background/60 hover:bg-background hover:border-emerald-500/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30">
                الموارد البشرية • نظام العمل
              </Badge>
              <span className="text-[10px] text-muted-foreground font-mono">جديد</span>
            </div>
            <p className="text-xs font-bold text-foreground group-hover:text-emerald-500 transition-colors line-clamp-1">
              تعديل ضوابط مهلة تصحيح أوضاع مخالفي نظام العمل
            </p>
            <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
              تمديد مهلة الاعتراض إلى 60 يوماً وإلزامية تسجيل العقود عبر منصة قوى.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
