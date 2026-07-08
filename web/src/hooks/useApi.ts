import { useEffect, useState } from 'react'
import { request, ApiError } from '@/lib/apiClient'

type Status = 'idle' | 'loading' | 'success' | 'error'

interface State<T> {
  data: T | null
  status: Status
  error: string | null
}

/** Hook genérico de fetch para a API. Fetch em mount; erro fica em state. */
export function useApi<T>(path: string): State<T> & { refetch: () => void } {
  const [state, setState] = useState<State<T>>({ data: null, status: 'idle', error: null })
  const [nonce, setNonce] = useState(0)

  useEffect(() => {
    let alive = true
    setState((s) => ({ ...s, status: 'loading' }))
    request<T>(path)
      .then((data) => alive && setState({ data, status: 'success', error: null }))
      .catch((e: unknown) => {
        if (!alive) return
        const msg = e instanceof ApiError ? e.message : 'Falha ao carregar.'
        setState({ data: null, status: 'error', error: msg })
      })
    return () => {
      alive = false
    }
  }, [path, nonce])

  return { ...state, refetch: () => setNonce((n) => n + 1) }
}
