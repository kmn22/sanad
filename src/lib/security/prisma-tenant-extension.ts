/**
 * ============================================================================
 * Maqar (مقر) Multi-Tenant Security Layer — Standardized Prisma Client Extension
 * (`src/lib/security/prisma-tenant-extension.ts`)
 * ============================================================================
 *
 * Provides automatic, fail-closed application-layer tenant isolation across all
 * 48 tenant-scoped Prisma models (`Organization`, `Dual-Scoped orgId + workspaceId`,
 * `Org-Scoped orgId`, `Hybrid Org/Public`, and `Workspace-Scoped workspaceId`).
 *
 * Security Guarantees:
 *   1. Read Isolation (`findMany`, `findFirst`, `findFirstOrThrow`, `count`,
 *      `aggregate`, `groupBy`):
 *      Wraps every `where` clause in `{ AND: [existingWhere, tenantFilter] }` so
 *      top-level `OR` filters can never escape the caller's `orgId`/`workspaceId`,
 *      and validates cursor ownership on `findMany` cursor pagination.
 *   2. Unique Lookup Guard (`findUnique`, `findUniqueOrThrow`):
 *      Pre-verifies tenant metadata ownership before hydrating payload columns or
 *      relations — returning `null` on `findUnique` (preventing IDOR leaks) and
 *      throwing `TenantIsolationViolationError` on `findUniqueOrThrow`.
 *   3. Mutation & IDOR Protection (`update`, `delete`, `updateMany`, `deleteMany`):
 *      Blocks cross-tenant `update({ where: { id } })` / `delete({ where: { id } })`
 *      and rejects any `data` payload attempting to reassign `orgId` or `workspaceId`
 *      to another tenant.
 *   4. Automatic Tenant Stamping (`create`, `createMany`, `createManyAndReturn`, `upsert`):
 *      Automatically injects `orgId` and `workspaceId` on new records and throws
 *      `TenantIsolationViolationError` if a caller supplies a mismatched tenant ID
 *      or attempts to `upsert` onto a primary/unique key owned by another tenant.
 */

import { AsyncLocalStorage } from 'node:async_hooks'
import { Prisma, PrismaClient } from '@prisma/client'
import { TenantIsolationViolationError } from '@/lib/security/tenant-guard'

export interface TenantScopeContext {
  /** Mandatory top-level Organization ID (`Organization.id`) */
  orgId: string
  /** Active Workspace ID (`Workspace.id`); required for workspace-scoped models */
  workspaceId?: string | null
  /** Optional authenticated user ID (`User.id`) for audit correlation */
  userId?: string | null
}

export type ModelScopeKind =
  | 'ORGANIZATION_SELF'
  | 'DUAL_ORG_AND_WORKSPACE'
  | 'ORG_ONLY'
  | 'ORG_OR_PUBLIC_READ'
  | 'USER_ORG_SCOPED'
  | 'WORKSPACE_ONLY'

export interface TenantModelPolicy {
  kind: ModelScopeKind
  hasOrgId: boolean
  hasWorkspaceId: boolean
  hasIsPublic?: boolean
  isOrganizationSelf?: boolean
}

/**
 * Exhaustive registry of every tenant-scoped model in `prisma/schema.prisma`.
 * Global/system-only lookup tables (`Plan`, `Subscription`, `PrivacyNotice`,
 * `VerificationToken`, `PasswordResetToken`, `AuthRateLimit`, `BillingWebhookEvent`,
 * `DailyBrief`, `WaitlistEntry`) do not store tenant operational records and are
 * governed separately by platform-admin or token-hash controls.
 */
