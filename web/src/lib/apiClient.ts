/** Wrapper mínimo de fetch para a API Fastify. Lança em erro HTTP com {message}. */
const BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api'

export class ApiError extends Error {
  status: number
  body?: unknown
  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
  signal?: AbortSignal
}

export async function request<T = unknown>(
  path: string,
  { method = 'GET', body, token, signal }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  const isJson = res.headers.get('content-type')?.includes('application/json')
  const parsed = isJson ? await res.json().catch(() => undefined) : undefined

  if (!res.ok) {
    const message =
      (parsed && typeof parsed === 'object' && 'message' in parsed && String(parsed.message)) ||
      `Erro ${res.status}`
    throw new ApiError(message, res.status, parsed)
  }

  // 204 ou sem corpo
  if (res.status === 204) return undefined as T
  return (parsed ?? ((await res.text()) as unknown)) as T
}

/** Helper para chamadas autenticadas com token admin em memória. */
export function authRequest<T = unknown>(
  path: string,
  opts: Omit<RequestOptions, 'token'> & { token: string | null },
) {
  return request<T>(path, { ...opts, token: opts.token })
}
