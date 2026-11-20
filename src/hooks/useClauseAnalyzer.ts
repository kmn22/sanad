'use client'

import { useCallback, useState } from 'react'
import type { ContractRiskAuditReport } from '@/lib/clm/clause-analyzer'
import type { ClmStage, ClmTransitionResult } from '@/lib/clm/state-machine'

export function useClauseAnalyzer() {
  const [report, setReport] = useState<ContractRiskAuditReport | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeContract = useCallback(
    async (contractText: string, enableLlmEnrichment = false) => {
      if (!contractText || contractText.trim().length < 10) {
        setError('يرجى إدخال نص تعاقدي كافٍ للفحص (10 أحرف على الأقل)')
        return null
      }
      setAnalyzing(true)
      setError(null)
      try {
        const res = await fetch('/api/clm/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractText, enableLlmEnrichment }),
        })
        const json = await res.json()
        if (!res.ok) {
          throw new Error(json.error || 'Clause audit failed')
        }
        setReport(json as ContractRiskAuditReport)
        return json as ContractRiskAuditReport
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Clause audit error'
        setError(msg)
        return null
      } finally {
        setAnalyzing(false)
      }
    },
    []
  )

  return {
    report,
    analyzing,
    error,
    analyzeContract,
    resetReport: () => setReport(null),
  }
}

export function useClmStateMachine(initialStage: ClmStage = 'DRAFT') {
  const [stage, setStage] = useState<ClmStage>(initialStage)
  const [transitioning, setTransitioning] = useState(false)
  const [lastTransition, setLastTransition] = useState<ClmTransitionResult | null>(null)
  const [transitionError, setTransitionError] = useState<string | null>(null)

  const transitionTo = useCallback(
    async (
      toStage: ClmStage,
      options?: {
        contractId?: string
        riskAuditCompleted?: boolean
        riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
        approverApproved?: boolean
        signatureEnvelopeId?: string
        note?: string
      }
    ) => {
      setTransitioning(true)
      setTransitionError(null)
      try {
        const res = await fetch('/api/clm/transition', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromStage: stage,
            toStage,
            ...options,
          }),
        })
        const json = await res.json()
        if (!res.ok || !json.allowed) {
          throw new Error(json.error || 'Transition rejected by CLM State Machine')
        }
        setStage(toStage)
        setLastTransition(json as ClmTransitionResult)
        return json as ClmTransitionResult
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Transition failed'
        setTransitionError(msg)
        return null
      } finally {
        setTransitioning(false)
      }
    },
    [stage]
  )

  return {
    stage,
    setStage,
    transitioning,
    lastTransition,
    transitionError,
    transitionTo,
  }
}

