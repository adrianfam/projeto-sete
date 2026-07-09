import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { blogPostInputSchema, toCamel, type BlogPostInput } from '@projeto-sete/shared'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { MediaUploader } from '@/components/admin/MediaUploader'
import { adminRequest, useAdminApi } from '@/hooks/useAdminApi'
import { ApiError } from '@/lib/apiClient'

type FormValues = BlogPostInput

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function BlogEditor() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  const { data, status } = useAdminApi<{ post: Record<string, unknown> }>(
    isEdit ? `/admin/blog/${id}` : '/admin/blog/__none__',
  )

  const post = isEdit && status === 'success' && data?.post ? (toCamel(data.post) as FormValues) : null

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      blogPostInputSchema as unknown as Parameters<typeof zodResolver>[0],
    ),
    defaultValues: emptyPost(),
  })

  useEffect(() => {
    if (post) reset(post)
  }, [post, reset])

  const title = watch('title')
  const tagsStr = watch('tags')?.join(', ') ?? ''

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    setSaveErr(null)
    try {
      if (isEdit) {
        await adminRequest(`/blog/${id}`, { method: 'PATCH', body: values })
      } else {
        await adminRequest('/blog', { method: 'POST', body: values })
      }
      navigate('/admin/blog')
    } catch (e) {
      setSaveErr(e instanceof ApiError ? e.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && status === 'loading') return <LoadingState className="pt-20" />

  return (
    <>
      <Seo title="Editar post — Projeto Sete Admin" noindex />
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">{isEdit ? 'Editar post' : 'Novo post'}</h1>
        <Button to="/admin/blog" variant="ghost" size="sm">
          ← Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-6 lg:col-span-2">
          <Field label="Título" error={errors.title?.message}>
            <input
              {...register('title')}
              className="w-full border border-mist/60 bg-paper text-ink px-4 py-3 outline-none focus:border-brass"
              onBlur={(e) => {
                const v = watch('slug')
                if (!v) setValue('slug', slugify(e.target.value))
              }}
            />
          </Field>
          <Field label="Slug (URL)" error={errors.slug?.message}>
            <input
              {...register('slug')}
              className="w-full border border-mist/60 bg-paper text-ink px-4 py-3 outline-none focus:border-brass"
            />
          </Field>
          <Field label="Resumo" error={errors.excerpt?.message}>
            <textarea
              {...register('excerpt')}
              rows={3}
              className="w-full border border-mist/60 bg-paper text-ink px-4 py-3 outline-none focus:border-brass"
            />
          </Field>
          <Field label="Conteúdo (Markdown)" error={errors.body?.message}>
            <textarea
              {...register('body')}
              rows={18}
              className="w-full border border-mist/60 bg-paper text-ink px-4 py-3 font-mono text-sm outline-none focus:border-brass"
            />
          </Field>
        </div>

        {/* Coluna lateral */}
        <aside className="space-y-6">
          <div className="card-line bg-cream p-5">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('isPublished')} />
              Publicar
            </label>
          </div>

          <Field label="Tags (separadas por vírgula)">
            <input
              value={tagsStr}
              onChange={(e) => {
                const arr = e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
                setValue('tags', arr)
              }}
              className="w-full border border-mist/60 bg-paper text-ink px-4 py-3 outline-none focus:border-brass"
            />
          </Field>

          <Field label="Autor">
            <input
              {...register('author')}
              className="w-full border border-mist/60 bg-paper text-ink px-4 py-3 outline-none focus:border-brass"
            />
          </Field>

          <MediaUploader
            label="Capa"
            value={watch('coverImageUrl')}
            onChange={(url) => setValue('coverImageUrl', url)}
          />
          <Field label="Alt da capa">
            <input
              {...register('coverAlt')}
              className="w-full border border-mist/60 bg-paper text-ink px-4 py-3 outline-none focus:border-brass"
            />
          </Field>

          {saveErr && <p className="text-sm text-error" role="alert">{saveErr}</p>}

          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar post'}
          </Button>
        </aside>
      </form>

      <p className="mt-4 text-xs text-smoke">Prévia do título: {title}</p>
    </>
  )
}

function emptyPost(): FormValues {
  return {
    title: '',
    slug: '',
    excerpt: '',
    body: '',
    coverImageUrl: '',
    coverAlt: '',
    tags: [],
    author: 'Felipe Amorim',
    authorAvatarUrl: '',
    isPublished: false,
    publishedAt: null,
    seo: { title: '', description: '', ogImage: '' },
  }
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-eyebrow text-smoke">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}
