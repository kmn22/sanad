export class RequestError extends Error {
  constructor(message: string, public status = 400) {
    super(message)
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
