'use client'

import { useState, useEffect, useRef } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Search, Users, Gavel, FileText, Receipt, MessageSquare,
  CheckSquare, ShieldAlert, Library, Scale, Plus, ArrowRight,
  LayoutDashboard, Calendar, Clock,
} from 'lucide-react'
import { useLang } from '@/lib/sanad/i18n'

interface SearchResult {
  type: string
  id: string
  title: string
  subtitle: string
  view: string
}

interface CommandAction {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  shortcut?: string
  group: 'navigate' | 'create' | 'mode'
}

interface Props {
  open: boolean
  onOpenChange: (v: boolean) => void
  onNavigate: (view: string, refId?: string) => void
  onCreate: (entity: string) => void
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  client: Users,
  case: Gavel,
  document: FileText,
  invoice: Receipt,
  communication: MessageSquare,
  task: CheckSquare,
  compliance: ShieldAlert,
  term: Library,
  casebook: Scale,
}

const TYPE_COLORS: Record<string, string> = {
  client: 'text-emerald-600',
  case: 'text-amber-600',
  document: 'text-purple-600',
  invoice: 'text-cyan-600',
  communication: 'text-blue-600',
  task: 'text-slate-600',
  compliance: 'text-rose-600',
  term: 'text-emerald-600',
  casebook: 'text-amber-600',
}

export function CommandPalette({ open, onOpenChange, onNavigate, onCreate }: Props) {
  const { t } = useLang()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('')
      setResults([])
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Debounced search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current)
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    setLoading(true)
    searchTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const json = await res.json()
        setResults(json.results || [])
        setSelectedIndex(0)
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 200)
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current)
    }
  }, [query])

  // Navigation actions
  const navActions: CommandAction[] = [
    { id: 'nav-dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, action: () => onNavigate('dashboard'), group: 'navigate' },
    { id: 'nav-clients', label: t('nav.clients'), icon: Users, action: () => onNavigate('clients'), group: 'navigate' },
    { id: 'nav-cases', label: t('nav.cases'), icon: Gavel, action: () => onNavigate('cases'), group: 'navigate' },
    { id: 'nav-communications', label: t('nav.communications'), icon: MessageSquare, action: () => onNavigate('communications'), group: 'navigate' },
    { id: 'nav-documents', label: t('nav.documents'), icon: FileText, action: () => onNavigate('documents'), group: 'navigate' },
    { id: 'nav-invoices', label: t('nav.invoices'), icon: Receipt, action: () => onNavigate('invoices'), group: 'navigate' },
    { id: 'nav-compliance', label: t('nav.compliance'), icon: ShieldAlert, action: () => onNavigate('compliance'), group: 'navigate' },
    { id: 'nav-tasks', label: t('nav.tasks'), icon: CheckSquare, action: () => onNavigate('tasks'), group: 'navigate' },
    { id: 'nav-deepwork', label: t('nav.deepwork'), icon: Clock, action: () => onNavigate('deepwork'), group: 'navigate' },
    { id: 'nav-calendar', label: t('nav.calendar'), icon: Calendar, action: () => onNavigate('calendar'), group: 'navigate' },
  ]

  const createActions: CommandAction[] = [
    { id: 'create-client', label: t('clients.add'), icon: Plus, action: () => { onNavigate('clients'); onCreate('client') }, group: 'create' },
    { id: 'create-case', label: t('cases.new'), icon: Plus, action: () => { onNavigate('cases'); onCreate('case') }, group: 'create' },
    { id: 'create-task', label: t('tasks.new'), icon: Plus, action: () => { onNavigate('tasks'); onCreate('task') }, group: 'create' },
    { id: 'create-doc', label: t('docs.add'), icon: Plus, action: () => { onNavigate('documents'); onCreate('document') }, group: 'create' },
    { id: 'create-invoice', label: t('invoices.add'), icon: Plus, action: () => { onNavigate('invoices'); onCreate('invoice') }, group: 'create' },
    { id: 'create-comm', label: t('comms.add'), icon: Plus, action: () => { onNavigate('communications'); onCreate('communication') }, group: 'create' },
  ]

  // Build the full list to display
  const showSearch = query.trim().length >= 2
  const allItems = showSearch
    ? results.map((r, i) => ({
        id: `search-${r.id}`,
        label: r.title,
        subtitle: r.subtitle,
        icon: TYPE_ICONS[r.type] || Search,
        iconColor: TYPE_COLORS[r.type] || 'text-muted-foreground',
        type: r.type,
        action: () => {
          onNavigate(r.view, r.id)
          onOpenChange(false)
        },
        group: 'search',
      }))
    : [
        ...navActions.map((a) => ({ ...a, subtitle: '', iconColor: 'text-primary', type: 'nav' })),
        ...createActions.map((a) => ({ ...a, subtitle: '', iconColor: 'text-emerald-600', type: 'create' })),
      ]

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = allItems[selectedIndex]
      if (item) {
        item.action()
        onOpenChange(false)
      }
    } else if (e.key === 'Escape') {
      onOpenChange(false)
    }
  }

  // Group items for display
  const groups: Record<string, typeof allItems> = {}
  allItems.forEach((item) => {
    const g = item.group
    if (!groups[g]) groups[g] = []
    groups[g].push(item)
  })

  const groupLabels: Record<string, string> = {
    search: t('dash.view_all'),
    navigate: t('nav.dashboard'),
    create: t('common.add'),
  }

  let runningIndex = 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-2xl overflow-hidden" onKeyDown={handleKeyDown}>
        <DialogTitle className="sr-only">{t('dash.view_all')}</DialogTitle>
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('terms.search') + '... — ' + t('nav.dashboard') + ', ' + t('nav.clients') + ', ' + t('nav.cases') + '...'}
            className="border-0 focus-visible:ring-0 px-0 h-7 text-sm"
          />
          <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        {/* Results */}
        <ScrollArea className="h-[400px]">
          {allItems.length === 0 && showSearch && !loading && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
              {t('terms.no_results')}
            </div>
          )}
          {loading && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <div className="h-6 w-6 mx-auto mb-2 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {Object.entries(groups).map(([groupKey, items]) => (
            <div key={groupKey}>
              <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/30">
                {groupLabels[groupKey] || groupKey}
              </div>
              {items.map((item) => {
                const idx = runningIndex++
                const Icon = item.icon
                const isSelected = idx === selectedIndex
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action()
                      onOpenChange(false)
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-start transition-colors ${
                      isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${item.iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.label}</p>
                      {item.subtitle && (
                        <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                      )}
                    </div>
                    {isSelected && <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />}
                  </button>
                )
              })}
            </div>
          ))}
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-muted px-1 rounded font-mono">↑↓</kbd>
              {t('dash.view_all')}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-muted px-1 rounded font-mono">↵</kbd>
              {t('common.add')}
            </span>
          </div>
          <span>{allItems.length.toLocaleString('ar-EG')} {t('cal.events_count', { n: allItems.length })}</span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
