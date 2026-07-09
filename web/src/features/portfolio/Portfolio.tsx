import { useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { useApi } from '@/hooks/useApi'
import { Link, useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { PORTFOLIO_CARD_IMAGES } from '@/lib/images'

type ProjectType = ('residencial' | 'comercial' | 'corporativo' | 'especial') | 'todos'

interface PortfolioItemLite {
  id: string
  title: string
  slug: string
  summary: string | null
  cover_image_url: string | null
  project_type: string | null
  location: string | null
  year: number | null
}

const FILTERS: { label: string; value: ProjectType }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Residencial', value: 'residencial' },
  { label: 'Comercial', value: 'comercial' },
  { label: 'Corporativo', value: 'corporativo' },
  { label: 'Especial', value: 'especial' },
]

const isValidType = (v: string | null): v is ProjectType =>
  v !== null && (v === 'todos' || ['residencial', 'comercial', 'corporativo', 'especial'].includes(v))

export function Portfolio() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initial = isValidType(searchParams.get('projectType'))
    ? (searchParams.get('projectType') as ProjectType)
    : 'todos'
  const [filter, setFilter] = useState<ProjectType>(initial)

  const handleFilter = (value: ProjectType) => {
    setFilter(value)
    if (value === 'todos') {
      setSearchParams({})
    } else {
      setSearchParams({ projectType: value })
    }
  }

  const path = filter === 'todos' ? '/portfolio?limit=9' : `/portfolio?projectType=${filter}&limit=9`
  const { data, status } = useApi<{ items: PortfolioItemLite[] }>(path)
  const items = data?.items ?? []

  return (
    <Section id="portfolio" tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Portfólio"
          title="Ambientes que traduzem intenção."
          intro="Projetos residenciais, comerciais e corporativos executados com marcenaria sob medida de alto padrão."
          align="center"
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleFilter(f.value)}
              role="tab"
              aria-selected={filter === f.value}
              className={cn(
                'px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300',
                filter === f.value
                  ? 'bg-brass text-ink shadow-glow'
                  : 'glass-card text-mist hover:text-brass hover:border-brass/30',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {status === 'loading' && <LoadingState className="py-20" />}

        {status !== 'loading' && items.length === 0 && (
          <div className="mt-16 text-center text-mist/50">
            <p>Itens serao exibidos aqui assim que cadastrados no CMS.</p>
          </div>
        )}

        {items.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <ScrollReveal key={item.id} delay={i * 0.05}>
                <Link to={`/portfolio/${item.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl glass-card">
                    {item.cover_image_url ? (
                      <>
                        <img
                          src={item.cover_image_url}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-all duration-700 ease-refined group-hover:scale-[1.05]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-brass/30 rounded-xl transition-all duration-500" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                          <span className="text-[10px] uppercase tracking-wider text-brass-soft">
                            {item.project_type ?? 'Projeto'}
                          </span>
                          <h3 className="mt-1 font-editorial text-xl text-paper">{item.title}</h3>
                          <p className="mt-1 text-xs text-mist/70">
                            {[item.location, item.year].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </>
                    ) : (
                      <img
                        src={PORTFOLIO_CARD_IMAGES[i % PORTFOLIO_CARD_IMAGES.length]}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-all duration-700 ease-refined group-hover:scale-[1.05]"
                      />
                    )}
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <Button to="/portfolio" variant="outline">
            Ver portfolio completo
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </Container>
    </Section>
  )
}
