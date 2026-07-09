import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi, adminRequest } from '@/hooks/useAdminApi'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'

interface CaseRow {
  id: string
  title: string
  slug: string
  category: string | null
  cover_image_url: string | null
  is_published: boolean
  featured: boolean
  published_at: string | null
  updated_at: string | null
}

export function AdminCases() {
  const { data, status, refetch } = useAdminApi<{ items: CaseRow[] }>(
    '/admin/cases?limit=100',
  )
  const items = data?.items ?? []

  const destroy = async (id: string) => {
    if (!confirm('Excluir este estudo de caso? Esta ação não pode ser desfeita.')) return
    try {
      await adminRequest(`/cases/${id}`, { method: 'DELETE' })
      refetch()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir.')
    }
  }

  return (
    <>
      <Seo title="Estudos de Caso — Projeto Sete Admin" noindex />
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Estudos de Caso</h1>
        <Button to="/admin/cases/new" variant="primary" size="sm">
          Novo estudo
        </Button>
      </div>

      {status === 'loading' && <LoadingState className="py-16" />}
      {status !== 'loading' && items.length === 0 && (
        <p className="py-16 text-center text-smoke">Nenhum estudo de caso. Crie o primeiro.</p>
      )}

      {items.length > 0 && (
        <ul className="mt-6 divide-y divide-mist/40 border border-mist/40">
          {items.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex min-w-0 items-center gap-4">
                {c.cover_image_url && (
                  <img
                    src={c.cover_image_url}
                    alt=""
                    className="h-12 w-20 shrink-0 border border-mist/40 object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{c.title}</p>
                  <p className="text-xs text-smoke">
                    /cases/{c.slug} · {c.category ?? '—'}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={
                    'px-2 py-1 text-xs ' +
                    (c.is_published
                      ? 'border border-success/50 text-success'
                      : 'border border-mist/60 text-smoke')
                  }
                >
                  {c.is_published ? 'Publicado' : 'Rascunho'}
                </span>
                {c.featured && (
                  <span className="border border-brass/50 px-2 py-1 text-xs text-brass">
                    Destaque
                  </span>
                )}
                <Link
                  to={`/admin/cases/${c.id}`}
                  className="text-sm text-brass link-underline"
                >
                  Editar
                </Link>
                <button
                  onClick={() => destroy(c.id)}
                  className="text-sm text-error link-underline"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
