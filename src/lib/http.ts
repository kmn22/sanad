export class RequestError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
  }
}

// ---------------------------------------------------------------------------
// Cursor-based pagination
// ---------------------------------------------------------------------------

const MAX_PAGE_SIZE = 200
const DEFAULT_PAGE_SIZE = 50

/**
 * Reads `limit` and `cursor` from request URL search params and returns safe,
 * bounded values ready to pass directly into a Prisma `findMany` call.
 *
 * Response shape (returned by `paginatedResponse`):
 *   { items: T[], nextCursor: string | null, total?: number }
 *
 * Consumers pass `take: limit + 1` to Prisma, then call `paginatedResponse`.
 */
export function parsePagination(url: URL): { limit: number; cursor: string | undefined } {
  const rawLimit = Number(url.searchParams.get('limit') ?? DEFAULT_PAGE_SIZE)
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.isFinite(rawLimit) ? rawLimit : DEFAULT_PAGE_SIZE))
  const cursor = url.searchParams.get('cursor') ?? undefined
  return { limit, cursor }
}

/**
 * Builds the standard paginated envelope.
 *
 * Pass `rows` as `limit + 1` results from Prisma.  The function slices off
 * the extra row and sets `nextCursor` to the last visible item's `id`.
 */
export function paginatedResponse<T extends { id: string }>(
  rows: T[],
  limit: number,
  opts?: { total?: number }
): { items: T[]; nextCursor: string | null; total?: number } {
  const hasMore = rows.length > limit
  const items = hasMore ? rows.slice(0, limit) : rows
  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
    ...(opts?.total !== undefined ? { total: opts.total } : {}),
  }
}

export async function readJsonLimited<T = unknown>(req: Request, maxBytes = 64 * 1024): Promise<T> {
  const declared = Number(req.headers.get('content-length') || 0)
  if (declared > maxBytes) throw new RequestError('Request body is too large', 413)
  const raw = await req.text()
  if (Buffer.byteLength(raw, 'utf8') > maxBytes) throw new RequestError('Request body is too large', 413)
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new RequestError('Invalid JSON body', 400)
  }
}

export function safeErrorResponse(error: unknown) {
  if (error instanceof RequestError) {
    return Response.json({ error: error.message }, { status: error.status })
  }
  return Response.json({ error: 'Internal Server Error' }, { status: 500 })
}

/**
 * Best-effort client IP from proxy headers. Returns 'unknown' rather than ''
 * so callers can decide whether to skip IP-scoped rate limiting.
 */
export function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    req.headers.get('x-real-ip')?.trim() ||
    'unknown'
  )
}
