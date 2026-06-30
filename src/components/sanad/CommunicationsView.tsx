'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Phone, Mail, Users, MessageSquare, FileText, Plus,
  ArrowDownLeft, ArrowUpRight, Clock, Filter, X, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { formatDate, type Communication, type LegalCase } from '@/lib/sanad/types'

interface Client {
  id: string
  name: string
}

interface Props {
  cases: LegalCase[]
  clients: Client[]
  onChange: () => void
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  sms: MessageSquare,
  note: FileText,
}

const TYPE_COLORS: Record<string, string> = {
  call: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  email: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  meeting: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  sms: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  note: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300',
}

const EMPTY_FORM = {
  type: 'call',
  direction: 'outgoing',
  subject: '',
  body: '',
  clientId: '',
  caseId: '',
  durationMin: '',
  date: new Date().toISOString().slice(0, 16),
}

export function CommunicationsView({ cases, clients, onChange }: Props) {
  const { lang, t } = useLang()
  const [items, setItems] = useState<Communication[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDirection, setFilterDirection] = useState<string>('all')
  const [search, setSearch] = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/communications')
      if (!res.ok) throw new Error()
      setItems(await res.json())
    } catch {
      toast.error(lang === 'ar' ? 'فشل تحميل السجلات' : 'Failed to load communications')
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => { fetchData() }, [fetchData])

  const save = async () => {
    if (!form.subject.trim()) {
      toast.error(lang === 'ar' ? 'الموضوع مطلوب' : 'Subject is required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        durationMin: form.durationMin ? parseInt(form.durationMin) : null,
        clientId: form.clientId || null,
        caseId: form.caseId || null,
      }
      const res = await fetch('/api/communications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error()
      toast.success(lang === 'ar' ? 'تم حفظ السجل' : 'Communication logged')
      setForm({ ...EMPTY_FORM, date: new Date().toISOString().slice(0, 16) })
      setShowForm(false)
      fetchData()
      onChange()
    } catch {
      toast.error(lang === 'ar' ? 'فشل الحفظ' : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const filtered = items.filter((c) => {
    if (filterType !== 'all' && c.type !== filterType) return false
    if (filterDirection !== 'all' && c.direction !== filterDirection) return false
    if (search) {
      const q = search.toLowerCase()
      return c.subject.toLowerCase().includes(q) ||
        c.body?.toLowerCase().includes(q) ||
        c.client?.name.toLowerCase().includes(q) ||
        c.case?.title.toLowerCase().includes(q)
    }
    return true
  })

  // Stats
  const now = new Date()
  const thisMonth = items.filter((c) => {
    const d = new Date(c.date)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const callsThisMonth = thisMonth.filter((c) => c.type === 'call').length
  const meetingsThisMonth = thisMonth.filter((c) => c.type === 'meeting').length
  const totalMinutes = thisMonth
    .filter((c) => c.durationMin)
    .reduce((s, c) => s + (c.durationMin || 0), 0)

  const typeLabel = (type: string) => {
    const labels: Record<string, { ar: string; en: string }> = {
      call: { ar: 'مكالمة', en: 'Call' },
      email: { ar: 'بريد', en: 'Email' },
      meeting: { ar: 'اجتماع', en: 'Meeting' },
      sms: { ar: 'رسالة', en: 'SMS' },
      note: { ar: 'ملاحظة', en: 'Note' },
    }
    return lang === 'ar' ? labels[type]?.ar : labels[type]?.en
  }

  const dirLabel = (dir: string) =>
    dir === 'incoming'
      ? lang === 'ar' ? 'واردة' : 'Incoming'
      : lang === 'ar' ? 'صادرة' : 'Outgoing'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Phone className="h-5 w-5 text-primary" />
            {lang === 'ar' ? 'سجل التواصل' : 'Communications Log'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {lang === 'ar' ? 'مكالمات، اجتماعات، مراسلات — موثقة مع العملاء والقضايا' : 'Calls, meetings, emails — logged against clients and cases'}
          </p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="mx-1.5 h-4 w-4" />
          {lang === 'ar' ? 'تسجيل تواصل' : 'Log Communication'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30">
              <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{callsThisMonth}</p>
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'مكالمة هذا الشهر' : 'Calls this month'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{meetingsThisMonth}</p>
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'اجتماع هذا الشهر' : 'Meetings this month'}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{totalMinutes}</p>
              <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'دقيقة إجمالية' : 'Total minutes'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="border-primary/30 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                {lang === 'ar' ? 'تسجيل تواصل جديد' : 'Log New Communication'}
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === 'ar' ? 'النوع' : 'Type'}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="call">{lang === 'ar' ? 'مكالمة' : 'Call'}</SelectItem>
                    <SelectItem value="email">{lang === 'ar' ? 'بريد إلكتروني' : 'Email'}</SelectItem>
                    <SelectItem value="meeting">{lang === 'ar' ? 'اجتماع' : 'Meeting'}</SelectItem>
                    <SelectItem value="sms">{lang === 'ar' ? 'رسالة نصية' : 'SMS'}</SelectItem>
                    <SelectItem value="note">{lang === 'ar' ? 'ملاحظة' : 'Note'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === 'ar' ? 'الاتجاه' : 'Direction'}</Label>
                <Select value={form.direction} onValueChange={(v) => setForm({ ...form, direction: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outgoing">{lang === 'ar' ? 'صادرة' : 'Outgoing'}</SelectItem>
                    <SelectItem value="incoming">{lang === 'ar' ? 'واردة' : 'Incoming'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === 'ar' ? 'التاريخ والوقت' : 'Date & Time'}</Label>
                <Input
                  type="datetime-local"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{lang === 'ar' ? 'الموضوع *' : 'Subject *'}</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder={lang === 'ar' ? 'مثال: مناقشة بنود العقد' : 'e.g., Discussed contract terms'}
                className="h-8"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === 'ar' ? 'العميل' : 'Client'}</Label>
                <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={lang === 'ar' ? 'اختر عميل' : 'Select client'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{lang === 'ar' ? 'بدون عميل' : 'No client'}</SelectItem>
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === 'ar' ? 'القضية' : 'Case'}</Label>
                <Select value={form.caseId} onValueChange={(v) => setForm({ ...form, caseId: v })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={lang === 'ar' ? 'اختر قضية' : 'Select case'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{lang === 'ar' ? 'بدون قضية' : 'No case'}</SelectItem>
                    {cases.filter((c) => c.stage !== 'closed').map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {(form.type === 'call' || form.type === 'meeting') && (
                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === 'ar' ? 'المدة (دقيقة)' : 'Duration (min)'}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={form.durationMin}
                    onChange={(e) => setForm({ ...form, durationMin: e.target.value })}
                    placeholder="30"
                    className="h-8"
                  />
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">{lang === 'ar' ? 'ملاحظات / ملخص' : 'Notes / Summary'}</Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                placeholder={lang === 'ar' ? 'ملخص ما تمت مناقشته أو نتائج التواصل...' : 'Summary of what was discussed or outcome...'}
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>{lang === 'ar' ? 'إلغاء' : 'Cancel'}</Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin mx-1" /> : null}
                {lang === 'ar' ? 'حفظ السجل' : 'Save Log'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
          className="h-7 w-40 text-xs"
        />
        {(['all', 'call', 'email', 'meeting', 'sms', 'note'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
              filterType === type
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/40'
            }`}
          >
            {type === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : typeLabel(type)}
          </button>
        ))}
        <Separator orientation="vertical" className="h-4" />
        {(['all', 'incoming', 'outgoing'] as const).map((dir) => (
          <button
            key={dir}
            onClick={() => setFilterDirection(dir)}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
              filterDirection === dir
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/40'
            }`}
          >
            {dir === 'all' ? (lang === 'ar' ? 'الكل' : 'All') : dirLabel(dir)}
          </button>
        ))}
        {filtered.length !== items.length && (
          <span className="text-[10px] text-muted-foreground ms-1">
            {filtered.length} / {items.length}
          </span>
        )}
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <Phone className="h-8 w-8 mx-auto mb-2 opacity-30" />
              {lang === 'ar' ? 'لا توجد سجلات تواصل' : 'No communications logged yet'}
            </div>
          ) : (
            <ScrollArea className="h-[520px]">
              <ul className="divide-y divide-border">
                {filtered.map((c) => {
                  const Icon = TYPE_ICONS[c.type] ?? FileText
                  const isIncoming = c.direction === 'incoming'
                  return (
                    <li key={c.id} className="px-4 py-3 hover:bg-muted/40 transition-colors">
                      <div className="flex items-start gap-3">
                        {/* Type icon */}
                        <div className={`mt-0.5 p-1.5 rounded-md shrink-0 ${TYPE_COLORS[c.type] || 'bg-muted text-muted-foreground'}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Subject + direction */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-medium leading-tight">{c.subject}</p>
                            <span className={`flex items-center gap-0.5 text-[10px] font-medium ${isIncoming ? 'text-blue-600 dark:text-blue-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                              {isIncoming
                                ? <ArrowDownLeft className="h-2.5 w-2.5" />
                                : <ArrowUpRight className="h-2.5 w-2.5" />}
                              {dirLabel(c.direction)}
                            </span>
                          </div>

                          {/* Body */}
                          {c.body && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{c.body}</p>
                          )}

                          {/* Meta row */}
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${TYPE_COLORS[c.type] || ''}`}>
                              {typeLabel(c.type)}
                            </Badge>
                            {c.client && (
                              <span className="text-[10px] text-muted-foreground">{c.client.name}</span>
                            )}
                            {c.case && (
                              <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">{c.case.title}</span>
                            )}
                            {c.durationMin && (
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <Clock className="h-2.5 w-2.5" />
                                {c.durationMin}{lang === 'ar' ? 'د' : 'm'}
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground ms-auto">{formatDate(c.date, lang)}</span>
                          </div>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