export const TENANT_MODEL_POLICIES: Readonly<Record<string, TenantModelPolicy>> = {
  // 1. Top-level Organization row itself (`id === ctx.orgId`)
  Organization: {
    kind: 'ORGANIZATION_SELF',
    hasOrgId: false,
    hasWorkspaceId: false,
    isOrganizationSelf: true,
  },

  // 2. Dual-scoped core legal & CLM models (`orgId` NOT NULL + `workspaceId` NOT NULL)
  LegalCase: {
    kind: 'DUAL_ORG_AND_WORKSPACE',
    hasOrgId: true,
    hasWorkspaceId: true,
  },
  ContractLifecycle: {
    kind: 'DUAL_ORG_AND_WORKSPACE',
    hasOrgId: true,
    hasWorkspaceId: true,
  },
  LitigationCase: {
    kind: 'DUAL_ORG_AND_WORKSPACE',
    hasOrgId: true,
    hasWorkspaceId: true,
  },

  // 3. Organization-scoped models (`orgId` NOT NULL)
  Workspace: {
    kind: 'ORG_ONLY',
    hasOrgId: true,
    hasWorkspaceId: false,
  },
  Membership: {
    kind: 'ORG_ONLY',
    hasOrgId: true,
    hasWorkspaceId: false,
  },
  CaseSession: {
    kind: 'ORG_ONLY',
    hasOrgId: true,
    hasWorkspaceId: false,
  },
  ComplianceTracker: {
    kind: 'ORG_ONLY',
    hasOrgId: true,
    hasWorkspaceId: false,
  },
  User: {
    kind: 'USER_ORG_SCOPED',
    hasOrgId: true,
    hasWorkspaceId: true,
  },

  // 4. Hybrid Organization + Public Knowledge Hub (`orgId = ctx.orgId OR isPublic = true` on read; `orgId = ctx.orgId` on write)
  KnowledgeResearchItem: {
    kind: 'ORG_OR_PUBLIC_READ',
    hasOrgId: true,
    hasWorkspaceId: false,
    hasIsPublic: true,
  },

  // 5. Workspace-scoped operational, document, billing, portal, academic & PDPL models
  WorkspaceMembership: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  UsageMetric: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  FeatureFlag: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  BackgroundJob: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  Notification: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  Client: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  ComplianceItem: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  LegalDocument: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  WorkflowTemplate: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  Approval: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  DocumentVersion: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  Task: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  CaseAssignment: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  WorkflowEvent: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  PortalAccess: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  PortalRequest: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  PortalFile: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  TimeEntry: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  ResearchItem: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  Invoice: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  Communication: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  Course: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  Lecture: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  AcademicDeadline: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  LegalTerm: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  CaseEntry: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  ReviewSession: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  Invitation: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  AuditLog: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  DocumentSignature: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  ConsentRecord: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  DataSubjectRequest: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  RetentionPolicy: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  LegalHold: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  PrivacyIncident: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  ProcessorRegister: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  TransferAssessment: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  DataProtectionImpactAssessment: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  DataAccessEvent: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
  Feedback: { kind: 'WORKSPACE_ONLY', hasOrgId: false, hasWorkspaceId: true },
}

const tenantContextStorage = new AsyncLocalStorage<TenantScopeContext>()

/**
 * Executes `fn` within an `AsyncLocalStorage` tenant context so downstream
 * service helpers can resolve the active `orgId` and `workspaceId` automatically.
 */
export function runWithTenantContext<T>(
  ctx: TenantScopeContext,
  fn: () => T
): T {
  assertValidScopeContext(ctx)
  return tenantContextStorage.run(ctx, () => {
    const result = fn()
    if (
      result !== null &&
      (typeof result === 'object' || typeof result === 'function') &&
      typeof (result as unknown as PromiseLike<unknown>).then === 'function'
    ) {
      // Force lazy Thenables (such as PrismaPromise) to bind their .then()
      // execution while still inside the active AsyncLocalStorage store.
      return new Promise((resolve, reject) => {
        ;(result as unknown as PromiseLike<unknown>).then(resolve, reject)
      }) as unknown as T
    }
    return result
  })
}

export function getActiveTenantContext(): TenantScopeContext | undefined {
  return tenantContextStorage.getStore()
}

function assertValidScopeContext(ctx: TenantScopeContext | null | undefined): asserts ctx is TenantScopeContext {
  if (!ctx || typeof ctx.orgId !== 'string' || ctx.orgId.trim().length === 0) {
    throw new TenantIsolationViolationError(
      'رفض الوصول الأمني: معرف المنشأة (orgId) إلزامي لجميع استعلامات قاعدة البيانات المعزولة.'
    )
  }
}

function assertWorkspacePresent(model: string, ctx: TenantScopeContext): string {
  if (typeof ctx.workspaceId !== 'string' || ctx.workspaceId.trim().length === 0) {
    throw new TenantIsolationViolationError(
      `رفض الوصول الأمني: معرف مساحة العمل (workspaceId) إلزامي للنموذج (${model}).`
    )
  }
  return ctx.workspaceId
}

function modelToDelegateKey(modelName: string): string {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1)
}

