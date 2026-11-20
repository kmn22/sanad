import type { ContractStatus } from '@prisma/client'

export type ClmStage =
  | 'DRAFT'
  | 'INTERNAL_REVIEW'
  | 'AI_CLAUSE_RISK_AUDIT'
  | 'APPROVAL_WORKFLOW'
  | 'DIGITAL_SIGNATURE_DISPATCH'
  | 'ACTIVE'
  | 'ARCHIVED'

export interface ClmStateMetadata {
  stage: ClmStage
  label: { ar: string; en: string }
  description: { ar: string; en: string }
  prismaStatus: ContractStatus
  requiresAuditPass?: boolean
  requiresApproverId?: boolean
  requiresSignatureEnvelopeId?: boolean
}

export interface ClmTransitionContext {
  actorId: string
  actorRole?: string
  riskAuditCompleted?: boolean
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH'
  approverApproved?: boolean
  signatureEnvelopeId?: string
  note?: string
}

export interface ClmTransitionResult {
  allowed: boolean
  fromStage: ClmStage
  toStage: ClmStage
  prismaStatus: ContractStatus
  reason?: string
  timestamp: string
}

export const CLM_STAGE_METADATA: Record<ClmStage, ClmStateMetadata> = {
  DRAFT: {
    stage: 'DRAFT',
    label: { ar: 'مسودة أولية', en: 'Draft' },
    description: {
      ar: 'إعداد المسودة التعاقدية وتحديد الأطراف والالتزامات الأساسية',
      en: 'Initial contract authoring and party obligation scoping',
    },
    prismaStatus: 'DRAFT',
  },
  INTERNAL_REVIEW: {
    stage: 'INTERNAL_REVIEW',
    label: { ar: 'المراجعة القانونية الداخلية', en: 'Internal Review' },
    description: {
      ar: 'مراجعة الإدارة القانونية لبنود العقد وتحديد نطاق الاختصاص',
      en: 'In-house legal counsel review and commercial alignment',
    },
    prismaStatus: 'LEGAL_REVIEW',
  },
  AI_CLAUSE_RISK_AUDIT: {
    stage: 'AI_CLAUSE_RISK_AUDIT',
    label: { ar: 'التدقيق الذكي لمخاطر البنود', en: 'AI Clause Risk Audit' },
    description: {
      ar: 'فحص آلي للبنود مقابل نظام المعاملات المدنية ونظام العمل وحماية البيانات',
      en: 'Automated statutory audit against Civil Transactions, Labor & PDPL laws',
    },
    prismaStatus: 'NEGOTIATION',
    requiresAuditPass: true,
  },
  APPROVAL_WORKFLOW: {
    stage: 'APPROVAL_WORKFLOW',
    label: { ar: 'سير عمل الاعتمادات والصلاحيات', en: 'Approval Workflow' },
    description: {
      ar: 'اعتماد الشريك المدير أو المستشار العام وأصحاب الصلاحية المالية',
      en: 'General Counsel, Risk Officer, and financial authority sign-off',
    },
    prismaStatus: 'APPROVED',
    requiresApproverId: true,
  },
  DIGITAL_SIGNATURE_DISPATCH: {
    stage: 'DIGITAL_SIGNATURE_DISPATCH',
    label: { ar: 'إرسال للتوقيع الرقمي الموثق', en: 'Digital Signature Dispatch' },
    description: {
      ar: 'إصدار مظروف التوقيع الإلكتروني الموثق والتحقق من هوية المفوضين',
      en: 'Cryptographic e-signature dispatch and signatory verification',
    },
    prismaStatus: 'SIGNED',
    requiresSignatureEnvelopeId: true,
  },
  ACTIVE: {
    stage: 'ACTIVE',
    label: { ar: 'سارٍ ونافذ', en: 'Active' },
    description: {
      ar: 'العقد موقع ونافذ مع تفعيل تنبيهات التجديد والالتزامات الدورية',
      en: 'Executed contract in force with SLA and renewal monitoring',
    },
    prismaStatus: 'ACTIVE',
  },
  ARCHIVED: {
    stage: 'ARCHIVED',
    label: { ar: 'مؤرشف / منتهي', en: 'Archived' },
    description: {
      ar: 'انتهاء مدة العقد أو أرشفته في السجل السيادي',
      en: 'Completed, terminated, or expired contract retained in archive',
    },
    prismaStatus: 'EXPIRED',
  },
}

