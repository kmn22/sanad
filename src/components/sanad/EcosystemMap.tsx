'use client'

import { useLang } from '@/lib/sanad/i18n'
import { Button } from '@/components/ui/button'
import {
  Network,
  Scale,
  User,
  GraduationCap,
  Shield,
  ArrowLeft,
  ArrowRight,
  X,
} from 'lucide-react'
import {
  ECOSYSTEM_NODES,
  ECOSYSTEM_EDGES,
  ECOSYSTEM_WORKFLOWS,
  personaColorForNode,
  type EcosystemEntity,
} from '@/lib/sanad/types'

const iconMap = {
  scale: Scale,
  user: User,
  graduationCap: GraduationCap,
  shield: Shield,
} as const

export function EcosystemMap({ onClose }: { onClose?: () => void }) {
  const { lang, t } = useLang()
  const isRTL = lang === 'ar'
  const Arrow = isRTL ? ArrowLeft : ArrowRight

  return (
    <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 space-y-8 shadow-xs" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{isRTL ? 'خريطة الربط البيئي' : 'Ecosystem Wireframe'}</h2>
            <p className="text-xs text-muted-foreground">{isRTL ? 'تدفق الخدمات بين الأطراف' : 'Cross-entity workflow map'}</p>
          </div>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Nodes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {ECOSYSTEM_NODES.map((node) => {
          const Icon = iconMap[node.icon]
          const color = personaColorForNode(node.id)
          return (
            <div
              key={node.id}
              className={`rounded-2xl border p-5 flex flex-col items-center text-center gap-3 ${color}`}
            >
              <div className="w-12 h-12 rounded-2xl bg-background/80 border border-current/30 flex items-center justify-center">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold">{isRTL ? node.labelAr : node.labelEn}</p>
                <p className="text-[10px] uppercase tracking-wider font-semibold mt-1">{node.id}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Edges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {ECOSYSTEM_EDGES.map((edge, idx) => {
          const fromNode = ECOSYSTEM_NODES.find((n) => n.id === edge.from)
          const toNode = ECOSYSTEM_NODES.find((n) => n.id === edge.to)
          return (
            <div key={idx} className="rounded-xl bg-muted/40 border border-border p-4 flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{edge.label}</p>
                <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                  <span>{fromNode ? (isRTL ? fromNode.labelAr : fromNode.labelEn) : edge.from}</span>
                  <Arrow className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                  <span>{toNode ? (isRTL ? toNode.labelAr : toNode.labelEn) : edge.to}</span>
                </p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-900 dark:text-emerald-200 bg-emerald-500/15 rounded-md px-2 py-1 font-semibold">
                {edge.workflow}
              </span>
            </div>
          )
        })}
      </div>

      {/* Workflows */}
      <div className="border-t border-border pt-6 space-y-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Arrow className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          {isRTL ? 'تيارات العمل الرئيسية' : 'Key Workflow Streams'}
        </h3>
        {ECOSYSTEM_WORKFLOWS.map((workflow) => (
          <div key={workflow.id} className="rounded-xl bg-muted/40 border border-border p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">{workflow.trigger}</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                {workflow.source} → {workflow.target}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{workflow.result}</p>
            <div className="flex flex-wrap gap-1.5">
              {workflow.channels.map((channel) => (
                <span key={channel} className="text-[10px] rounded-full bg-background border border-border px-2 py-0.5 text-foreground">
                  {channel}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