function buildTenantFilter(
  modelName: string,
  policy: TenantModelPolicy,
  ctx: TenantScopeContext,
  mode: 'read' | 'write'
): Record<string, unknown> {
  switch (policy.kind) {
    case 'ORGANIZATION_SELF':
      return { id: ctx.orgId }

    case 'DUAL_ORG_AND_WORKSPACE': {
      if (ctx.workspaceId) {
        return { orgId: ctx.orgId, workspaceId: ctx.workspaceId }
      }
      return { orgId: ctx.orgId }
    }

    case 'ORG_ONLY':
    case 'USER_ORG_SCOPED':
      return { orgId: ctx.orgId }

    case 'ORG_OR_PUBLIC_READ':
      if (mode === 'read') {
        return { OR: [{ orgId: ctx.orgId }, { isPublic: true }] }
      }
      return { orgId: ctx.orgId }

    case 'WORKSPACE_ONLY': {
      const workspaceId = assertWorkspacePresent(modelName, ctx)
      return { workspaceId }
    }
  }
}

function combineWhereWithTenantFilter(
  existingWhere: Record<string, unknown> | undefined,
  tenantFilter: Record<string, unknown>
): Record<string, unknown> {
  if (!existingWhere || Object.keys(existingWhere).length === 0) {
    return { ...tenantFilter }
  }
  return {
    AND: [existingWhere, tenantFilter],
  }
}

function buildMetadataSelect(policy: TenantModelPolicy): Record<string, boolean> {
  const select: Record<string, boolean> = {}
  if (policy.isOrganizationSelf) select.id = true
  if (policy.hasOrgId) select.orgId = true
  if (policy.hasWorkspaceId) select.workspaceId = true
  if (policy.hasIsPublic) select.isPublic = true
  return select
}

function recordMatchesTenant(
  record: Record<string, unknown>,
  modelName: string,
  policy: TenantModelPolicy,
  ctx: TenantScopeContext,
  mode: 'read' | 'write'
): boolean {
  switch (policy.kind) {
    case 'ORGANIZATION_SELF':
      return record.id === ctx.orgId

    case 'DUAL_ORG_AND_WORKSPACE':
      if (record.orgId !== ctx.orgId) return false
      if (ctx.workspaceId && record.workspaceId !== ctx.workspaceId) return false
      return true

    case 'ORG_ONLY':
    case 'USER_ORG_SCOPED':
      return record.orgId === ctx.orgId

    case 'ORG_OR_PUBLIC_READ':
      if (mode === 'read') {
        return record.orgId === ctx.orgId || record.isPublic === true
      }
      return record.orgId === ctx.orgId

    case 'WORKSPACE_ONLY': {
      const workspaceId = assertWorkspacePresent(modelName, ctx)
      return record.workspaceId === workspaceId
    }
  }
}

function assertNoCrossTenantMutationFields(
  data: Record<string, unknown> | undefined,
  modelName: string,
  policy: TenantModelPolicy,
  ctx: TenantScopeContext
): void {
  if (!data || typeof data !== 'object') return

  if (policy.isOrganizationSelf && 'id' in data && data.id !== undefined && data.id !== ctx.orgId) {
    throw new TenantIsolationViolationError(
      `انتهاك عزل المستأجرين: لا يُسمح بتغيير معرف المنشأة في (${modelName}).`
    )
  }

  if (policy.hasOrgId) {
    if ('orgId' in data && data.orgId !== undefined && data.orgId !== ctx.orgId) {
      throw new TenantIsolationViolationError(
        `انتهاك عزل المستأجرين: محاولة تعيين orgId مغاير في (${modelName}).`
      )
    }
    const orgRel = data.organization as { connect?: { id?: string } } | undefined
    if (orgRel?.connect?.id && orgRel.connect.id !== ctx.orgId) {
      throw new TenantIsolationViolationError(
        `انتهاك عزل المستأجرين: محاولة ربط علاقة organization بمنشأة أخرى في (${modelName}).`
      )
    }
  }

  if (policy.hasWorkspaceId && policy.kind !== 'USER_ORG_SCOPED') {
    const expectedWs = ctx.workspaceId
    if (expectedWs) {
      if ('workspaceId' in data && data.workspaceId !== undefined && data.workspaceId !== expectedWs) {
        throw new TenantIsolationViolationError(
          `انتهاك عزل المستأجرين: محاولة تعيين workspaceId مغاير في (${modelName}).`
        )
      }
      const wsRel = data.workspace as { connect?: { id?: string } } | undefined
      if (wsRel?.connect?.id && wsRel.connect.id !== expectedWs) {
        throw new TenantIsolationViolationError(
          `انتهاك عزل المستأجرين: محاولة ربط علاقة workspace بمساحة عمل أخرى في (${modelName}).`
        )
      }
    }
  }
}

