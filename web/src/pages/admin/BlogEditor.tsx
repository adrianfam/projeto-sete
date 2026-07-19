import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { blogPostInputSchema, toCamel, type BlogPostInput } from '@projeto-sete/shared'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { MediaUploader, signAndUpload } from '@/components/admin/MediaUploader'
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

function ImageUploadButton({ onInsert }: { onInsert: (markdown: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleFile = async (file?: File) => {
    if (!file) return
    setUploading(true)
    setErr(null)
    try {
      const url = await signAndUpload(file)
      const alt = file.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')
      onInsert(`![${alt}](${url})`)
    } catch {
      setErr('Erro ao fazer upload da imagem.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded border border-graphite-light bg-graphite px-3 py-2 text-sm text-paper hover:border-brass disabled:opacity-50"
        >
          {uploading ? 'Enviando…' : 'Upload imagem'}
        </button>
        <span className="text-xs text-mist">Insere no Markdown como ![alt](url)</span>
      </div>
      {err && <p className="mt-1 text-xs text-error">{err}</p>}
    </div>
  )
}

export function BlogEditor() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)
  const bodyRef = useRef<HTMLTextAreaElement | null>(null)

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
        <h1 className="font-serif text-3xl text-paper">{isEdit ? 'Editar post' : 'Novo post'}</h1>
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
              className="admin-input"
              onBlur={(e) => {
                const v = watch('slug')
                if (!v) setValue('slug', slugify(e.target.value))
              }}
            />
          </Field>
          <Field label="Slug (URL)" error={errors.slug?.message}>
            <input
              {...register('slug')}
              className="admin-input"
            />
          </Field>
          <Field label="Resumo" error={errors.excerpt?.message}>
            <textarea
              {...register('excerpt')}
              rows={3}
              className="admin-input"
            />
          </Field>
          <Field label="Conteúdo (Markdown)" error={errors.body?.message}>
            <textarea
              {...register('body')}
              rows={18}
              className="admin-input font-mono text-sm"
              ref={(e) => {
                bodyRef.current = e
              }}
            />
            <div className="mt-2">
              <ImageUploadButton
                onInsert={(markdown) => {
                  const ta = bodyRef.current
                  if (!ta) return
                  const start = ta.selectionStart ?? ta.value.length
                  const end = ta.selectionEnd ?? start
                  const before = ta.value.slice(0, start)
                  const after = ta.value.slice(end)
                  setValue('body', before + markdown + after)
                  requestAnimationFrame(() => {
                    ta.focus()
                    const pos = start + markdown.length
                    ta.setSelectionRange(pos, pos)
                  })
                }}
              />
            </div>
          </Field>
        </div>

        {/* Coluna lateral */}
        <aside className="space-y-6">
          <div className="card-line bg-graphite p-5">
            <label className="flex items-center gap-2 text-sm text-paper">
              <input type="checkbox" {...register('isPublished')} className="accent-brass" />
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
              className="admin-input"
            />
          </Field>

          <Field label="Autor">
            <input
              {...register('author')}
              className="admin-input"
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
              className="admin-input"
            />
          </Field>

          {saveErr && <p className="text-sm text-error" role="alert">{saveErr}</p>}

          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar post'}
          </Button>
        </aside>
      </form>

      <p className="mt-4 text-xs text-mist">Prévia do título: {title}</p>
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
      <label className="mb-2 block text-xs uppercase tracking-eyebrow text-mist">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}
