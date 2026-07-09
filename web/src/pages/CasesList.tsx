import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { LoadingState } from '@/components/ui/LoadingState'
import { cn } from '@/lib/utils'
import { useApi } from '@/hooks/useApi'
import { CASE_STUDIES, CASE_SECTORS } from '@/lib/caseStudiesData'

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
  subtitle: string
  category: string
  concept: string
  results: { metric: string; label: string }[]
}

function mapItem(item: ApiCaseItem): MappedStudy {
  const category = item.category ?? ''
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    image: item.cover_image_url ?? '',
    subtitle: item.client ?? category,
    category,
    concept: '',
    results: item.results ?? [],
  }
}

function inferSector(study: MappedStudy): string {
  const cat = study.category.toLowerCase()
  if (cat.includes('corporativo')) return 'corporativo'
  if (cat.includes('comercial')) return 'corporativo'
  return 'residencial'
}

export function CasesList() {
  const [sector, setSector] = useState<string>('todos')
  const { data, status } = useApi<{ items: ApiCaseItem[] }>('/cases')

  const allItems: MappedStudy[] = useMemo(() => {
    if (status === 'success' && data?.items && data.items.length > 0) {
      return data.items.map(mapItem)
    }
    // Fallback: mapeia dados estáticos para o formato MappedStudy
    return CASE_STUDIES.map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      image: s.image,
      subtitle: s.subtitle,
      category: s.category,
      concept: s.concept,
      results: s.results,
    }))
  }, [data, status])

  const filtered = useMemo(() => {
    if (sector === 'todos') return allItems
    return allItems.filter((s) => inferSector(s) === sector)
  }, [allItems, sector])

  return (
    <>
      <Seo
        title="Estudos de Caso — Projeto Sete"
        description="Conheça nossos projetos de marcenaria de alto padrão: áreas sociais, cozinhas gourmet, closets, salas corporativas e muito mais."
        path="/cases"
      />

      {/* Hero da página */}
      <section className="relative pt-32 pb-20 bg-ink overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal to-ink" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              'radial-gradient(60% 50% at 30% 30%, rgba(184,134,60,0.15), transparent 60%)',
          }}
        />
        <Container className="relative z-10 text-center">
          <span className="eyebrow">Portfólio Premium</span>
          <h1 className="mt-4 font-editorial text-display-md sm:text-display-lg text-paper text-balance max-w-4xl mx-auto">
            Estudos de{' '}
            <span className="text-gradient-brass">Caso</span>
          </h1>
          <p className="mt-6 text-lg text-mist/70 max-w-2xl mx-auto">
            Projetos que traduzem as macrotendências de alto padrão — do residencial
            ao corporativo, cada detalhe é pensado para transformar espaços em experiências.
          </p>
        </Container>
      </section>

      {/* Filtros por setor */}
      <Section tone="charcoal" className="!pt-0 !pb-0 -mt-px">
        <Container>
          <div className="flex flex-wrap justify-center gap-3 py-10 border-b border-white/[0.06]">
            <button
              onClick={() => setSector('todos')}
              className={cn(
                'px-6 py-3 text-sm font-medium rounded-full transition-all duration-300',
                sector === 'todos'
                  ? 'bg-brass text-ink shadow-glow'
                  : 'glass-card text-mist hover:text-brass hover:border-brass/30',
              )}
            >
              Todos os Estudos
            </button>
            {CASE_SECTORS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSector(s.id)}
                className={cn(
                  'px-6 py-3 text-sm font-medium rounded-full transition-all duration-300',
                  sector === s.id
                    ? 'bg-brass text-ink shadow-glow'
                    : 'glass-card text-mist hover:text-brass hover:border-brass/30',
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </Container>
      </Section>

      {/* Grid de estudos */}
      <Section tone="dark">
        <Container>
          {status === 'loading' && <LoadingState className="py-20" />}

          {status !== 'loading' && (
            <div className="space-y-20">
              {CASE_SECTORS.filter((s) => sector === 'todos' || s.id === sector).map((sec) => {
                const secCases = filtered.filter((s) => inferSector(s) === sec.id)
                if (secCases.length === 0) return null
                return (
                  <div key={sec.id}>
                    <div className="mb-10">
                      <span className="eyebrow">{sec.label}</span>
                      <h2 className="mt-2 font-editorial text-3xl text-paper">{sec.description}</h2>
                      <div className="mt-3 h-px w-16 bg-brass" />
                    </div>

                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                      {secCases.map((study, i) => (
                        <ScrollReveal key={study.id} delay={i * 0.08}>
                          <Link
                            to={`/cases/${study.slug}`}
                            className="group flex flex-col glass-card-hover rounded-xl overflow-hidden h-full"
                          >
                            <div className="relative aspect-[16/12] overflow-hidden">
                              <img
                                src={study.image}
                                alt={study.title}
                                loading={i < 3 ? 'eager' : 'lazy'}
                                className="h-full w-full object-cover transition-all duration-700 ease-refined group-hover:scale-[1.05]"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-brass/30 rounded-xl transition-all duration-500" />
                              <div className="absolute top-4 left-4">
                                <span className="inline-flex px-3 py-1 text-[10px] uppercase tracking-wider rounded-full border border-brass/40 bg-brass/10 text-brass-soft backdrop-blur-sm">
                                  {study.category}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col flex-1 p-6">
                              <span className="text-[10px] uppercase tracking-wider text-brass">
                                {study.subtitle}
                              </span>
                              <h3 className="mt-2 font-editorial text-xl text-paper group-hover:text-brass transition-colors duration-300">
                                {study.title}
                              </h3>
                              <p className="mt-2 text-sm text-mist/70 line-clamp-3 flex-1">
                                {study.concept || study.subtitle}
                              </p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                {study.results.slice(0, 2).map((r) => (
                                  <span
                                    key={r.label}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-full border border-brass/20 text-brass-soft"
                                  >
                                    <strong className="text-brass">{r.metric}</strong>
                                    <span className="text-mist/40">·</span>
                                    {r.label}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </Link>
                        </ScrollReveal>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
