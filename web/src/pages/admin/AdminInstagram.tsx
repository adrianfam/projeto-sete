import { Seo } from '@/components/seo/Seo'
import { useAdminApi, adminRequest } from '@/hooks/useAdminApi'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { ApiError } from '@/lib/apiClient'
import { formatDate } from '@/lib/utils'

interface IgPost {
  id: string
  caption: string | null
  image_url: string
  post_url: string | null
  aspect_ratio: 'square' | 'portrait' | 'landscape'
  posted_at: string | null
  is_published: boolean
}

const RATIOS = ['square', 'portrait', 'landscape'] as const

export function AdminInstagram() {
  const { data, status, refetch } = useAdminApi<{ items: IgPost[] }>('/instagram?limit=100')
  const items = data?.items ?? []

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    try {
      await adminRequest('/instagram', {
        method: 'POST',
        body: {
          caption: fd.get('caption') || null,
          image_url: fd.get('image_url'),
          post_url: fd.get('post_url') || null,
          aspect_ratio: fd.get('aspect_ratio') || 'square',
          posted_at: fd.get('posted_at') || new Date().toISOString().slice(0, 10),
          is_published: true,
        },
      })
      e.currentTarget.reset()
      refetch()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao salvar.')
    }
  }

  const destroy = async (id: string) => {
    if (!confirm('Remover este post?')) return
    await adminRequest(`/instagram/${id}`, { method: 'DELETE' })
    refetch()
  }

  return (
    <>
      <Seo title="Instagram — Projeto Sete Admin" noindex />
      <h1 className="font-serif text-3xl">Instagram</h1>
      <p className="mt-2 text-smoke">Galeria manual. Os posts exibidos aqui aparecem no site.</p>

      <form onSubmit={add} className="mt-6 card-line bg-cream p-6 space-y-4">
        <label className="block text-xs uppercase tracking-eyebrow text-smoke">Legenda</label>
        <input name="caption" className="w-full border border-mist/60 bg-paper text-ink px-4 py-3 outline-none focus:border-brass" />
        <input name="image_url" placeholder="URL da imagem" required className="w-full border border-mist/60 bg-paper text-ink px-4 py-3 outline-none focus:border-brass" />
        <input name="post_url" placeholder="Link do post no Instagram (opcional)" className="w-full border border-mist/60 bg-paper text-ink px-4 py-3 outline-none focus:border-brass" />
        <div className="flex gap-4">
          <select name="aspect_ratio" className="border border-mist/60 bg-paper text-ink px-4 py-3 outline-none focus:border-brass">
            {RATIOS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input name="posted_at" type="date" className="border border-mist/60 bg-paper text-ink px-4 py-3 outline-none focus:border-brass" />
          <Button type="submit" variant="primary">Adicionar</Button>
        </div>
      </form>

      {status === 'loading' && <LoadingState className="py-16" />}
      {items.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <div key={p.id} className="border border-mist/40 bg-paper p-3">
              <div className="aspect-square overflow-hidden">
                <img src={p.image_url} alt={p.caption ?? ''} className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-smoke">{p.caption}</p>
              <p className="text-xs text-brass">{formatDate(p.posted_at)}</p>
              <button onClick={() => destroy(p.id)} className="mt-2 text-xs text-error link-underline">
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
