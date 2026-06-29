const OLLAMA_URL = process.env.OLLAMA_URL || 'http://host.docker.internal:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:14b'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * Saudi-legal-grounded system prompts. Keep specific so the model returns
 * citation-ready Arabic without flowery preambles.
 */
export const SAUDI_PROMPTS = {
  draft:
    'أنت محامٍ سعودي محترف. اكتب المستند المطلوب بصياغة قانونية سعودية دقيقة. ' +
    'اعتمد على: نظام المعاملات المدنية (المرسوم م/191)، نظام العمل السعودي، ونظام الشركات. ' +
    'استخدم Markdown نظيف. ابدأ مباشرة بعنوان المستند بدون أي مقدمات أو شروحات.',
  analyze:
    'You are a Saudi legal auditor. Analyze the document and respond with strict JSON only — no markdown, no prose. ' +
    'Ground analysis in: Saudi Civil Transactions Law (Royal Decree M/191), Labor Law, Companies Law. ' +
    'Flag missing standard clauses and cite the relevant statute in the description when possible.',
  cards:
    'أنت أستاذ قانون سعودي. استخرج المصطلحات القانونية من النص بدقة. أعد JSON فقط بدون شرح أو Markdown. ' +
    'اربط كل مصطلح بمصدره النظامي السعودي (نظام المعاملات المدنية، نظام العمل، إلخ) عند الإمكان.',
  search:
    'أنت مساعد قانوني سعودي. أجب باختصار ووضوح بالعربية الفصحى. ' +
    'إذا كان السؤال يتعلق بنظام أو مادة، اذكر النظام والمادة. لا تخترع مراجع.',
} as const

export async function ollamaChat(messages: ChatMessage[], opts: { json?: boolean } = {}): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      messages,
      ...(opts.json ? { response_format: { type: 'json_object' } } : {}),
    }),
    signal: AbortSignal.timeout(120_000),
  })
  if (!res.ok) {
    throw new Error(`Ollama ${res.status}: ${await res.text()}`)
  }
  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
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
      messages,
      stream: true,
    }),
    signal: AbortSignal.timeout(180_000),
  })
  if (!res.ok || !res.body) {
    throw new Error(`Ollama stream ${res.status}: ${await res.text().catch(() => '')}`)
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
        const chunk = obj?.message?.content
        if (chunk) yield chunk
        if (obj?.done) return
      } catch {
        // tolerate partial lines
      }
    }
  }
}