function stampTenantDataItem(
  item: Record<string, unknown>,
  modelName: string,
  policy: TenantModelPolicy,
  ctx: TenantScopeContext
): Record<string, unknown> {
  assertNoCrossTenantMutationFields(item, modelName, policy, ctx)
  const stamped: Record<string, unknown> = { ...item }

  if (policy.hasOrgId && !('organization' in stamped)) {
    stamped.orgId = ctx.orgId
  }

  if (policy.kind === 'DUAL_ORG_AND_WORKSPACE' || policy.kind === 'WORKSPACE_ONLY') {
    const workspaceId = assertWorkspacePresent(modelName, ctx)
    if (!('workspace' in stamped)) {
      stamped.workspaceId = workspaceId
    }
  } else if (policy.kind === 'USER_ORG_SCOPED' && ctx.workspaceId && !('workspace' in stamped) && stamped.workspaceId === undefined) {
    stamped.workspaceId = ctx.workspaceId
  }

  return stamped
}

const FILTERED_READ_OPS = new Set([
  'findMany',
  'findFirst',
  'findFirstOrThrow',
  'count',
  'aggregate',
  'groupBy',
])

const BULK_WRITE_OPS = new Set(['updateMany', 'deleteMany'])

/**
 * Standardized Prisma Client Extension factory that automatically injects
 * `orgId` (and `workspaceId` where applicable) into every scoped query and mutation.
 */
