import { toast } from 'sonner'

interface ApiRequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  successMessage?: string
  errorMessage?: string
}

export async function apiRequest({
  url,
  method = 'GET',
  body,
  successMessage,
  errorMessage = 'Operation failed',
}: ApiRequestOptions): Promise<Response> {
  const res = await fetch(url, {
    method,
    ...(body !== undefined && {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  })
  if (!res.ok) throw new Error(`${method} ${url} failed`)
  if (successMessage) toast.success(successMessage)
  return res
}

export async function apiDelete(
  url: string,
  opts: { successMessage?: string; errorMessage?: string; onChange?: () => void }
): Promise<void> {
  try {
    await apiRequest({
      url,
      method: 'DELETE',
      successMessage: opts.successMessage,
    })
    opts.onChange?.()
  } catch {
    toast.error(opts.errorMessage ?? 'Delete failed')
  }
}

export async function apiPatch(
  url: string,
  body: unknown,
  opts: { successMessage?: string; errorMessage?: string; onChange?: () => void }
): Promise<void> {
  try {
    await apiRequest({
      url,
      method: 'PATCH',
      body,
      successMessage: opts.successMessage,
    })
    opts.onChange?.()
  } catch {
    toast.error(opts.errorMessage ?? 'Update failed')
  }
}

export async function apiPost(
  url: string,
  body: unknown,
  opts: { successMessage?: string; errorMessage?: string; onChange?: () => void }
): Promise<void> {
  try {
    await apiRequest({
      url,
      method: 'POST',
      body,
      successMessage: opts.successMessage,
    })
    opts.onChange?.()
  } catch {
    toast.error(opts.errorMessage ?? 'Create failed')
  }
}
