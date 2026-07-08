import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi, adminRequest } from '@/hooks/useAdminApi'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatDate } from '@/lib/utils'
import type { CommentStatus } from '@projeto-sete/shared'

interface AdminComment {
  id: string
  blog_post_id: string
  author_name: string
  author_email: string
  body: string
  status: CommentStatus
  created_at: string
}

type Filter = 'pending' | 'approved' | 'rejected' | 'spam'

export function AdminComments() {
  const [filter, setFilter] = useState<Filter>('pending')
  const path = `/admin/comments?status=${filter}`
  const { data, status, refetch } = useAdminApi<{ items: AdminComment[] }>(path)
  const [busyId, setBusyId] = useState<string | null>(null)
  const items = data?.items ?? []

  const moderate = async (id: string, action: CommentStatus | 'delete') => {
    setBusyId(id)
    try {
      if (action === 'delete') {
        await adminRequest(`/admin/comments/${id}`, { method: 'DELETE' })
      } else {
        await adminRequest(`/admin/comments/${id}`, { method: 'PATCH', body: { status: action } })
      }
      refetch()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao moderar.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <Seo title="Comentários — Projeto Sete Admin" noindex />
      <h1 className="font-serif text-3xl">Comentários</h1>
      <p className="mt-2 text-smoke">Moderar comentários dos artigos.</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(['pending', 'approved', 'rejected', 'spam'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={
              'border px-3 py-1 text-sm ' +
              (filter === f ? 'border-brass bg-brass text-charcoal' : 'border-mist/60 text-smoke')
            }
          >
            {labelOf(f)}
          </button>
        ))}
      </div>

      {status === 'loading' && <LoadingState className="py-16" />}
      {status !== 'loading' && items.length === 0 && (
        <p className="py-16 text-center text-smoke">Sem comentários neste filtro.</p>
      )}

      {items.length > 0 && (
        <ul className="mt-6 space-y-4">
          {items.map((c) => (
            <li key={c.id} className="card-line rounded bg-paper p-5">
              <div className="flex items-baseline justify-between gap-4">
                <p className="font-medium text-ink">{c.author_name}</p>
                <p className="text-xs text-smoke">{formatDate(c.created_at)}</p>
              </div>
              <p className="text-xs text-smoke">{c.author_email}</p>
              <p className="mt-3 whitespace-pre-line text-sm text-ink">{c.body}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                <ActBtn
                  onClick={() => moderate(c.id, 'approved')}
                  disabled={busyId === c.id}
                  tone="success"
                >
                  Aprovar
                </ActBtn>
                <ActBtn
                  onClick={() => moderate(c.id, 'rejected')}
                  disabled={busyId === c.id}
                  tone="muted"
                >
                  Rejeitar
                </ActBtn>
                <ActBtn
                  onClick={() => moderate(c.id, 'spam')}
                  disabled={busyId === c.id}
                  tone="muted"
                >
                  Spam
                </ActBtn>
                <ActBtn
                  onClick={() => moderate(c.id, 'delete')}
                  disabled={busyId === c.id}
                  tone="danger"
                >
                  Excluir
                </ActBtn>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function labelOf(f: Filter) {
  return { pending: 'Pendentes', approved: 'Aprovados', rejected: 'Rejeitados', spam: 'Spam' }[f]
}

function ActBtn({
  children,
  onClick,
  disabled,
  tone,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  tone: 'success' | 'muted' | 'danger'
}) {
  const base =
    'border px-3 py-1 text-xs transition-colors disabled:opacity-50 ' +
    {
      success: 'border-success/50 text-success hover:bg-success/10',
      muted: 'border-mist/60 text-smoke hover:border-ink',
      danger: 'border-error/50 text-error hover:bg-error/10',
    }[tone]
  return (
    <button onClick={onClick} disabled={disabled} className={base}>
      {children}
    </button>
  )
}
