/**
 * Structured observability: request IDs, JSON log lines, and error capture.
 *
 * - `getRequestId` resolves the per-request correlation ID. `src/proxy.ts`
 *   injects `x-request-id` into every API request, so handlers always see one;
 *   callers outside the proxy path (tests, jobs) get a fresh UUID.
 * - `logEvent` / `logError` emit single-line JSON to stdout/stderr so container
 *   log collectors can index fields without parsing free text.
 * - `captureException` forwards errors to Sentry when SENTRY_DSN is configured
 *   and `@sentry/nextjs` is installed — no code changes needed to enable it.
 *   Without it, the structured log line above remains the sink.
 *
 * Never log secrets, tokens, or personal data — pass only identifiers.
 */

export type LogContext = {
  requestId?: string
  /** The request being handled — used to resolve requestId; never serialized. */
  req?: Request
  route?: string
  workspaceId?: string
  userId?: string
  action?: string
  msg?: string
  [key: string]: unknown
}

const REDACTED_KEYS = new Set(['password', 'token', 'secret', 'authorization', 'cookie'])

function sanitizeContext(ctx: LogContext): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(ctx)) {
    if (value === undefined) continue
    out[key] = REDACTED_KEYS.has(key.toLowerCase()) ? '[redacted]' : value
  }
  return out
}

export function getRequestId(req?: Request | { headers: Headers } | null): string {
  const incoming = req?.headers?.get('x-request-id')
  return incoming && incoming.length <= 128 ? incoming : crypto.randomUUID()
}

export function logEvent(level: 'info' | 'warn' | 'error', msg: string, ctx: LogContext = {}) {
  const line = {
    ts: new Date().toISOString(),
    level,
    msg,
    ...sanitizeContext(ctx),
  }
  const serialized = JSON.stringify(line)
  if (level === 'error') console.error(serialized)
  else if (level === 'warn') console.warn(serialized)
  else console.log(serialized)
}

export function logError(error: unknown, ctx: LogContext = {}) {
  const { req, requestId, msg, ...rest } = ctx
  const err = error instanceof Error ? error : new Error(String(error))
  logEvent('error', msg ?? err.message, {
    requestId: requestId ?? getRequestId(req),
    ...rest,
    errName: err.name,
    errMessage: err.message,
    stack: err.stack,
  })
}

/**
 * Env-gated error reporting. Always emits a structured log line; when
 * SENTRY_DSN is set, additionally forwards to Sentry if the SDK is present.
 */
export async function captureException(error: unknown, ctx: LogContext = {}) {
  logError(error, ctx)
  if (!process.env.SENTRY_DSN) return
  try {
    const spec = '@sentry/nextjs'
    const mod: { captureException?: (e: unknown, o?: { extra?: LogContext }) => void } =
      await import(/* webpackIgnore: true */ spec)
    mod?.captureException?.(error, { extra: ctx })
  } catch {
    // Sentry SDK not installed — the structured log line is the fallback.
  }
}
