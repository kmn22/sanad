'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Brain, Sparkles, Trophy, Clock, Target, Zap, CheckCircle2, XCircle,
  ChevronLeft, RotateCcw, Library, Scale, BookOpen, Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLang } from '@/lib/sanad/i18n'
import { formatDate, formatDuration, type Course } from '@/lib/sanad/types'

interface ReviewCard {
  id: string
  type: 'term' | 'case' | 'lecture'
  front: string
  back: string
  hint?: string
  source: string
  options?: string[]
  correctIndex?: number
  questionType?: 'mcq' | 'tf'
}

interface ReviewDeck {
  cards: ReviewCard[]
  source: string
  sourceLabel: string
  mode: 'flashcards' | 'quiz'
  total: number
}

interface SessionStats {
  total: number
  totalCards: number
  totalCorrect: number
  avgScore: number
  totalDurationSec: number
  accuracy: number
}

interface ReviewSession {
  id: string
  mode: string
  sourceType: string
  sourceLabel: string
  cardCount: number
  correctCount: number
  reviewedCount: number
  durationSec: number
  score: number | null
  date: string
}

interface SessionsResponse {
  sessions: ReviewSession[]
  stats: SessionStats
  recent: ReviewSession[]
}

interface Props {
  courses: Course[]
  onSessionComplete?: () => void
}

const SUBJECTS = ['civil', 'criminal', 'commercial', 'administrative', 'constitutional', 'procedural', 'family']

type ViewState = 'setup' | 'session' | 'summary'

