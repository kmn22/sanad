import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getTenantDb } from '@/lib/db'
import { getAuthContext, notFoundJson, unauthorizedJson } from '@/lib/auth/workspace'
import { canWrite, denyUnless } from '@/lib/auth/capabilities'
import {
  canTransitionClmStage,
  CLM_STAGE_METADATA,
  getAllowedNextStages,
  type ClmStage,
} from '@/lib/clm/state-machine'

const STAGES: [ClmStage, ...ClmStage[]] = [
  'DRAFT',
  'INTERNAL_REVIEW',
  'AI_CLAUSE_RISK_AUDIT',
  'APPROVAL_WORKFLOW',
  'DIGITAL_SIGNATURE_DISPATCH',
  'ACTIVE',
  'ARCHIVED',
]

const transitionSchema = z.object({
  contractId: z.string().optional(),
  fromStage: z.enum(STAGES),
  toStage: z.enum(STAGES),
  riskAuditCompleted: z.boolean().optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  approverApproved: z.boolean().optional(),
  signatureEnvelopeId: z.string().optional(),
  note: z.string().max(1000).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext()
    if (!auth) return unauthorizedJson()

    const raw = await req.json()
    const parsed = transitionSchema.safeParse(raw)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid state transition request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const {
      contractId,
      fromStage,
      toStage,
      riskAuditCompleted,
      riskLevel,
      approverApproved,
      signatureEnvelopeId,
      note,
    } = parsed.data

    if (contractId) {
      const denied = denyUnless(auth, canWrite(auth))
      if (denied) return denied
    }

    const evaluation = canTransitionClmStage(fromStage, toStage, {
      actorId: auth.userId,
      actorRole: auth.role,
      riskAuditCompleted,
      riskLevel,
      approverApproved,
      signatureEnvelopeId,
      note,
    })

    if (!evaluation.allowed) {
      return NextResponse.json(
        {
          allowed: false,
          error: evaluation.reason,
          fromStage,
          toStage,
          allowedNextStages: getAllowedNextStages(fromStage),
        },
        { status: 422 }
      )
    }

    // Persist state transition strictly within the caller's Organization & Workspace
    if (contractId) {
      const tdb = getTenantDb(auth)
      const updated = await tdb.contractLifecycle.updateMany({
        where: { id: contractId, orgId: auth.orgId, workspaceId: auth.workspaceId },
        data: {
          status: evaluation.prismaStatus,
          ...(riskLevel ? { riskLevel } : {}),
        },
      })
      if (updated.count === 0) return notFoundJson()
    }

    return NextResponse.json({
      ...evaluation,
      stageMetadata: CLM_STAGE_METADATA[toStage],
      allowedNextStages: getAllowedNextStages(toStage),
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'CLM transition failed' },
      { status: 500 }
    )
  }
}

