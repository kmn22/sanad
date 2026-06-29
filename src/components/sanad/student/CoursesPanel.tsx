'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible'
import { Plus, ChevronDown, BookOpen, Calendar, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { formatDate, type Course, type Lecture } from '@/lib/sanad/types'

interface Props {
  courses: (Course & { lectures: Lecture[]; deadlines: any[] })[]
  onChange: () => void
}

const COLORS = ['#0F5132', '#b45309', '#7c3aed', '#0891b2', '#9333ea', '#dc2626', '#0891b2', '#65a30d']

export function CoursesPanel({ courses, onChange }: Props) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(courses[0]?.id || null)
  const [lectureDialogCourseId, setLectureDialogCourseId] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t('courses.subtitle')}</p>
        <AddCourseDialog open={open} onOpenChange={setOpen} onSaved={() => { onChange(); setOpen(false) }} />
      </div>

      <div className="space-y-3">
        {courses.map((c) => (
          <Card key={c.id} className="overflow-hidden">
            <Collapsible open={expandedId === c.id} onOpenChange={(o) => setExpandedId(o ? c.id : null)}>
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors text-start">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="h-10 w-1.5 rounded-full shrink-0" style={{ background: c.color }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate">{c.title}</p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-muted-foreground">
                        {c.code && <span className="font-mono">{c.code}</span>}
                        {c.instructor && <span>• {c.instructor}</span>}
                        {c.credits && <span>• {c.credits} {t('courses.credits')}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-[10px] bg-muted/60">
                      {c.lectures.length} {t('courses.lectures_count')}
                    </Badge>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === c.id ? 'rotate-180' : ''}`} />
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4 px-4 border-t border-border">
                  {c.notes && <p className="text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2 my-3">{c.notes}</p>}

                  <div className="flex items-center justify-between my-3">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{t('courses.lectures_count')}</h4>
                    <AddLectureDialog
                      courseId={c.id}
                      open={lectureDialogCourseId === c.id}
                      onOpenChange={(o) => setLectureDialogCourseId(o ? c.id : null)}
                      onSaved={() => { onChange(); setLectureDialogCourseId(null) }}
                    />
                  </div>

                  {c.lectures.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">{t('courses.no_lectures')}</p>
                  ) : (
                    <ul className="space-y-2">
                      {c.lectures.slice().reverse().map((l) => (
                        <LectureRow key={l.id} lecture={l} onChange={onChange} />
                      ))}
                    </ul>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {courses.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
            {t('courses.no_lectures')}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function LectureRow({ lecture, onChange }: { lecture: Lecture; onChange: () => void }) {
  const { lang, t } = useLang()
  const [editing, setEditing] = useState(false)
  const [notes, setNotes] = useState(lecture.notes)

  const cycleStatus = async () => {
    const next = lecture.status === 'draft' ? 'reviewed' : lecture.status === 'reviewed' ? 'mastered' : 'draft'
    try {
      const res = await fetch(`/api/lectures/${lecture.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      })
      if (!res.ok) throw new Error('Failed to update lecture status')
      onChange()
    } catch {
      toast.error(t('common.failed'))
    }
  }

  const saveNotes = async () => {
    try {
      const res = await fetch(`/api/lectures/${lecture.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (!res.ok) throw new Error('Failed to save notes')
      toast.success(t('courses.save'))
      setEditing(false)
      onChange()
    } catch {
      toast.error(t('common.failed'))
    }
  }

  const statusColor =
    lecture.status === 'mastered' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
    lecture.status === 'reviewed' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
    'bg-muted text-muted-foreground'

  return (
    <li className="rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{lecture.title}</p>
          {lecture.topic && <p className="text-xs text-muted-foreground mt-0.5">{lecture.topic}</p>}
        </div>
        <button onClick={cycleStatus}>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 cursor-pointer hover:opacity-80 ${statusColor}`}>
            {t(`lstatus.${lecture.status}`)}
          </Badge>
        </button>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(lecture.lectureDate, lang)}
        </span>
      </div>
      {editing ? (
        <div className="space-y-2">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} className="text-xs" />
          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={saveNotes}>{t('courses.save')}</Button>
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setEditing(false); setNotes(lecture.notes) }}>{t('comp.cancel')}</Button>
          </div>
        </div>
      ) : (
        <>
          {lecture.notes && (
            <p className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1.5 mb-2 whitespace-pre-wrap">{lecture.notes}</p>
          )}
          <Button variant="ghost" size="sm" className="h-6 text-[11px] text-muted-foreground" onClick={() => setEditing(true)}>
            {lecture.notes ? 'تعديل' : 'إضافة ملاحظات'}
          </Button>
        </>
      )}
    </li>
  )
}

