import { ApiError } from './apiClient'

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? '/api'

export interface PontoRequestOpts {
  method?: 'GET' | 'POST'
  body?: unknown
  /** Token enviado como Authorization: Bearer. */
  token?: string
}

/**
 * Faz uma requisição às rotas públicas do Ponto Eletrônico (/ponto/*).
 *
 * @param path  Caminho relativo, ex: "/ponto/login"
 * @param opts  Opções de requisição (method, body, token)
 * @param empId Se informado, envia o header X-Employee-Id
 */
export async function pontoRequest<T = unknown>(
  path: string,
  opts: PontoRequestOpts = {},
  empId?: string,
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`
  if (empId) headers['X-Employee-Id'] = empId
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })

  if (!res.ok) {
    const msg = res.headers.get('content-type')?.includes('application/json')
      ? (await res.json().catch(() => ({ message: `Erro ${res.status}` }))).message
      : `Erro ${res.status}`
    throw new ApiError(msg, res.status)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}
