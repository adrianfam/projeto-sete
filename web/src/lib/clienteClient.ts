import { useEffect, useState } from 'react'
import { request, ApiError } from '@/lib/apiClient'
import { getAdminToken } from '@/lib/adminToken'

/**
 * Chamadas às rotas /api/cliente/*. A sessão Supabase (access_token) é a
 * mesma para admin e cliente — reutilizamos o holder em memória.
 */
export async function clienteRequest<T = unknown>(
  path: string,
  opts: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown } = {},
): Promise<T> {
  const token = getAdminToken()
  if (!token) throw new ApiError('Sessão expirada. Faça login novamente.', 401)
  return request<T>(path, { ...opts, token })
}

type Status = 'idle' | 'loading' | 'success' | 'error' | 'unauth'

interface State<T> {
  data: T | null
  status: Status
  error: string | null
}
interface Slice<T> extends State<T> {
  refetch: () => void
}

/** Fetch autenticado para rotas /api/cliente*. */
export function useClienteApi<T>(path: string): Slice<T> {
  const [state, setState] = useState<State<T>>({ data: null, status: 'idle', error: null })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let alive = true
    const token = getAdminToken()
    if (!token) {
      setState({ data: null, status: 'unauth', error: 'Sessão expirada. Faça login novamente.' })
      return
    }
    setState((s) => ({ ...s, status: 'loading' }))
    request<T>(path, { token })
      .then((data) => alive && setState({ data, status: 'success', error: null }))
      .catch((e: unknown) => {
        if (!alive) return
        const ae = e as ApiError
        if (ae?.status === 401) setState({ data: null, status: 'unauth', error: 'Sessão expirada.' })
        else
          setState({
            data: null,
            status: 'error',
            error: e instanceof ApiError ? e.message : 'Falha ao carregar.',
          })
      })
    return () => {
      alive = false
    }
  }, [path, nonce])

  return { ...state, refetch: () => setNonce((n) => n + 1) }
}