export function createTenantIsolationExtension(
  baseClient: PrismaClient,
  contextOrResolver: TenantScopeContext | (() => TenantScopeContext)
) {
  const resolveCtx =
    typeof contextOrResolver === 'function'
      ? contextOrResolver
      : () => contextOrResolver

  return Prisma.defineExtension({
    name: 'maqar-tenant-isolation',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const execQuery = query as (a: unknown) => Promise<unknown>
          if (!model) {
            return execQuery(args)
          }
          const policy = TENANT_MODEL_POLICIES[model]
          if (!policy) {
            return execQuery(args)
          }

          const ctx = resolveCtx()
          assertValidScopeContext(ctx)

          const mutableArgs = (args ?? {}) as Record<string, unknown>
          const delegateKey = modelToDelegateKey(model)
          const rawDelegate = (baseClient as unknown as Record<string, Record<string, (...a: unknown[]) => Promise<unknown>>>)[delegateKey]

          // 1. Multi-row & filtered reads
          if (FILTERED_READ_OPS.has(operation)) {
            if (operation === 'findMany' && mutableArgs.cursor && typeof mutableArgs.cursor === 'object') {
              const cursorMeta = (await rawDelegate.findUnique({
                where: mutableArgs.cursor,
                select: buildMetadataSelect(policy),
              })) as Record<string, unknown> | null

              if (cursorMeta && !recordMatchesTenant(cursorMeta, model, policy, ctx, 'read')) {
                throw new TenantIsolationViolationError(
                  `انتهاك عزل المستأجرين: مؤشر التصفح (cursor) يشير إلى سجل خارج نطاق المنشأة في (${model}).`
                )
              }
            }

            const readFilter = buildTenantFilter(model, policy, ctx, 'read')
            mutableArgs.where = combineWhereWithTenantFilter(
              mutableArgs.where as Record<string, unknown> | undefined,
              readFilter
            )
            return execQuery(mutableArgs)
          }

          // 2. Single-row unique reads (`findUnique`, `findUniqueOrThrow`)
          if (operation === 'findUnique' || operation === 'findUniqueOrThrow') {
            const meta = (await rawDelegate.findUnique({
              where: mutableArgs.where,
              select: buildMetadataSelect(policy),
            })) as Record<string, unknown> | null

            if (!meta) {
              if (operation === 'findUnique') return null
              return execQuery(mutableArgs)
            }

            if (!recordMatchesTenant(meta, model, policy, ctx, 'read')) {
              if (operation === 'findUnique') {
                return null
              }
              throw new TenantIsolationViolationError(
                `انتهاك عزل المستأجرين (IDOR): لا يُسمح بقراءة سجل منشأة أخرى في (${model}).`
              )
            }

            return execQuery(mutableArgs)
          }

          // 3. Bulk mutations (`updateMany`, `deleteMany`)
          if (BULK_WRITE_OPS.has(operation)) {
            if (operation === 'updateMany') {
              assertNoCrossTenantMutationFields(
                mutableArgs.data as Record<string, unknown> | undefined,
                model,
                policy,
                ctx
              )
            }
            const writeFilter = buildTenantFilter(model, policy, ctx, 'write')
            mutableArgs.where = combineWhereWithTenantFilter(
              mutableArgs.where as Record<string, unknown> | undefined,
              writeFilter
            )
            return execQuery(mutableArgs)
          }

          // 4. Single-row mutations (`update`, `delete`) — blocks IDOR via `{ where: { id } }`
          if (operation === 'update' || operation === 'delete') {
            if (operation === 'update') {
              assertNoCrossTenantMutationFields(
                mutableArgs.data as Record<string, unknown> | undefined,
                model,
                policy,
                ctx
              )
            }

            const meta = (await rawDelegate.findUnique({
              where: mutableArgs.where,
              select: buildMetadataSelect(policy),
            })) as Record<string, unknown> | null

            if (!meta) {
              return execQuery(mutableArgs)
            }

            if (!recordMatchesTenant(meta, model, policy, ctx, 'write')) {
              throw new TenantIsolationViolationError(
                `انتهاك عزل المستأجرين (IDOR): لا يُسمح بتعديل أو حذف سجل تابع لمنشأة أخرى في (${model}).`
              )
            }

            return execQuery(mutableArgs)
          }

          // 5. Creation operations (`create`, `createMany`, `createManyAndReturn`)
          if (operation === 'create') {
            mutableArgs.data = stampTenantDataItem(
              (mutableArgs.data ?? {}) as Record<string, unknown>,
              model,
              policy,
              ctx
            )
            return execQuery(mutableArgs)
          }

          if ((operation as string) === 'createMany' || (operation as string) === 'createManyAndReturn') {
            if (Array.isArray(mutableArgs.data)) {
              mutableArgs.data = mutableArgs.data.map((item) =>
                stampTenantDataItem(item as Record<string, unknown>, model, policy, ctx)
              )
            } else if (mutableArgs.data && typeof mutableArgs.data === 'object') {
              mutableArgs.data = stampTenantDataItem(
                mutableArgs.data as Record<string, unknown>,
                model,
                policy,
                ctx
              )
            }
            return execQuery(mutableArgs)
          }

          // 6. Upsert operation (`upsert`) — prevents colliding onto another tenant's unique key
          if (operation === 'upsert') {
            const existingMeta = (await rawDelegate.findUnique({
              where: mutableArgs.where,
              select: buildMetadataSelect(policy),
            })) as Record<string, unknown> | null

            if (existingMeta && !recordMatchesTenant(existingMeta, model, policy, ctx, 'write')) {
              throw new TenantIsolationViolationError(
                `انتهاك عزل المستأجرين (IDOR): لا يُسمح بعملية upsert على سجل يخص منشأة أخرى في (${model}).`
              )
            }

            mutableArgs.create = stampTenantDataItem(
              (mutableArgs.create ?? {}) as Record<string, unknown>,
              model,
              policy,
              ctx
            )
            assertNoCrossTenantMutationFields(
              mutableArgs.update as Record<string, unknown> | undefined,
              model,
              policy,
              ctx
            )
            return execQuery(mutableArgs)
          }

          return execQuery(args)
        },
      },
    },
  })
}

/**
 * Returns a Prisma client extended with automatic `orgId` & `workspaceId`
 * injection for the given `TenantScopeContext`.
 */
export function createTenantScopedPrisma(
  baseClient: PrismaClient,
  ctx: TenantScopeContext
) {
  assertValidScopeContext(ctx)
  return baseClient.$extends(createTenantIsolationExtension(baseClient, ctx))
}

/**
 * Returns a Prisma client bound to `AsyncLocalStorage` (`runWithTenantContext`),
 * failing closed with `TenantIsolationViolationError` if invoked outside an
 * active tenant request context.
 */
export function createAsyncContextTenantPrisma(baseClient: PrismaClient) {
  return baseClient.$extends(
    createTenantIsolationExtension(baseClient, () => {
      const ctx = getActiveTenantContext()
      assertValidScopeContext(ctx)
      return ctx
    })
  )
}
