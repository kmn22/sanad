'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, BookOpen, Brain, CalendarClock, GraduationCap, Library, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PortalPageHeader, PortalShell, useBilingual, type NavSection } from '@/components/portal/PortalShell'
import { useStudentDashboard } from '@/components/portal/usePortalData'
import { StudentView } from '@/components/sanad/StudentView'
import { useLang } from '@/lib/sanad/i18n'
import type { StudentTab } from './tabs'

const TAB_TITLES: Record<StudentTab, { ar: string; en: string; subAr: string; subEn: string }> = {
  overview: { ar: 'صباح الخير، استعد ليومك الدراسي', en: 'Your study day at a glance', subAr: 'المحاضرات والمواعيد ومراجعة اليوم', subEn: 'Lectures, deadlines and today’s review' },
  courses: { ar: 'المقررات', en: 'Courses', subAr: 'مقرراتك ومحاضراتك وملاحظاتك', subEn: 'Your courses, lectures and notes' },
  deadlines: { ar: 'المواعيد الأكاديمية', en: 'Deadlines', subAr: 'الاختبارات والتكليفات والأبحاث', subEn: 'Exams, assignments and papers' },
  terms: { ar: 'بنك المصطلحات', en: 'Terms bank', subAr: 'مصطلحاتك القانونية مع التكرار المتباعد', subEn: 'Legal terms with spaced repetition' },
  casebook: { ar: 'دفتر القضايا', en: 'Casebook', subAr: 'ملخصات الأحكام والسوابق', subEn: 'Case briefs and precedents' },
  review: { ar: 'جلسات المراجعة', en: 'Review sessions', subAr: 'راجع بذكاء قبل الاختبار', subEn: 'Smart review before exams' },
  research: { ar: 'مركز الأبحاث', en: 'Research hub', subAr: 'ابحث في الأنظمة والمبادئ', subEn: 'Search statutes and principles' },
}

export function StudentPortalFrame({ children }: { children: React.ReactNode }) {
  const { data, busy, refetch } = useStudentDashboard()
  const stats = data?.stats

  const sections: NavSection[] = [
    {
      title: { ar: 'يومي الدراسي', en: 'My study day' },
      items: [
        { href: '/student', exact: true, icon: GraduationCap, label: { ar: 'نظرة عامة', en: 'Overview' } },
        {
          href: '/student/deadlines',
          icon: CalendarClock,
          label: { ar: 'المواعيد', en: 'Deadlines' },
          badge: stats && stats.overdueDeadlines > 0 ? { text: `${stats.overdueDeadlines}`, tone: 'rose' } : null,
        },
        { href: '/student/review', icon: Brain, label: { ar: 'المراجعة', en: 'Review' } },
      ],
    },
    {
      title: { ar: 'المكتبة', en: 'Library' },
      items: [
        { href: '/student/courses', icon: BookOpen, label: { ar: 'المقررات', en: 'Courses' }, badge: stats?.courses ? { text: `${stats.courses}`, tone: 'muted' } : null },
        { href: '/student/terms', icon: Library, label: { ar: 'بنك المصطلحات', en: 'Terms bank' }, badge: stats?.terms ? { text: `${stats.terms}`, tone: 'muted' } : null },
        { href: '/student/casebook', icon: Scale, label: { ar: 'دفتر القضايا', en: 'Casebook' }, badge: stats?.cases ? { text: `${stats.cases}`, tone: 'muted' } : null },
        { href: '/student/research', icon: Bookmark, label: { ar: 'مركز الأبحاث', en: 'Research hub' } },
      ],
    },
  ]

  return (
    <PortalShell portal="student" sections={sections} onRefresh={() => refetch()} refreshing={busy}>
      {children}
    </PortalShell>
  )
}

export function StudentTabPage({ tab }: { tab: StudentTab }) {
  const router = useRouter()
  const { t } = useLang()
  const L = useBilingual()
  const { data, isLoading, refetch } = useStudentDashboard()
  const title = TAB_TITLES[tab]

  return (
    <>
      <PortalPageHeader portal="student" title={L(title)} subtitle={L({ ar: title.subAr, en: title.subEn })} />
      {isLoading && !data ? (
        <div className="space-y-4 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-muted rounded-xl" />)}</div>
          <div className="h-64 bg-muted rounded-xl" />
        </div>
      ) : data ? (
        <StudentView
          embedded
          data={data}
          onChange={() => refetch()}
          activeTab={tab}
          onTabChange={(next) => router.push(next === 'overview' ? '/student' : `/student/${next}`)}
        />
      ) : (
        <div className="text-center py-12 text-sm text-muted-foreground">
          {t('dash.failed_load')}{' '}
          <Button variant="link" onClick={() => refetch()}>
            {t('dash.retry')}
          </Button>
        </div>
      )}
    </>
  )
}
