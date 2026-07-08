import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  portfolioItemInputSchema,
  toCamel,
  type PortfolioItemInput,
} from '@projeto-sete/shared'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { MediaUploader } from '@/components/admin/MediaUploader'
import { adminRequest, useAdminApi } from '@/hooks/useAdminApi'
import { ApiError } from '@/lib/apiClient'

type FormValues = PortfolioItemInput

const PROJECT_TYPES = ['residencial', 'comercial', 'corporativo', 'especial'] as const

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function PortfolioEditor() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  const { data, status } = useAdminApi<{ item: Record<string, unknown> }>(
    isEdit ? `/admin/portfolio/${id}` : '/admin/portfolio/__none__',
  )
  const item =
    isEdit && status === 'success' && data?.item ? (toCamel(data.item) as FormValues) : null

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(
      portfolioItemInputSchema as unknown as Parameters<typeof zodResolver>[0],
    ),
    defaultValues: emptyItem(),
  })

  useEffect(() => {
    if (item) reset(item)
  }, [item, reset])

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    setSaveErr(null)
    try {
      if (isEdit) {
        await adminRequest(`/portfolio/${id}`, { method: 'PATCH', body: values })
      } else {
        await adminRequest('/portfolio', { method: 'POST', body: values })
      }
      navigate('/admin/portfolio')
    } catch (e) {
      setSaveErr(e instanceof ApiError ? e.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && status === 'loading') return <LoadingState className="pt-20" />

  return (
    <>
      <Seo title="Editar item — Projeto Sete Admin" noindex />
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">{isEdit ? 'Editar item' : 'Novo item'}</h1>
        <Button to="/admin/portfolio" variant="ghost" size="sm">
          ← Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Field label="Título" error={errors.title?.message}>
            <input
              {...register('title')}
              onBlur={(e) => {
                if (!watch('slug')) setValue('slug', slugify(e.target.value))
              }}
              className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
            />
          </Field>
          <Field label="Slug" error={errors.slug?.message}>
            <input {...register('slug')} className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass" />
          </Field>
          <Field label="Resumo" error={errors.summary?.message}>
            <textarea {...register('summary')} rows={3} className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass" />
          </Field>
          <Field label="Descrição (Markdown)">
            <textarea {...register('description')} rows={10} className="w-full border border-mist/60 bg-paper px-4 py-3 font-mono text-sm outline-none focus:border-brass" />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Tipo de projeto">
              <select {...register('projectType')} className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass">
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>{cap(t)}</option>
                ))}
              </select>
            </Field>
            <Field label="Local">
              <input {...register('location')} className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass" />
            </Field>
            <Field label="Ano">
              <input type="number" {...register('year', { setValueAs: (v) => (v === '' ? null : Number(v)) })} className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass" />
            </Field>
          </div>
          <Field label="Área (m²)">
            <input type="number" step="0.01" {...register('areaM2', { setValueAs: (v) => (v === '' ? null : Number(v)) })} className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass" />
          </Field>
        </div>

        <aside className="space-y-6">
          <div className="card-line bg-cream p-5 space-y-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('isPublished')} /> Publicar
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('isFeatured')} /> Destaque
            </label>
          </div>

          <MediaUploader
            label="Imagem de capa"
            value={watch('coverImageUrl')}
            onChange={(url) => setValue('coverImageUrl', url)}
          />

          {saveErr && <p className="text-sm text-error" role="alert">{saveErr}</p>}

          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar item'}
          </Button>
        </aside>
      </form>
    </>
  )
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
function emptyItem(): FormValues {
  return {
    title: '',
    slug: '',
    summary: '',
    description: '',
    categoryId: null,
    projectType: null,
    location: '',
    year: null,
    areaM2: null,
    media: [],
    coverImageUrl: '',
    isFeatured: false,
    isPublished: false,
    publishedAt: null,
    position: 0,
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