export function ReviewPanel({ courses }: Props) {
  const { lang, t } = useLang()
  const [view, setView] = useState<ViewState>('setup')
  const [mode, setMode] = useState<'flashcards' | 'quiz'>('flashcards')
  const [source, setSource] = useState<string>('all')
  const [deck, setDeck] = useState<ReviewDeck | null>(null)
  const [sessions, setSessions] = useState<SessionsResponse | null>(null)

  // Session state
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [reviewedCount, setReviewedCount] = useState(0)
  const [sessionStart, setSessionStart] = useState(0)

  // Summary state
  const [lastSessionResult, setLastSessionResult] = useState<{ correct: number; reviewed: number; durationSec: number; score: number } | null>(null)

  // Fetch sessions on mount (single-pass fetch — no setState-in-effect)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/student/review-sessions')
        const json: SessionsResponse = await res.json()
        if (!cancelled) setSessions(json)
      } catch (e) {
        console.error('Failed to load sessions', e)
      }
    })()
    return () => { cancelled = true }
  }, [])

  const reloadSessions = async () => {
    try {
      const res = await fetch('/api/student/review-sessions')
      const json: SessionsResponse = await res.json()
      setSessions(json)
    } catch (e) {
      console.error('Failed to load sessions', e)
    }
  }

  const startSession = async () => {
    try {
      const res = await fetch(`/api/student/review?source=${encodeURIComponent(source)}&mode=${mode}`)
      const json: ReviewDeck = await res.json()
      if (json.cards.length === 0) {
        toast.error(t('review.no_cards'))
        return
      }
      setDeck(json)
      setCurrentIdx(0)
      setFlipped(false)
      setSelectedAnswer(null)
      setSubmitted(false)
      setCorrectCount(0)
      setReviewedCount(0)
      setSessionStart(Date.now())
      setView('session')
    } catch (e) {
      toast.error('فشل تحميل البطاقات')
    }
  }

  const submitAnswer = (idx: number) => {
    if (!deck || submitted) return
    setSelectedAnswer(idx)
    setSubmitted(true)
    const card = deck.cards[currentIdx]
    if (card.correctIndex === idx) {
      setCorrectCount((c) => c + 1)
    }
    setReviewedCount((c) => c + 1)
  }

  const nextCard = () => {
    if (!deck) return
    if (currentIdx + 1 >= deck.cards.length) {
      finishSession()
      return
    }
    setCurrentIdx((i) => i + 1)
    setFlipped(false)
    setSelectedAnswer(null)
    setSubmitted(false)
  }

  const markFlashcard = (knew: boolean) => {
    if (!deck) return
    if (knew) setCorrectCount((c) => c + 1)
    setReviewedCount((c) => c + 1)
    nextCard()
  }

  const finishSession = async () => {
    if (!deck) return
    const durationSec = Math.round((Date.now() - sessionStart) / 1000)
    const score = reviewedCount > 0 ? Math.round((correctCount / reviewedCount) * 100) : 0

    try {
      await fetch('/api/student/review-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: deck.mode,
          sourceType: deck.source,
          sourceLabel: deck.sourceLabel,
          cardCount: deck.cards.length,
          correctCount,
          reviewedCount,
          durationSec,
        }),
      })
      await reloadSessions()
    } catch (e) {
      console.error('Failed to save session', e)
    }

    setLastSessionResult({ correct: correctCount, reviewed: reviewedCount, durationSec, score })
    setView('summary')
  }

  const exitSession = () => {
    if (reviewedCount > 0 && confirm(t('review.session.exit_confirm'))) {
      finishSession()
    } else {
      setView('setup')
    }
  }

  // ---------- SETUP VIEW ----------
  if (view === 'setup') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {t('review.title')}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{t('review.subtitle')}</p>
        </div>

        {/* Stats overview */}
        {sessions && sessions.stats.total > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatTile icon={<Trophy className="h-4 w-4" />} label={t('review.total_sessions')} value={sessions.stats.total.toLocaleString('ar-EG')} color="text-amber-600" />
            <StatTile icon={<Layers className="h-4 w-4" />} label={t('review.total_cards')} value={sessions.stats.totalCards.toLocaleString('ar-EG')} color="text-primary" />
            <StatTile icon={<Target className="h-4 w-4" />} label={t('review.accuracy')} value={`${sessions.stats.accuracy.toLocaleString('ar-EG')}%`} color="text-emerald-600" />
            <StatTile icon={<Clock className="h-4 w-4" />} label={t('review.total_time')} value={formatDuration(sessions.stats.totalDurationSec, lang)} color="text-purple-600" />
          </div>
        )}

        {/* Setup card */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Mode selector */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">{t('review.select_mode')}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ModeCard
                  active={mode === 'flashcards'}
                  onClick={() => setMode('flashcards')}
                  icon={<Library className="h-5 w-5" />}
                  label={t('review.mode_flashcards')}
                  desc={t('review.mode_flashcards_desc')}
                  color="border-primary"
                />
                <ModeCard
                  active={mode === 'quiz'}
                  onClick={() => setMode('quiz')}
                  icon={<Target className="h-5 w-5" />}
                  label={t('review.mode_quiz')}
                  desc={t('review.mode_quiz_desc')}
                  color="border-amber-500"
                />
              </div>
            </div>

            {/* Source selector */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">{t('review.select_source')}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                <SourcePill active={source === 'all'} onClick={() => setSource('all')} icon={<Layers className="h-3.5 w-3.5" />} label={t('review.source.all')} />
                <SourcePill active={source === 'terms'} onClick={() => setSource('terms')} icon={<Library className="h-3.5 w-3.5" />} label={t('review.source.terms')} />
                <SourcePill active={source === 'cases'} onClick={() => setSource('cases')} icon={<Scale className="h-3.5 w-3.5" />} label={t('review.source.cases')} />
                <SourcePill active={source === 'lectures'} onClick={() => setSource('lectures')} icon={<BookOpen className="h-3.5 w-3.5" />} label={t('review.source.lectures')} />
              </div>

              {/* Course picker */}
              {courses.length > 0 && (
                <div className="mt-3">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">{t('review.source.course')}</Label>
                  <Select value={source.startsWith('course:') ? source : ''} onValueChange={(v) => v && setSource(v)}>
                    <SelectTrigger className="w-full"><SelectValue placeholder={t('review.source.course')} /></SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => <SelectItem key={c.id} value={`course:${c.id}`}>{c.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Subject picker */}
              <div className="mt-3">
                <Label className="text-xs text-muted-foreground mb-1.5 block">{t('review.source.subject')}</Label>
                <Select value={source.startsWith('subject:') ? source : ''} onValueChange={(v) => v && setSource(v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t('review.source.subject')} /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => <SelectItem key={s} value={`subject:${s}`}>{t(`tcat.${s}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={startSession}>
              <Sparkles className="mx-2 h-4 w-4" />
              {t('review.start_session')}
            </Button>
          </CardContent>
        </Card>

        {/* Recent sessions */}
        {sessions && sessions.sessions.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                {t('review.recent_sessions')}
              </h3>
              <ScrollArea className="h-[260px] -mx-1 px-1 scroll-thin">
                <ul className="space-y-2">
                  {sessions.sessions.map((s) => (
                    <li key={s.id} className="flex items-center gap-3 p-2.5 rounded-md border border-border hover:bg-muted/40 transition-colors">
                      <div className={`h-9 w-9 rounded-md grid place-items-center shrink-0 ${
                        s.mode === 'flashcards' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-600'
                      }`}>
                        {s.mode === 'flashcards' ? <Library className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.sourceLabel}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {formatDate(s.date, lang)} • {s.reviewedCount.toLocaleString('ar-EG')} {t('review.summary.reviewed')}
                        </p>
                      </div>
                      {s.score !== null && (
                        <Badge variant="outline" className={`text-xs font-semibold shrink-0 ${
                          s.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
                          s.score >= 50 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
                        }`}>
                          {s.score.toLocaleString('ar-EG')}%
                        </Badge>
                      )}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // ---------- SESSION VIEW ----------
  if (view === 'session' && deck) {
    const card = deck.cards[currentIdx]
    const progress = ((currentIdx) / deck.cards.length) * 100

    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={exitSession}>
            <ChevronLeft className="h-4 w-4 me-1" />
            {t('review.session.exit')}
          </Button>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">{deck.sourceLabel}</p>
            <p className="text-sm font-medium">{t('review.session.card', { current: (currentIdx + 1).toLocaleString('ar-EG'), total: deck.cards.length.toLocaleString('ar-EG') })}</p>
          </div>
          <div className="text-end">
            <p className="text-xs text-muted-foreground">{t('review.summary.correct')}</p>
            <p className="text-sm font-semibold text-emerald-600">{correctCount.toLocaleString('ar-EG')}</p>
          </div>
        </div>

        <Progress value={progress} className="h-1.5" />

        {/* Card */}
        {mode === 'flashcards' ? (
          <FlashcardView card={card} flipped={flipped} onFlip={() => setFlipped(!flipped)} />
        ) : (
          <QuizView
            card={card}
            selectedAnswer={selectedAnswer}
            submitted={submitted}
            onSelect={submitAnswer}
          />
        )}

        {/* Action buttons */}
        <div className="flex gap-2">
          {mode === 'flashcards' && flipped && (
            <>
              <Button variant="outline" className="flex-1" onClick={() => markFlashcard(false)}>
                <XCircle className="mx-1.5 h-4 w-4 text-rose-500" />
                {t('review.session.wrong')}
              </Button>
              <Button className="flex-1" onClick={() => markFlashcard(true)}>
                <CheckCircle2 className="mx-1.5 h-4 w-4" />
                {t('review.session.correct')}
              </Button>
            </>
          )}
          {mode === 'quiz' && submitted && (
            <Button className="flex-1" onClick={nextCard}>
              {currentIdx + 1 >= deck.cards.length ? t('review.session.exit') : t('review.session.next')}
            </Button>
          )}
        </div>
      </div>
    )
  }

  // ---------- SUMMARY VIEW ----------
  if (view === 'summary' && lastSessionResult) {
    const { correct, reviewed, durationSec, score } = lastSessionResult
    const message = score >= 80 ? t('review.summary.excellent') : score >= 50 ? t('review.summary.good') : t('review.summary.needs_work')
    const emoji = score >= 80 ? '🎉' : score >= 50 ? '👍' : '💪'

    return (
      <div className="max-w-md mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center space-y-6">
            <div className="text-5xl">{emoji}</div>
            <div>
              <h2 className="text-2xl font-bold">{t('review.summary.title')}</h2>
              <p className="text-sm text-muted-foreground mt-1">{message}</p>
            </div>

            {/* Score */}
            <div className="py-4">
              <p className="text-xs text-muted-foreground mb-1">{t('review.summary.score')}</p>
              <p className={`text-5xl font-bold ${
                score >= 80 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-rose-600'
              }`}>
                {score.toLocaleString('ar-EG')}%
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <SummaryStat label={t('review.summary.correct')} value={correct.toLocaleString('ar-EG')} color="text-emerald-600" />
              <SummaryStat label={t('review.summary.reviewed')} value={reviewed.toLocaleString('ar-EG')} color="text-primary" />
              <SummaryStat label={t('review.summary.duration')} value={formatDuration(durationSec, lang)} color="text-purple-600" />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setView('setup')}>
                <ChevronLeft className="mx-1.5 h-4 w-4" />
                {t('review.summary.back_to_review')}
              </Button>
              <Button className="flex-1" onClick={() => { setView('setup'); setTimeout(startSession, 100) }}>
                <RotateCcw className="mx-1.5 h-4 w-4" />
                {t('review.summary.new_session')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}

function StatTile({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-muted-foreground">{label}</span>
          <span className={color}>{icon}</span>
        </div>
        <p className="text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}

function ModeCard({ active, onClick, icon, label, desc, color }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; desc: string; color: string }) {
  return (
    <button
      onClick={onClick}
      className={`text-start rounded-lg border-2 p-4 transition-all ${
        active ? `${color} bg-primary/5` : 'border-border hover:border-muted-foreground/30'
      }`}
    >
      <div className={`mb-2 ${active ? 'text-primary' : 'text-muted-foreground'}`}>{icon}</div>
      <p className="text-sm font-semibold mb-1">{label}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </button>
  )
}

function SourcePill({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-md border text-xs font-medium transition-all ${
        active ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-muted-foreground/30 text-muted-foreground'
      }`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  )
}

function FlashcardView({ card, flipped, onFlip }: { card: ReviewCard; flipped: boolean; onFlip: () => void }) {
  const { t } = useLang()
  return (
    <button
      onClick={onFlip}
      className="w-full text-start min-h-[280px] rounded-2xl border-2 border-border hover:border-primary/40 transition-all overflow-hidden relative group"
    >
      {/* Type badge */}
      <div className="absolute top-3 end-3 z-10">
        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
          card.type === 'term' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
          card.type === 'case' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
          'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
        }`}>
          {t(`review.type.${card.type}`)}
        </Badge>
      </div>

      {!flipped ? (
        <div className="p-8 flex flex-col items-center justify-center min-h-[280px]">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-3">{t('review.session.flip')}</p>
          <p className="text-xl font-semibold text-center leading-relaxed whitespace-pre-wrap">{card.front}</p>
          {card.hint && (
            <p className="text-xs text-muted-foreground mt-4 italic">{card.hint}</p>
          )}
        </div>
      ) : (
        <div className="p-8 flex flex-col items-center justify-center min-h-[280px] bg-primary/5">
          <p className="text-[10px] text-primary uppercase tracking-wide mb-3 font-semibold">{t('review.session.show_answer')}</p>
          <p className="text-lg text-center leading-relaxed whitespace-pre-wrap">{card.back}</p>
        </div>
      )}
    </button>
  )
}

function QuizView({ card, selectedAnswer, submitted, onSelect }: {
  card: ReviewCard
  selectedAnswer: number | null
  submitted: boolean
  onSelect: (idx: number) => void
}) {
  const { t } = useLang()
  if (!card.options || card.correctIndex === undefined) return null

  return (
    <div className="space-y-4">
      {/* Question */}
      <Card className="min-h-[140px]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
              card.type === 'term' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' :
              card.type === 'case' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' :
              'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
            }`}>
              {t(`review.type.${card.type}`)}
            </Badge>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-muted">
              {card.questionType === 'tf' ? 'صح/خطأ' : 'اختيار من متعدد'}
            </Badge>
          </div>
          <p className="text-base font-medium leading-relaxed whitespace-pre-wrap">{card.front}</p>
        </CardContent>
      </Card>

      {/* Options */}
      <div className="space-y-2">
        {card.options.map((opt, idx) => {
          const isSelected = selectedAnswer === idx
          const isCorrect = card.correctIndex === idx
          let style = 'border-border hover:border-primary/40 hover:bg-muted/40'
          if (submitted) {
            if (isCorrect) {
              style = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
            } else if (isSelected) {
              style = 'border-rose-500 bg-rose-50 dark:bg-rose-950/30'
            } else {
              style = 'border-border opacity-60'
            }
          } else if (isSelected) {
            style = 'border-primary bg-primary/5'
          }
          return (
            <button
              key={idx}
              onClick={() => !submitted && onSelect(idx)}
              disabled={submitted}
              className={`w-full text-start p-4 rounded-lg border-2 transition-all flex items-center justify-between gap-3 ${style}`}
            >
              <span className="text-sm leading-relaxed whitespace-pre-wrap">{opt}</span>
              {submitted && isCorrect && <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
              {submitted && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-rose-600 shrink-0" />}
            </button>
          )
        })}
      </div>

      {/* Feedback */}
      {submitted && (
        <div className={`rounded-lg p-3 text-sm ${
          selectedAnswer === card.correctIndex
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
        }`}>
          {selectedAnswer === card.correctIndex ? (
            <p className="font-medium flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {t('review.session.result.correct')}
            </p>
          ) : (
            <div>
              <p className="font-medium flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4" />
                {t('review.session.result.wrong')}
              </p>
              <p className="text-xs">{t('review.session.result.correct_answer')}</p>
              <p className="text-sm mt-0.5">{card.options[card.correctIndex]}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SummaryStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  )
}
