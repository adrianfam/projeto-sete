import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi, adminRequest } from '@/hooks/useAdminApi'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatDate } from '@/lib/utils'
import { ApiError } from '@/lib/apiClient'

interface Submission {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: string
  created_at: string
}

type Filter = 'new' | 'read' | 'replied' | 'archived'

export function AdminContact() {
  const [filter, setFilter] = useState<Filter>('new')
  const { data, status, refetch } = useAdminApi<{ items: Submission[] }>(
    `/admin/contact?status=${filter}`,
  )
  const items = data?.items ?? []

  const setStatus = async (id: string, s: Filter) => {
    try {
      await adminRequest(`/admin/contact/${id}`, { method: 'PATCH', body: { status: s } })
      refetch()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Erro.')
    }
  }

  return (
    <>
      <Seo title="Atendimento — Projeto Sete Admin" noindex />
      <h1 className="font-serif text-3xl">Atendimento</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['new', 'read', 'replied', 'archived'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'admin-tab admin-tab-active' : 'admin-tab'}
          >
            {{ new: 'Novas', read: 'Lidas', replied: 'Respondidas', archived: 'Arquivadas' }[f]}
          </button>
        ))}
      </div>

      {status === 'loading' && <LoadingState className="py-16" />}
      {status !== 'loading' && items.length === 0 && (
        <p className="py-16 text-center text-smoke">Sem mensagens neste filtro.</p>
      )}

      {items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {items.map((m) => (
            <li key={m.id} className="card-line bg-paper p-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-medium text-ink">{m.name}</p>
                <p className="text-xs text-smoke">{formatDate(m.created_at)}</p>
              </div>
              <p className="text-xs text-smoke">{m.email}{m.phone ? ` · ${m.phone}` : ''}</p>
              {m.subject && <p className="mt-1 text-sm font-medium text-ink">{m.subject}</p>}
              <p className="mt-2 whitespace-pre-line text-sm text-smoke">{m.message}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="ghost" onClick={() => setStatus(m.id, 'read')}>
                  Marcar lida
                </Button>
                <a
                  href={`mailto:${m.email}`}
                  onClick={() => setStatus(m.id, 'replied')}
                  className="btn-outline-sm"
                >
                  Responder
                </a>
                <Button size="sm" variant="ghost" onClick={() => setStatus(m.id, 'archived')}>
                  Arquivar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
