import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/ui/Container'

/** Placeholder genérico para rotas ainda não implementadas (Fases 1–3). */
export function ComingSoon({
  title,
  description,
  path,
}: {
  title: string
  description?: string
  path?: string
}) {
  return (
    <>
      <Seo title={`${title} — Projeto Sete`} noindex={Boolean(path)} path={path} />
      <Container className="pt-32">
        <div className="py-24 text-center">
          <p className="eyebrow">Em construção</p>
          <h1 className="mt-3 font-serif text-4xl">{title}</h1>
          <p className="mt-6 text-smoke">
            {description ?? 'Esta seção será implementada na próxima fase do projeto.'}
          </p>
        </div>
      </Container>
    </>
  )
}
