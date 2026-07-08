import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { useApi } from '@/hooks/useApi'
import { Link } from 'react-router-dom'
import type { CaseResult } from '@projeto-sete/shared'

interface CaseStudyLite {
  id: string
  title: string
  slug: string
  client: string | null
  category: string | null
  cover_image_url: string | null
  results: CaseResult[]
}

export function CaseStudies() {
  const { data, status } = useApi<{ items: CaseStudyLite[] }>('/cases?limit=3')
  const items = data?.items ?? []

  return (
    <Section id="cases" tone="light">
      <Container>
        <SectionHeading
          eyebrow="Estudos de Caso"
          title="Desafio, processo e resultados."
          intro="Cada projeto começa com um problema concreto e termina com métricas que importam ao cliente."
          align="center"
        />

        {status === 'loading' && <p className="mt-12 text-center text-smoke">Carregando…</p>}
        {status === 'error' && (
          <p className="mt-12 text-center text-smoke">Estudos de caso em breve.</p>
        )}

        {items.length === 0 && status !== 'loading' && status !== 'error' && (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <ScrollReveal key={i} delay={i * 0.1} className="card-line bg-cream p-8">
                <p className="font-serif text-xl text-ink">Estudo em destaque</p>
                <p className="mt-3 text-sm text-smoke">
                  Em breve, métricas reais de projetos serão exibidas aqui.
                </p>
              </ScrollReveal>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {items.map((c, i) => (
              <ScrollReveal key={c.id} delay={i * 0.1}>
                <Link to={`/cases/${c.slug}`} className="group block">
                  <div className="aspect-[4/3] overflow-hidden border border-mist/40 bg-graphite">
                    {c.cover_image_url && (
                      <img
                        src={c.cover_image_url}
                        alt={c.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 ease-refined group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-eyebrow text-brass">
                    {c.category ?? 'Projeto'}
                  </p>
                  <h3 className="mt-1 font-serif text-xl text-ink">{c.title}</h3>
                  <div className="mt-4 flex flex-wrap gap-3">
                    {(c.results ?? []).slice(0, 2).map((r) => (
                      <span
                        key={r.label}
                        className="border border-brass/40 px-3 py-1 text-xs text-smoke"
                      >
                        <strong className="text-brass">{r.metric}</strong> · {r.label}
                      </span>
                    ))}
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}
      </Container>
    </Section>
  )
}