function AddCourseDialog({ open, onOpenChange, onSaved }: { open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void }) {
  const { t } = useLang()
  const [form, setForm] = useState({ title: '', code: '', instructor: '', semester: '', credits: '', color: COLORS[0], notes: '' })

  const submit = async () => {
    if (!form.title) {
      toast.error(t('courses.f_title'))
      return
    }
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          credits: form.credits ? parseInt(form.credits) : null,
          code: form.code || null,
          instructor: form.instructor || null,
          semester: form.semester || null,
          notes: form.notes || null,
        }),
      })
      if (!res.ok) throw new Error('Failed to create course')
      toast.success(t('courses.create'))
      setForm({ title: '', code: '', instructor: '', semester: '', credits: '', color: COLORS[0], notes: '' })
      onSaved()
    } catch {
      toast.error(t('common.failed'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mx-1.5 h-4 w-4" /> {t('courses.add')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('courses.add')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="c-title">{t('courses.f_title')}</Label>
            <Input id="c-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: النظرية العامة للالتزام" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-code">{t('courses.f_code')}</Label>
              <Input id="c-code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="LAW 301" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-credits">{t('courses.f_credits')}</Label>
              <Input id="c-credits" type="number" value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} placeholder="3" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="c-instructor">{t('courses.f_instructor')}</Label>
              <Input id="c-instructor" value={form.instructor} onChange={(e) => setForm({ ...form, instructor: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-semester">{t('courses.f_semester')}</Label>
              <Input id="c-semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} placeholder="الفصل الأول 1447هـ" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t('courses.f_color')}</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  className={`h-7 w-7 rounded-full border-2 ${form.color === color ? 'border-foreground' : 'border-transparent'}`}
                  style={{ background: color }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="c-notes">{t('courses.f_notes')}</Label>
            <Textarea id="c-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('comp.cancel')}</Button></DialogClose>
          <Button onClick={submit}>{t('courses.create')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddLectureDialog({ courseId, open, onOpenChange, onSaved }: { courseId: string; open: boolean; onOpenChange: (v: boolean) => void; onSaved: () => void }) {
  const { t } = useLang()
  const [form, setForm] = useState({ title: '', lectureDate: '', topic: '', notes: '', status: 'draft' })

  const submit = async () => {
    if (!form.title || !form.lectureDate) {
      toast.error(t('courses.lecture_title'))
      return
    }
    try {
      const res = await fetch('/api/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          courseId,
          lectureDate: new Date(form.lectureDate).toISOString(),
          topic: form.topic || null,
          notes: form.notes || '',
        }),
      })
      if (!res.ok) throw new Error('Failed to create lecture')
      toast.success(t('courses.lecture.add'))
      setForm({ title: '', lectureDate: '', topic: '', notes: '', status: 'draft' })
      onSaved()
    } catch {
      toast.error(t('common.failed'))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 text-xs">
          <Plus className="mx-1 h-3.5 w-3.5" /> {t('courses.add_lecture')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('courses.add_lecture')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="l-title">{t('courses.lecture_title')}</Label>
            <Input id="l-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: محاضرة 5: أسباب انعدام الأهلية" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="l-date">{t('courses.lecture_date')}</Label>
              <Input id="l-date" type="date" value={form.lectureDate} onChange={(e) => setForm({ ...form, lectureDate: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="l-status">{t('courses.lecture_status')}</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger id="l-status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">{t('lstatus.draft')}</SelectItem>
                  <SelectItem value="reviewed">{t('lstatus.reviewed')}</SelectItem>
                  <SelectItem value="mastered">{t('lstatus.mastered')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-topic">{t('courses.lecture_topic')}</Label>
            <Input id="l-topic" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="l-notes">{t('courses.lecture_notes')}</Label>
            <Textarea id="l-notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} placeholder="ملاحظاتك من المحاضرة..." />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">{t('comp.cancel')}</Button></DialogClose>
          <Button onClick={submit}>{t('courses.lecture.add')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
