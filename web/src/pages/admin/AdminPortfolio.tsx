import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi, adminRequest } from '@/hooks/useAdminApi'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'

interface PortfolioRow {
  id: string
  title: string
  slug: string
  project_type: string | null
  is_published: boolean
  is_featured: boolean
  position: number
}

export function AdminPortfolio() {
  const { data, status, refetch } = useAdminApi<{ items: PortfolioRow[] }>(
    '/admin/portfolio?limit=100',
  )
  const items = data?.items ?? []

  const destroy = async (id: string) => {
    if (!confirm('Excluir este item? Esta ação não pode ser desfeita.')) return
    try {
      await adminRequest(`/portfolio/${id}`, { method: 'DELETE' })
      refetch()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erro ao excluir.')
    }
  }

  return (
    <>
      <Seo title="Portfólio — Projeto Sete Admin" noindex />
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Portfólio</h1>
        <Button to="/admin/portfolio/new" variant="primary" size="sm">
          Novo item
        </Button>
      </div>

      {status === 'loading' && <LoadingState className="py-16" />}
      {status !== 'loading' && items.length === 0 && (
        <p className="py-16 text-center text-mist">Nenhum item. Crie o primeiro.</p>
      )}

      {items.length > 0 && (
        <ul className="mt-6 card-line divide-y divide-graphite-light overflow-hidden">
          {items.map((p) => (
            <li key={p.id} className="admin-row">
              <div className="min-w-0">
                <p className="truncate font-medium text-paper">{p.title}</p>
                <p className="text-xs text-mist">
                  /portfolio/{p.slug} · {p.project_type ?? '—'} · pos {p.position}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <span
                  className={
                    'badge ' +
                    (p.is_published ? 'border-success/50 text-success' : 'border-graphite-light text-mist')
                  }
                >
                  {p.is_published ? 'Publicado' : 'Rascunho'}
                </span>
                {p.is_featured && (
                  <span className="badge">Destaque</span>
                )}
                <Link to={`/admin/portfolio/${p.id}`} className="text-sm text-brass link-underline">
                  Editar
                </Link>
                <button onClick={() => destroy(p.id)} className="text-sm text-error link-underline">
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
