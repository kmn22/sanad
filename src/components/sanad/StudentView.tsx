'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  CalendarClock,
  AlertTriangle,
  BookOpen,
  GraduationCap,
  Scale,
  Library,
  FileText,
  ArrowLeft,
  Brain,
  Sparkles,
} from 'lucide-react'
import { useLang } from '@/lib/sanad/i18n'
import {
  SOURCE_COLORS,
  daysUntil,
  formatDate,
  formatHijri,
  type StudentDashboardData,
} from '@/lib/sanad/types'
import { CoursesPanel } from './student/CoursesPanel'
import { DeadlinesPanel } from './student/DeadlinesPanel'
import { TermsPanel } from './student/TermsPanel'
import { CasebookPanel } from './student/CasebookPanel'
import { ReviewPanel } from './student/ReviewPanel'

interface Props {
  data: StudentDashboardData
  onChange: () => void
}

export function StudentView({ data, onChange }: Props) {
  const { lang, t } = useLang()
  const [tab, setTab] = useState('overview')

  const { stats } = data
  const now = new Date()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{t('student.morning')}</h2>
        <p className="text-sm text-muted-foreground">{t('student.subtitle')}</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 h-auto">
          <TabsTrigger value="overview" className="text-xs gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('student.morning')}</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="text-xs gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('student.courses')}</span>
            <span className="text-[10px] bg-primary/15 text-primary rounded-full px-1.5">{stats.courses}</span>
          </TabsTrigger>
          <TabsTrigger value="deadlines" className="text-xs gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('student.deadlines')}</span>
            {stats.overdueDeadlines > 0 && (
              <span className="text-[10px] bg-rose-500/15 text-rose-700 dark:text-rose-400 rounded-full px-1.5">{stats.overdueDeadlines}</span>
            )}
          </TabsTrigger>
          <TabsTrigger value="terms" className="text-xs gap-1.5">
            <Library className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('student.terms_bank')}</span>
            <span className="text-[10px] bg-primary/15 text-primary rounded-full px-1.5">{stats.terms}</span>
          </TabsTrigger>
          <TabsTrigger value="casebook" className="text-xs gap-1.5">
            <Scale className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('student.casebook')}</span>
            <span className="text-[10px] bg-primary/15 text-primary rounded-full px-1.5">{stats.cases}</span>
          </TabsTrigger>
          <TabsTrigger value="review" className="text-xs gap-1.5">
            <Brain className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('review.title')}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">
          <OverviewPanel data={data} onNavigate={setTab} />
        </TabsContent>

        <TabsContent value="courses" className="mt-6">
          <CoursesPanel courses={data.courses} onChange={onChange} />
        </TabsContent>

        <TabsContent value="deadlines" className="mt-6">
          <DeadlinesPanel
            deadlines={data.deadlines.all}
            courses={data.courses}
            onChange={onChange}
          />
        </TabsContent>

        <TabsContent value="terms" className="mt-6">
          <TermsPanel terms={data.terms} onChange={onChange} />
        </TabsContent>

        <TabsContent value="casebook" className="mt-6">
          <CasebookPanel cases={data.cases} onChange={onChange} />
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <ReviewPanel courses={data.courses} onSessionComplete={onChange} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function OverviewPanel({ data, onNavigate }: { data: StudentDashboardData; onNavigate: (tab: string) => void }) {
  const { lang, t } = useLang()
  const { stats } = data

  // Term mastery progress
  const totalTerms = stats.terms || 1
  const masteryPct = Math.round((stats.masteredTerms / totalTerms) * 100)

  return (
    <div className="space-y-6">
      {/* Critical alerts row */}
      {(stats.overdueDeadlines > 0 || stats.dueThisWeek > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stats.overdueDeadlines > 0 && (
            <button
              onClick={() => onNavigate('deadlines')}
              className="text-start rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-950/30 dark:border-rose-900 p-4 hover:bg-rose-100 dark:hover:bg-rose-950/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <span className="text-sm font-medium text-rose-700 dark:text-rose-300">{t('student.overdue')}</span>
              </div>
              <p className="text-2xl font-semibold text-rose-700 dark:text-rose-300">{stats.overdueDeadlines}</p>
              <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-1">{t('dash.needs_attention')}</p>
            </button>
          )}
          {stats.dueThisWeek > 0 && (
            <button
              onClick={() => onNavigate('deadlines')}
              className="text-start rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-4 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <CalendarClock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">{t('student.due_week')}</span>
              </div>
              <p className="text-2xl font-semibold text-amber-700 dark:text-amber-300">{stats.dueThisWeek}</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">{t('student.upcoming')}</p>
            </button>
          )}
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard label={t('student.courses')} value={stats.courses} icon={<BookOpen className="h-4 w-4" />} onClick={() => onNavigate('courses')} />
        <KpiCard label={t('student.upcoming')} value={stats.upcomingDeadlines} sub={`${stats.dueThisMonth} ${t('student.due_month')}`} icon={<CalendarClock className="h-4 w-4" />} onClick={() => onNavigate('deadlines')} />
        <KpiCard label={t('student.terms_bank')} value={stats.terms} sub={`${stats.masteredTerms} ${t('student.mastered')}`} icon={<Library className="h-4 w-4" />} onClick={() => onNavigate('terms')} />
        <KpiCard label={t('student.casebook')} value={stats.cases} icon={<Scale className="h-4 w-4" />} onClick={() => onNavigate('casebook')} />
      </div>

      {/* Smart review CTA */}
      <button
        onClick={() => onNavigate('review')}
        className="w-full text-start rounded-xl border-2 border-primary/30 bg-gradient-to-l from-primary/5 to-primary/10 hover:border-primary hover:shadow-md transition-all p-5 flex items-center gap-4"
      >
        <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground grid place-items-center shrink-0">
          <Brain className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-semibold">{t('review.title')}</p>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-primary/15 text-primary border-primary/30">
              <Sparkles className="h-2.5 w-2.5 me-1" />
              {t('review.start')}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{t('review.subtitle')}</p>
        </div>
        <Brain className="h-5 w-5 text-primary shrink-0" />
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: upcoming deadlines */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  {t('student.upcoming')}
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => onNavigate('deadlines')}>
                  {t('dash.view_all')}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {data.deadlines.upcoming.length === 0 ? (
                <p className="text-sm text-muted-foreground py-6 text-center">{t('student.no_upcoming')}</p>
              ) : (
                <ul className="space-y-2">
                  {[...data.deadlines.overdue, ...data.deadlines.upcoming].slice(0, 6).map((d) => {
                    const days = daysUntil(d.dueDate)
                    const overdue = days < 0
                    const course = d.course
                    return (
                      <li key={d.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                        <span
                          className="mt-1.5 h-3 w-3 rounded-full shrink-0 border-2"
                          style={{ borderColor: course?.color || '#94a3b8' }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight truncate">{d.title}</p>
                          {course && <p className="text-xs text-muted-foreground truncate">{course.title}</p>}
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted/60">
                              {t(`dtype.${d.type}`)}
                            </Badge>
                            {d.weight && (
                              <span className="text-[10px] text-muted-foreground">{t('deadlines.weight', { n: d.weight })}</span>
                            )}
                            <span className={`text-[10px] ${overdue ? 'text-rose-600 dark:text-rose-400 font-medium' : 'text-muted-foreground'}`}>
                              {overdue ? t('dash.d_overdue', { n: Math.abs(days) }) : `${formatDate(d.dueDate, lang)} (${days}d)`}
                            </span>
                          </div>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                {t('student.recent_lectures')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[280px] -mx-1 px-1 scroll-thin">
                <ul className="space-y-2">
                  {data.lectures.slice(0, 8).map((l) => {
                    const course = l.course
                    const statusColor =
                      l.status === 'mastered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                      l.status === 'reviewed' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                      'bg-muted text-muted-foreground'
                    return (
                      <li key={l.id} className="rounded-md border border-border p-2.5 hover:bg-muted/40 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs font-medium flex-1">{l.title}</p>
                          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 shrink-0 ${statusColor}`}>
                            {t(`lstatus.${l.status}`)}
                          </Badge>
                        </div>
                        {course && (
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <span className="h-2 w-2 rounded-full" style={{ background: course.color }} />
                            <span className="truncate">{course.title}</span>
                            <span>•</span>
                            <span>{formatDate(l.lectureDate, lang)}</span>
                          </div>
                        )}
                        {l.topic && <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">{l.topic}</p>}
                      </li>
                    )
                  })}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Right: term progress + brief */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Library className="h-4 w-4 text-primary" />
                {t('student.term_progress')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-2">
                <p className="text-3xl font-semibold text-primary">{masteryPct}%</p>
                <p className="text-xs text-muted-foreground mt-1">{t('student.mastered')}</p>
              </div>
              <Progress value={masteryPct} className="h-2" />
              <div className="grid grid-cols-3 gap-2 pt-2">
                <MasteryBox label={t('student.mastered')} count={stats.masteredTerms} color="bg-emerald-500" />
                <MasteryBox label={t('student.familiar')} count={stats.familiarTerms} color="bg-amber-500" />
                <MasteryBox label={t('student.learning')} count={stats.learningTerms} color="bg-slate-400" />
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={() => onNavigate('terms')}>
                <Library className="mx-1.5 h-3.5 w-3.5" />
                {t('student.terms_bank')}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                {t('dash.daily_brief')}
              </CardTitle>
              <p className="text-xs text-muted-foreground">{t('dash.brief_subtitle')}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-[260px] px-1 scroll-thin">
                <div className="space-y-3">
                  {data.briefs.map((b, i) => (
                    <div key={b.id} className={i > 0 ? 'pt-3 border-t border-border' : ''}>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${SOURCE_COLORS[b.source] || 'bg-muted'}`}>
                          {t(`src.${b.source}`)}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{formatDate(b.publishedAt, lang)}</span>
                      </div>
                      <h4 className="text-sm font-semibold leading-tight">{b.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed mt-1 line-clamp-3">{b.summary}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, icon, onClick }: { label: string; value: number; sub?: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-start">
      <Card className="hover:border-primary/40 hover:shadow-sm transition-all h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-muted-foreground">{icon}</span>
          </div>
          <p className="text-xl font-semibold tracking-tight">{value.toLocaleString('ar-EG')}</p>
          {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
        </CardContent>
      </Card>
    </button>
  )
}

function MasteryBox({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="text-center rounded-md border border-border p-2">
      <span className={`inline-block h-2 w-2 rounded-full ${color} mb-1`} />
      <p className="text-sm font-semibold">{count.toLocaleString('ar-EG')}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
