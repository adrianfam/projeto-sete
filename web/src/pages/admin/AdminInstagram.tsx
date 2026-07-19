import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi, adminRequest } from '@/hooks/useAdminApi'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { MediaUploader } from '@/components/admin/MediaUploader'
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

interface IgFormState {
  caption: string
  image_url: string
  post_url: string
  aspect_ratio: 'square' | 'portrait' | 'landscape'
  posted_at: string
}

const emptyForm = (): IgFormState => ({
  caption: '',
  image_url: '',
  post_url: '',
  aspect_ratio: 'square',
  posted_at: new Date().toISOString().slice(0, 10),
})

export function AdminInstagram() {
  const { data, status, refetch } = useAdminApi<{ items: IgPost[] }>('/instagram?limit=100')
  const items = data?.items ?? []
  const [form, setForm] = useState<IgFormState>(emptyForm())
  const [saving, setSaving] = useState(false)

  const add = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.image_url) return alert('Adicione uma imagem.')
    setSaving(true)
    try {
      await adminRequest('/instagram', {
        method: 'POST',
        body: {
          caption: form.caption || null,
          image_url: form.image_url,
          post_url: form.post_url || null,
          aspect_ratio: form.aspect_ratio,
          posted_at: form.posted_at || new Date().toISOString().slice(0, 10),
          is_published: true,
        },
      })
      setForm(emptyForm())
      refetch()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
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
      <h1 className="font-serif text-3xl text-paper">Instagram</h1>
      <p className="mt-2 text-mist">Galeria manual. Os posts exibidos aqui aparecem no site.</p>

      <form onSubmit={add} className="mt-6 card-line bg-graphite p-6 space-y-4">
        <label className="block text-xs uppercase tracking-eyebrow text-mist">Legenda</label>
        <input
          value={form.caption}
          onChange={(e) => setForm({ ...form, caption: e.target.value })}
          className="admin-input"
        />

        <MediaUploader
          label="Imagem"
          value={form.image_url}
          onChange={(url) => setForm({ ...form, image_url: url })}
        />

        <input
          value={form.post_url}
          onChange={(e) => setForm({ ...form, post_url: e.target.value })}
          placeholder="Link do post no Instagram (opcional)"
          className="admin-input"
        />
        <div className="flex flex-wrap gap-4">
          <select
            value={form.aspect_ratio}
            onChange={(e) => setForm({ ...form, aspect_ratio: e.target.value as 'square' | 'portrait' | 'landscape' })}
            className="admin-input w-auto"
          >
            {RATIOS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
          <input
            type="date"
            value={form.posted_at}
            onChange={(e) => setForm({ ...form, posted_at: e.target.value })}
            className="admin-input w-auto"
          />
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Salvando…' : 'Adicionar'}
          </Button>
        </div>
      </form>

      {status === 'loading' && <LoadingState className="py-16" />}
      {items.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <div key={p.id} className="card-line bg-graphite p-3">
              <div className="aspect-square overflow-hidden rounded">
                <img src={p.image_url} alt={p.caption ?? ''} className="h-full w-full object-cover" />
              </div>
              <p className="mt-2 line-clamp-2 text-xs text-mist">{p.caption}</p>
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
