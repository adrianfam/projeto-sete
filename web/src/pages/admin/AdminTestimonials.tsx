import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi, adminRequest } from '@/hooks/useAdminApi'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { MediaUploader } from '@/components/admin/MediaUploader'
import { ApiError } from '@/lib/apiClient'

interface Testimonial {
  id: string
  author: string
  role: string | null
  company: string | null
  quote: string
  rating: number
  avatar_url: string | null
  is_published: boolean
  position: number
}

const empty = () => ({
  id: null as string | null,
  author: '',
  role: '',
  company: '',
  quote: '',
  rating: 5,
  avatar_url: '' as string,
  is_published: false,
  position: 0,
})

export function AdminTestimonials() {
  const { data, status, refetch } = useAdminApi<{ items: Testimonial[] }>('/testimonials?limit=200')
  // /testimonials público só retorna publicados; admin edita de qualquer forma.
  // Para o MVP usamos o endpoint público p/ listar; a criação/edição cobre o resto.
  const items = data?.items ?? []
  const [draft, setDraft] = useState(empty())
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    try {
      const payload = {
        author: draft.author,
        role: draft.role || null,
        company: draft.company || null,
        quote: draft.quote,
        rating: Number(draft.rating),
        avatarUrl: draft.avatar_url || null,
        isPublished: draft.is_published,
        position: Number(draft.position),
      }
      if (draft.id) {
        await adminRequest(`/testimonials/${draft.id}`, { method: 'PATCH', body: payload })
      } else {
        await adminRequest('/testimonials', { method: 'POST', body: payload })
      }
      setDraft(empty())
      refetch()
    } catch (e) {
      alert(e instanceof ApiError ? e.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const destroy = async (id: string) => {
    if (!confirm('Excluir depoimento?')) return
    await adminRequest(`/testimonials/${id}`, { method: 'DELETE' })
    refetch()
  }

  return (
    <>
      <Seo title="Depoimentos — Projeto Sete Admin" noindex />
      <h1 className="font-serif text-3xl text-paper">Depoimentos</h1>

      {/* Formulário inline */}
      <div className="mt-6 card-line bg-graphite p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <In label="Autor" value={draft.author} onChange={(v) => setDraft({ ...draft, author: v })} />
          <In label="Cargo" value={draft.role ?? ''} onChange={(v) => setDraft({ ...draft, role: v })} />
          <In label="Empresa" value={draft.company ?? ''} onChange={(v) => setDraft({ ...draft, company: v })} />
          <In
            label="Avaliação (1-5)"
            type="number"
            value={String(draft.rating)}
            onChange={(v) => setDraft({ ...draft, rating: Number(v) || 5 })}
          />
        </div>
        <div className="mt-4">
          <label className="mb-2 block text-xs uppercase tracking-eyebrow text-mist">Depoimento</label>
          <textarea
            rows={3}
            value={draft.quote}
            onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
            className="admin-input"
          />
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <MediaUploader
            label="Avatar"
            value={draft.avatar_url}
            onChange={(v) => setDraft({ ...draft, avatar_url: v })}
          />
          <label className="flex items-center gap-2 text-sm text-paper">            <input type="checkbox" checked={draft.is_published} className="accent-brass"
              onChange={(e) => setDraft({ ...draft, is_published: e.target.checked })}
            />
            Publicar
          </label>
        </div>
        <div className="mt-4 flex gap-3">
          <Button onClick={save} variant="primary" disabled={saving}>
            {saving ? 'Salvando…' : draft.id ? 'Atualizar' : 'Adicionar'}
          </Button>
          {draft.id && (
            <Button onClick={() => setDraft(empty())} variant="ghost">
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {status === 'loading' && <LoadingState className="py-16" />}
      {items.length > 0 && (
        <ul className="mt-6 card-line divide-y divide-graphite-light overflow-hidden">
          {items.map((t) => (
            <li key={t.id} className="admin-row">
              <div className="min-w-0">
                <p className="font-medium text-paper">
                  {t.author} <span className="text-xs text-mist">{t.is_published ? '· publicado' : '· rascunho'}</span>
                </p>
                <p className="text-xs text-mist">{[t.role, t.company].filter(Boolean).join(' · ')}</p>
                <p className="mt-2 text-sm text-mist line-clamp-2">“{t.quote}”</p>
              </div>
              <div className="flex shrink-0 gap-3">
                <button
                  onClick={() =>
                    setDraft({
                      id: t.id,
                      author: t.author,
                      role: t.role ?? '',
                      company: t.company ?? '',
                      quote: t.quote,
                      rating: t.rating,
                      avatar_url: t.avatar_url ?? '',
                      is_published: t.is_published,
                      position: t.position,
                    })
                  }
                  className="text-sm text-brass link-underline"
                >
                  Editar
                </button>
                <button onClick={() => destroy(t.id)} className="text-sm text-error link-underline">
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

function In({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-eyebrow text-mist">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="admin-input"
      />
    </div>
  )
}
