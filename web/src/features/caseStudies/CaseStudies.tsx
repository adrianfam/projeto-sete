import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Button } from '@/components/ui/Button'
import { Link } from 'react-router-dom'
import { useApi } from '@/hooks/useApi'
import { CASE_STUDIES } from '@/lib/caseStudiesData'

interface ApiCaseItem {
  id: string
  title: string
  slug: string
  client: string | null
  category: string | null
  cover_image_url: string | null
  results: { metric: string; label: string }[]
  featured: boolean
  published_at: string | null
}

interface MappedStudy {
  id: string
  title: string
  slug: string
  image: string
  category: string
  subtitle: string
  results: { metric: string; label: string }[]
}

function mapItem(item: ApiCaseItem): MappedStudy {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    image: item.cover_image_url ?? '',
    category: item.category ?? '',
    subtitle: item.client ?? item.category ?? '',
    results: item.results ?? [],
  }
}

export function CaseStudies() {
  const { data, status } = useApi<{ items: ApiCaseItem[] }>('/cases')

  const items: MappedStudy[] =
    status === 'success' && data?.items && data.items.length > 0
      ? data.items.slice(0, 3).map(mapItem)
      : CASE_STUDIES.slice(0, 3)

  return (
    <Section id="cases" tone="charcoal">
      <Container>
        <SectionHeading
          eyebrow="Estudos de Caso"
          title="Desafio, processo e resultados."
          intro="Cada projeto começa com um problema concreto e termina com métricas que importam ao cliente. Conheça nossas soluções em marcenaria de alto padrão."
          align="center"
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map((study, i) => (
            <ScrollReveal key={study.id} delay={i * 0.1}>
              <Link to={`/cases/${study.slug}`} className="group block">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl glass-card">
                  <img
                    src={study.image}
                    alt={study.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-all duration-700 ease-refined group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-brass/30 rounded-xl transition-all duration-500" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-[10px] uppercase tracking-wider text-brass">
                      {study.category}
                    </span>
                    <h3 className="mt-1 font-editorial text-xl text-paper">{study.title}</h3>
                    <p className="mt-1 text-xs text-mist/70 line-clamp-2">{study.subtitle}</p>
                  </div>
                </div>
                {study.results.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {study.results.slice(0, 3).map((r) => (
                      <span
                        key={r.label}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border border-brass/20 bg-brass/5 text-brass-soft"
                      >
                        <strong className="text-brass">{r.metric}</strong>
                        <span className="text-mist/50">·</span>
                        {r.label}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <div className="mt-14 text-center">
          <Button to="/cases" variant="ghost">
            Ver todos os estudos
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </Container>
    </Section>
  )
}
