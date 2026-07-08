import { useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { useApi } from '@/hooks/useApi'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

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

const TELEMETRY_FILTERS: { label: string; value: ProjectType }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Residencial', value: 'residencial' },
  { label: 'Comercial', value: 'comercial' },
  { label: 'Corporativo', value: 'corporativo' },
  { label: 'Especial', value: 'especial' },
]

export function Portfolio() {
  const [filter, setFilter] = useState<ProjectType>('todos')
  const path =
    filter === 'todos'
      ? '/portfolio?limit=12'
      : `/portfolio?projectType=${filter}&limit=12`
  const { data, status } = useApi<{ items: PortfolioItemLite[] }>(path)
  const items = data?.items ?? []

  return (
    <Section id="portfolio" tone="cream">
      <Container>
        <SectionHeading
          eyebrow="Portfólio"
          title="Ambientes que traduzem intenção."
          intro="Projetos residenciais, comerciais e corporativos executados com marcenaria sob medida de alto padrão."
          align="center"
        />

        {/* Filtros */}
        <div className="mt-10 flex flex-wrap justify-center gap-2" role="tablist">
          {TELEMETRY_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              role="tab"
              aria-selected={filter === f.value}
              className={cn(
                'border px-4 py-2 text-sm font-medium transition-colors',
                filter === f.value
                  ? 'border-brass bg-brass text-charcoal'
                  : 'border-mist/60 text-smoke hover:border-brass hover:text-ink',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {status === 'loading' && <LoadingState className="py-20" />}
        {status === 'error' && (
          <p className="mt-16 text-center text-smoke">
            Não foi possível carregar o portfólio agora. Tente novamente em instantes.
          </p>
        )}

        {status !== 'loading' && items.length === 0 && (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[4/3] w-full border border-mist/40 bg-paper/50"
              />
            ))}
            <div className="col-span-full mt-4 text-center text-sm text-smoke">
              Itens serão exibidos aqui assim que cadastrados no CMS.
            </div>
          </div>
        )}

        {/* Grid */}
        {items.length > 0 && (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <ScrollReveal key={item.id} delay={i * 0.05} className="group">
                <Link to={`/portfolio/${item.slug}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden border border-mist/40">
                    {item.cover_image_url ? (
                      <img
                        src={item.cover_image_url}
                        alt={item.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 ease-refined group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-graphite text-brass">
                        <span className="font-serif text-3xl">PS</span>
                      </div>
                    )}
                    <div className="absolute inset-0 ring-1 ring-inset ring-brass opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  </div>
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-eyebrow text-brass">
                      {item.project_type ?? 'Projeto'}
                    </p>
                    <h3 className="mt-1 font-serif text-xl text-ink">{item.title}</h3>
                    <p className="mt-1 text-sm text-smoke line-clamp-2">{item.summary}</p>
                    <p className="mt-2 text-xs text-smoke">
                      {[item.location, item.year].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <Button to="/portfolio" variant="ghost">
            Ver portfólio completo
          </Button>
        </div>
      </Container>
    </Section>
  )
}
