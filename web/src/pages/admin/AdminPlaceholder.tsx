import { Seo } from '@/components/seo/Seo'

/** Placeholder para sub-seções do admin (blog, portfólio, etc.) — CRUD na Fase 3. */
export function AdminPlaceholder({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <>
      <Seo title={`${title} — Projeto Sete Admin`} noindex />
      <h1 className="font-serif text-3xl">{title}</h1>
      <p className="mt-2 text-smoke">
        {description ?? 'CRUD será implementado na Fase 3 (Admin CMS).'}
      </p>
    </>
  )
}
