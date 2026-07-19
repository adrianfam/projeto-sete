import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi } from '@/hooks/useAdminApi'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatDate } from '@/lib/utils'

interface AdminBlogRow {
  id: string
  title: string
  slug: string
  is_published: boolean
  published_at: string | null
  author: string
  reading_minutes: number | null
}

type Resp = { items: AdminBlogRow[] }

export function AdminBlog() {
  const { data, status } = useAdminApi<Resp>('/admin/blog?limit=50')
  const items = (data?.items ?? []) as AdminBlogRow[]

  return (
    <>
      <Seo title="Blog — Projeto Sete Admin" noindex />
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">Posts do Blog</h1>
        <Button to="/admin/blog/new" variant="primary" size="sm">
          Novo post
        </Button>
      </div>

      {status === 'loading' && <LoadingState className="py-16" />}
      {status !== 'loading' && items.length === 0 && (
        <p className="py-16 text-center text-mist">Nenhum post. Crie o primeiro.</p>
      )}

      {items.length > 0 && (
        <ul className="mt-6 card-line divide-y divide-graphite-light overflow-hidden">
          {items.map((p) => (
            <li key={p.id} className="admin-row">
              <div className="min-w-0">
                <p className="truncate font-medium text-paper">{p.title}</p>
                <p className="text-xs text-mist">
                  /blog/{p.slug} · {p.author} · {p.reading_minutes ?? '—'} min ·{' '}
                  {p.published_at ? formatDate(p.published_at) : 'rascunho'}
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
                <Link to={`/admin/blog/${p.id}`} className="text-sm text-brass link-underline">
                  Editar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
