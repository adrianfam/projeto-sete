import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { LoadingState } from '@/components/ui/LoadingState'
import { useApi } from '@/hooks/useApi'
import { cn } from '@/lib/utils'
import { PORTFOLIO_CARD_IMAGES } from '@/lib/images'

type ProjectType = 'todos' | 'residencial' | 'comercial' | 'corporativo' | 'especial'

interface PortfolioItem {
  id: string
  title: string
  slug: string
  summary: string | null
  cover_image_url: string | null
  project_type: string | null
  location: string | null
  year: number | null
  area_m2: number | null
}

const FILTERS: { label: string; value: ProjectType }[] = [
  { label: 'Todos', value: 'todos' },
  { label: 'Residencial', value: 'residencial' },
  { label: 'Comercial', value: 'comercial' },
  { label: 'Corporativo', value: 'corporativo' },
  { label: 'Especial', value: 'especial' },
]

export function PortfolioList() {
  const [filter, setFilter] = useState<ProjectType>('todos')
  const path = filter === 'todos' ? '/portfolio?limit=50' : `/portfolio?projectType=${filter}&limit=50`
  const { data, status } = useApi<{ items: PortfolioItem[] }>(path)
  const items = data?.items ?? []

  return (
    <>
      <Seo title="Portfólio — Projeto Sete" description="Conheça nossos projetos de marcenaria de alto padrão: residenciais, comerciais e corporativos." path="/portfolio" />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-ink overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal to-ink" />
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(60% 50% at 30% 30%, rgba(184,134,60,0.15), transparent 60%)' }} />
        <Container className="relative z-10 text-center">
          <span className="eyebrow">Portfólio</span>
          <h1 className="mt-4 font-editorial text-display-md sm:text-display-lg text-paper text-balance max-w-4xl mx-auto">
            Ambientes que traduzem{' '}<span className="text-gradient-brass">intenção</span>.
          </h1>
          <p className="mt-6 text-lg text-mist/70 max-w-2xl mx-auto">
            Projetos residenciais, comerciais e corporativos executados com marcenaria sob medida de alto padrão.
          </p>
        </Container>
      </section>

      {/* Filtros */}
      <Section tone="charcoal" className="!pt-0 !pb-0 -mt-px">
        <Container>
          <div className="flex flex-wrap justify-center gap-2 py-10 border-b border-white/[0.06]" role="tablist">
            {FILTERS.map((f) => (
              <button key={f.value} onClick={() => setFilter(f.value)} role="tab" aria-selected={filter === f.value}
                className={cn('px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-300',
                  filter === f.value ? 'bg-brass text-ink shadow-glow' : 'glass-card text-mist hover:text-brass hover:border-brass/30'
                )}>
                {f.label}
              </button>
            ))}
          </div>
        </Container>
      </Section>

      {/* Grid */}
      <Section tone="dark">
        <Container>
          {status === 'loading' && <LoadingState className="py-20" />}

          {status !== 'loading' && items.length === 0 && (
            <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {PORTFOLIO_CARD_IMAGES.slice(0, 6).map((img, i) => (
                <div key={i} className="relative aspect-[4/3] overflow-hidden rounded-xl glass-card">
                  <img src={img} alt="" loading="lazy" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="text-[10px] uppercase tracking-wider text-brass">Em breve</span>
                    <h3 className="mt-1 font-editorial text-xl text-paper">Novo projeto</h3>
                  </div>
                </div>
              ))}
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
                          <img src={item.cover_image_url} alt={item.title} loading="lazy" decoding="async"
                            className="h-full w-full object-cover transition-all duration-700 ease-refined group-hover:scale-[1.05]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-brass/30 rounded-xl transition-all duration-500" />
                          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                            <span className="text-[10px] uppercase tracking-wider text-brass-soft">{item.project_type ?? 'Projeto'}</span>
                            <h3 className="mt-1 font-editorial text-xl text-paper">{item.title}</h3>
                            <p className="mt-1 text-xs text-mist/70">{[item.location, item.year].filter(Boolean).join(' · ')}</p>
                          </div>
                        </>
                      ) : (
                        <img src={PORTFOLIO_CARD_IMAGES[i % PORTFOLIO_CARD_IMAGES.length]} alt={item.title} loading="lazy"
                          className="h-full w-full object-cover transition-all duration-700 ease-refined group-hover:scale-[1.05]" />
                      )}
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
