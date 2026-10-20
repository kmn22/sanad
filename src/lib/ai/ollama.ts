export const OLLAMA_URL = process.env.OLLAMA_URL || 'http://host.docker.internal:11434'
export const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3-coder:30b'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Strip any stray CJK / Kana / Thai tokens that multilingual models occasionally emit.
function stripForeignNoise(text: string): string {
  return text.replace(/[\u0e00-\u0e7f\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]+/g, '')
}

/**
 * Saudi-legal-grounded system prompts. Keep specific so the model returns
 * citation-ready Arabic without flowery preambles.
 */
export const SAUDI_PROMPTS = {
  draft:
    'أنت محامٍ سعودي محترف. اكتب المستند المطلوب باللغة العربية الفصحى فقط وبصياغة قانونية سعودية دقيقة (يُمنع استخدام أي لغة أخرى أو حروف غير عربية). ' +
    'اعتمد على: نظام المعاملات المدنية (المرسوم م/191)، نظام العمل السعودي، ونظام الشركات. ' +
    'استخدم Markdown نظيف. ابدأ مباشرة بعنوان المستند بدون أي مقدمات أو شروحات.',
  analyze:
    'أنت مدقق ومستشار قانوني سعودي. حلل المستند وأعد JSON فقط باللغة العربية الفصحى — بدون أي نص إضافي أو حروف غير عربية. ' +
    'اعتمد على نظام المعاملات المدنية، نظام العمل، ونظام الشركات.',
  cards:
    'أنت أستاذ قانون سعودي. استخرج المصطلحات القانونية من النص بدقة باللغة العربية الفصحى فقط. أعد JSON فقط بدون شرح أو Markdown. ' +
    'اربط كل مصطلح بمصدره النظامي السعودي (نظام المعاملات المدنية، نظام العمل، إلخ) عند الإمكان.',
  search:
    'أنت مساعد قانوني سعودي. أجب باختصار ووضوح باللغة العربية الفصحى فقط. ' +
    'إذا كان السؤال يتعلق بنظام أو مادة، اذكر النظام والمادة. لا تخترع مراجع.',
} as const

export async function ollamaChat(
  messages: ChatMessage[],
  opts: { json?: boolean; timeoutMs?: number } = {},
): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      stream: false,
      keep_alive: '24h',
      options: { temperature: 0.2, num_ctx: 4096 },
      ...(opts.json ? { format: 'json' } : {}),
    }),
    signal: AbortSignal.timeout(opts.timeoutMs ?? 120_000),
  })
  if (!res.ok) {
    throw new Error(`Ollama request failed with status ${res.status}`)
  }
  const data = await res.json()
  const content = data?.message?.content ?? data?.choices?.[0]?.message?.content ?? ''
  return stripForeignNoise(content)
}

/**
 * Streaming chat. Returns an async iterable of token chunks suitable for SSE.
 * Uses Ollama's native /api/chat with stream:true (NDJSON, one JSON per line).
 */
export async function* ollamaChatStream(messages: ChatMessage[]): AsyncGenerator<string, void, void> {
  const res = await fetch(`${OLLAMA_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      keep_alive: '24h',
      options: { temperature: 0.2, num_ctx: 4096 },
      messages,
      stream: true,
    }),
    signal: AbortSignal.timeout(180_000),
  })
  if (!res.ok || !res.body) {
    throw new Error(`Ollama stream failed with status ${res.status}`)
  }
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue
      try {
        const obj = JSON.parse(trimmed)
        const chunk = stripForeignNoise(obj?.message?.content ?? '')
        if (chunk) yield chunk
        if (obj?.done) return
      } catch {
        // tolerate partial lines
      }
    }
  }
}
