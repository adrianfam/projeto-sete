import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  caseStudyInputSchema,
  toCamel,
  type CaseStudyInput,
} from '@projeto-sete/shared'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { MediaUploader } from '@/components/admin/MediaUploader'
import { adminRequest, useAdminApi } from '@/hooks/useAdminApi'
import { ApiError } from '@/lib/apiClient'

type FormValues = CaseStudyInput

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

export function CaseStudyEditor() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)
  const [saveErr, setSaveErr] = useState<string | null>(null)

  const { data, status } = useAdminApi<{ item: Record<string, unknown> }>(
    isEdit ? `/admin/cases/${id}` : '/admin/cases/__none__',
  )
  const item =
    isEdit && status === 'success' && data?.item ? (toCamel(data.item) as FormValues) : null

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(caseStudyInputSchema as unknown as Parameters<typeof zodResolver>[0]),
    defaultValues: emptyItem(),
  })

  const { fields: resultFields, append: appendResult, remove: removeResult } = useFieldArray({
    control,
    name: 'results',
  })

  useEffect(() => {
    if (item) reset(item)
  }, [item, reset])

  const onSubmit = async (values: FormValues) => {
    setSaving(true)
    setSaveErr(null)
    try {
      if (isEdit) {
        await adminRequest(`/cases/${id}`, { method: 'PATCH', body: values })
      } else {
        await adminRequest('/cases', { method: 'POST', body: values })
      }
      navigate('/admin/cases')
    } catch (e) {
      setSaveErr(e instanceof ApiError ? e.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (isEdit && status === 'loading') return <LoadingState className="pt-20" />

  return (
    <>
      <Seo title="Editar caso — Projeto Sete Admin" noindex />
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl">{isEdit ? 'Editar estudo de caso' : 'Novo estudo de caso'}</h1>
        <Button to="/admin/cases" variant="ghost" size="sm">
          ← Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Título */}
          <Field label="Título" error={errors.title?.message}>
            <input
              {...register('title')}
              onBlur={(e) => {
                if (!watch('slug')) setValue('slug', slugify(e.target.value))
              }}
              className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
            />
          </Field>

          {/* Slug */}
          <Field label="Slug" error={errors.slug?.message}>
            <input
              {...register('slug')}
              className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
            />
          </Field>

          {/* Cliente + Categoria */}
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Cliente" error={errors.client?.message}>
              <input
                {...register('client')}
                placeholder="Ex: CASACOR 2025"
                className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
              />
            </Field>
            <Field label="Categoria" error={errors.category?.message}>
              <input
                {...register('category')}
                placeholder="residencial / corporativo"
                className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
              />
            </Field>
          </div>

          {/* Desafio */}
          <Field label="Desafio" error={errors.challenge?.message}>
            <textarea
              {...register('challenge')}
              rows={4}
              placeholder="Descreva o desafio do projeto…"
              className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
            />
          </Field>

          {/* Processo */}
          <Field label="Processo" error={errors.process?.message}>
            <textarea
              {...register('process')}
              rows={4}
              placeholder="Descreva o processo de execução…"
              className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
            />
          </Field>

          {/* Resultados */}
          <div>
            <label className="mb-2 block text-xs uppercase tracking-eyebrow text-smoke">
              Resultados
            </label>
            <div className="space-y-3">
              {resultFields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-3">
                  <div className="flex-1">
                    <input
                      {...register(`results.${index}.metric`)}
                      placeholder="Ex: 120 m²"
                      className="w-full border border-mist/60 bg-paper px-3 py-2 text-sm outline-none focus:border-brass"
                    />
                  </div>
                  <div className="flex-[2]">
                    <input
                      {...register(`results.${index}.label`)}
                      placeholder="Ex: Área total de marcenaria"
                      className="w-full border border-mist/60 bg-paper px-3 py-2 text-sm outline-none focus:border-brass"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeResult(index)}
                    className="mt-1 text-sm text-error link-underline"
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => appendResult({ metric: '', label: '' })}
                className="text-sm text-brass link-underline"
              >
                + Adicionar resultado
              </button>
            </div>
          </div>

          {/* Galeria */}
          <div>
            <label className="mb-2 block text-xs uppercase tracking-eyebrow text-smoke">
              Galeria de imagens
            </label>
            <div className="space-y-3">
              {(watch('gallery') ?? []).map((_, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex-1">
                    <input
                      {...register(`gallery.${index}.url`)}
                      placeholder="URL da imagem"
                      className="w-full border border-mist/60 bg-paper px-3 py-2 text-sm outline-none focus:border-brass"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      {...register(`gallery.${index}.alt`)}
                      placeholder="Alt"
                      className="w-full border border-mist/60 bg-paper px-3 py-2 text-sm outline-none focus:border-brass"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const current = watch('gallery') ?? []
                      setValue(
                        'gallery',
                        current.filter((_, i) => i !== index),
                      )
                    }}
                    className="mt-1 text-sm text-error link-underline"
                  >
                    Remover
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  const current = watch('gallery') ?? []
                  setValue('gallery', [...current, { type: 'image', url: '', alt: '' }])
                }}
                className="text-sm text-brass link-underline"
              >
                + Adicionar imagem
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="card-line bg-cream space-y-3 p-5">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('isPublished')} /> Publicar
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('featured')} /> Destaque
            </label>
          </div>

          <MediaUploader
            label="Imagem de capa"
            value={watch('coverImageUrl')}
            onChange={(url) => setValue('coverImageUrl', url)}
          />

          {saveErr && (
            <p className="text-sm text-error" role="alert">
              {saveErr}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? 'Salvando…' : isEdit ? 'Salvar alterações' : 'Criar estudo'}
          </Button>
        </aside>
      </form>
    </>
  )
}

function emptyItem(): FormValues {
  return {
    title: '',
    slug: '',
    client: null,
    category: null,
    challenge: null,
    process: null,
    results: [],
    gallery: [],
    coverImageUrl: null,
    isPublished: false,
    featured: false,
    publishedAt: null,
  }
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-eyebrow text-smoke">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}
