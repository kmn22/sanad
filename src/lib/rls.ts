import { PrismaClient } from '@prisma/client'

export interface MaqarRlsContext {
  orgId: string
  workspaceId?: string | null
  userId?: string | null
}

/**
 * Returns a Prisma client extension that wraps every query in an isolated
 * transaction assuming the `maqar_rls_tenant` (`NOBYPASSRLS`) PostgreSQL role
 * and setting `app.current_org_id`, `app.current_workspace_id`, and
 * `app.current_user_id` session variables for fail-closed Row-Level Security.
 */
export function withTenantRls(prisma: PrismaClient, ctx: MaqarRlsContext) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          const [, , result] = await prisma.$transaction([
            prisma.$executeRawUnsafe(`SET LOCAL ROLE maqar_rls_tenant`),
            prisma.$executeRaw`SELECT
              set_config('app.current_org_id', ${ctx.orgId}, true),
              set_config('app.current_workspace_id', ${ctx.workspaceId ?? ''}, true),
              set_config('app.current_user_id', ${ctx.userId ?? ''}, true)`,
            query(args),
          ])
          return result
        },
      },
    },
  })
}