/**
 * Directed graph of valid CLM state transitions:
 * Draft -> Internal Review -> AI Clause Risk Audit -> Approval Workflow -> Digital Signature Dispatch -> Active / Archived
 * (Includes controlled send-back transitions for redlining/re-drafting)
 */
export const VALID_CLM_TRANSITIONS: Record<ClmStage, readonly ClmStage[]> = {
  DRAFT: ['INTERNAL_REVIEW', 'ARCHIVED'],
  INTERNAL_REVIEW: ['AI_CLAUSE_RISK_AUDIT', 'DRAFT', 'ARCHIVED'],
  AI_CLAUSE_RISK_AUDIT: ['APPROVAL_WORKFLOW', 'INTERNAL_REVIEW', 'DRAFT'],
  APPROVAL_WORKFLOW: ['DIGITAL_SIGNATURE_DISPATCH', 'AI_CLAUSE_RISK_AUDIT', 'INTERNAL_REVIEW'],
  DIGITAL_SIGNATURE_DISPATCH: ['ACTIVE', 'ARCHIVED', 'APPROVAL_WORKFLOW'],
  ACTIVE: ['ARCHIVED'],
  ARCHIVED: [],
}

export function getAllowedNextStages(currentStage: ClmStage): readonly ClmStage[] {
  return VALID_CLM_TRANSITIONS[currentStage] ?? []
}

export function canTransitionClmStage(
  fromStage: ClmStage,
  toStage: ClmStage,
  context: ClmTransitionContext
): ClmTransitionResult {
  const timestamp = new Date().toISOString()
  const targetMeta = CLM_STAGE_METADATA[toStage]

  if (!targetMeta) {
    return {
      allowed: false,
      fromStage,
      toStage,
      prismaStatus: CLM_STAGE_METADATA[fromStage].prismaStatus,
      reason: `Unknown target stage: ${toStage}`,
      timestamp,
    }
  }

  const validTargets = VALID_CLM_TRANSITIONS[fromStage] || []
  if (!validTargets.includes(toStage)) {
    return {
      allowed: false,
      fromStage,
      toStage,
      prismaStatus: CLM_STAGE_METADATA[fromStage].prismaStatus,
      reason: `Invalid transition from ${fromStage} to ${toStage}. Allowed: [${validTargets.join(', ')}]`,
      timestamp,
    }
  }

  // Guard 1: Moving from AI_CLAUSE_RISK_AUDIT -> APPROVAL_WORKFLOW requires AI risk audit completion
  if (fromStage === 'AI_CLAUSE_RISK_AUDIT' && toStage === 'APPROVAL_WORKFLOW') {
    if (!context.riskAuditCompleted) {
      return {
        allowed: false,
        fromStage,
        toStage,
        prismaStatus: CLM_STAGE_METADATA[fromStage].prismaStatus,
        reason: 'AI Clause Risk Audit must be executed before advancing to Approval Workflow.',
        timestamp,
      }
    }
  }

  // Guard 2: Moving from APPROVAL_WORKFLOW -> DIGITAL_SIGNATURE_DISPATCH requires approval sign-off
  if (fromStage === 'APPROVAL_WORKFLOW' && toStage === 'DIGITAL_SIGNATURE_DISPATCH') {
    if (!context.approverApproved) {
      return {
        allowed: false,
        fromStage,
        toStage,
        prismaStatus: CLM_STAGE_METADATA[fromStage].prismaStatus,
        reason: 'Authorized legal/executive approval is required before dispatching for digital signature.',
        timestamp,
      }
    }
  }

  // Guard 3: Moving from DIGITAL_SIGNATURE_DISPATCH -> ACTIVE requires a signature envelope reference
  if (fromStage === 'DIGITAL_SIGNATURE_DISPATCH' && toStage === 'ACTIVE') {
    if (!context.signatureEnvelopeId) {
      return {
        allowed: false,
        fromStage,
        toStage,
        prismaStatus: CLM_STAGE_METADATA[fromStage].prismaStatus,
        reason: 'Verified digital signature envelope ID is required to activate the contract.',
        timestamp,
      }
    }
  }

  return {
    allowed: true,
    fromStage,
    toStage,
    prismaStatus: targetMeta.prismaStatus,
    timestamp,
  }
}

