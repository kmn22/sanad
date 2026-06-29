import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ollamaChat, type ChatMessage } from './ollama'

describe('ollamaChat', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('sends correct request to Ollama API', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Hello world' } }],
      }),
    }
    vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse as Response)

    const messages: ChatMessage[] = [
      { role: 'user', content: 'Hi' },
    ]

    await ollamaChat(messages)

    expect(globalThis.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/v1/chat/completions'),
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const callArgs = vi.mocked(globalThis.fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]!.body as string)
    expect(body.messages).toEqual(messages)
    expect(body.model).toBeTruthy()
  })

  it('returns message content from response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'Test response' } }],
      }),
    } as Response)

    const result = await ollamaChat([{ role: 'user', content: 'test' }])
    expect(result).toBe('Test response')
  })

  it('returns empty string when no content in response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ choices: [] }),
    } as Response)

    const result = await ollamaChat([{ role: 'user', content: 'test' }])
    expect(result).toBe('')
  })

  it('includes json response_format when json option is true', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: '{"key": "value"}' } }],
      }),
    } as Response)

    await ollamaChat([{ role: 'user', content: 'test' }], { json: true })

    const callArgs = vi.mocked(globalThis.fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]!.body as string)
    expect(body.response_format).toEqual({ type: 'json_object' })
  })

  it('does not include response_format when json option is false', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'text' } }],
      }),
    } as Response)

    await ollamaChat([{ role: 'user', content: 'test' }], { json: false })

    const callArgs = vi.mocked(globalThis.fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]!.body as string)
    expect(body.response_format).toBeUndefined()
  })

  it('throws error on non-OK response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    } as Response)

    await expect(
      ollamaChat([{ role: 'user', content: 'test' }])
    ).rejects.toThrow('Ollama 500: Internal Server Error')
  })

  it('throws error on non-OK 404 response', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'Not Found',
    } as Response)

    await expect(
      ollamaChat([{ role: 'user', content: 'test' }])
    ).rejects.toThrow('Ollama 404: Not Found')
  })

  it('handles multiple messages in conversation', async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'response' } }],
      }),
    } as Response)

    const messages: ChatMessage[] = [
      { role: 'system', content: 'You are a legal assistant' },
      { role: 'user', content: 'What is a contract?' },
      { role: 'assistant', content: 'A contract is...' },
      { role: 'user', content: 'Tell me more' },
    ]

    await ollamaChat(messages)

    const callArgs = vi.mocked(globalThis.fetch).mock.calls[0]
    const body = JSON.parse(callArgs[1]!.body as string)
    expect(body.messages).toHaveLength(4)
  })
})
