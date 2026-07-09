import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { ParallaxImage } from '@/components/ui/ParallaxImage'
import { useApi } from '@/hooks/useApi'
import { getCaseStudy, CASE_STUDIES } from '@/lib/caseStudiesData'

interface ApiCaseDetail {
  id: string
  title: string
  slug: string
  client: string | null
  category: string | null
  challenge: string | null
  process: string | null
  results: { metric: string; label: string }[]
  gallery: { url: string; alt?: string }[]
  cover_image_url: string | null
  featured: boolean
  published_at: string | null
}

interface DetailView {
  id: string
  title: string
  slug: string
  sector: string
  category: string
  subtitle: string
  concept: string
  image: string
  solutions: { title: string; description: string }[]
  results: { metric: string; label: string }[]
  gallery: string[]
}

function inferSector(category: string): string {
  const cat = category.toLowerCase()
  if (cat.includes('corporativo') || cat.includes('comercial')) return 'Corporativo'
  return 'Residencial'
}

function mapApiToDetail(item: ApiCaseDetail): DetailView {
  const category = item.category ?? ''
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    sector: inferSector(category),
    category,
    subtitle: item.client ?? category,
    concept: item.challenge ?? item.process ?? '',
    image: item.cover_image_url ?? '',
    solutions: [],
    results: item.results ?? [],
    gallery: (item.gallery ?? []).map((g) => g.url).filter(Boolean),
  }
}

export function CaseDetail() {
  const { slug } = useParams<{ slug: string }>()

  // Tenta dados estáticos primeiro (conteúdo rico)
  const staticStudy = slug ? getCaseStudy(slug) : undefined

  // Fallback: busca da API
  const { data, status } = useApi<{ item: ApiCaseDetail }>(
    slug ? `/cases/${slug}` : '',
  )

  // Determina qual objeto usar
  const study: DetailView | null = (() => {
    if (staticStudy) {
      return {
        id: staticStudy.id,
        title: staticStudy.title,
        slug: staticStudy.slug,
        sector: staticStudy.sector,
        category: staticStudy.category,
        subtitle: staticStudy.subtitle,
        concept: staticStudy.concept,
        image: staticStudy.image,
        solutions: staticStudy.solutions,
        results: staticStudy.results,
        gallery: staticStudy.gallery,
      }
    }
    if (status === 'success' && data?.item) {
      return mapApiToDetail(data.item)
    }
    return null
  })()

  if (!study && status !== 'loading') {
    return (
      <Section tone="dark" className="pt-32 min-h-screen">
        <Container className="text-center">
          <span className="eyebrow">Não encontrado</span>
          <h1 className="mt-4 font-editorial text-4xl text-paper">Estudo de caso não disponível</h1>
          <p className="mt-4 text-mist/70">O estudo que você procura não existe ou foi removido.</p>
          <div className="mt-8">
            <Button to="/cases" variant="outline">Ver todos os estudos</Button>
          </div>
        </Container>
      </Section>
    )
  }

  if (!study) {
    return <LoadingState className="min-h-screen pt-40" />
  }

  return (
    <>
      <Seo
        title={`${study.title} — Projeto Sete`}
        description={study.concept}
        path={`/cases/${study.slug}`}
        image={study.image}
        type="article"
      />

      {/* Hero do estudo com parallax */}
      <section className="relative min-h-[70svh] flex items-end overflow-hidden bg-ink">
        <ParallaxImage
          src={study.image}
          alt={study.title}
          speed={0.2}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/40 to-transparent z-[1]" />

        <Container className="relative z-10 pb-16 pt-40">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="eyebrow">{study.sector}</span>
              <span className="h-3 w-px bg-brass/40" />
              <span className="text-xs uppercase tracking-wider text-mist/60">
                {study.category}
              </span>
            </div>
            <h1 className="font-editorial text-display-md sm:text-display-lg text-paper max-w-3xl leading-[1.02]">
              {study.title}
            </h1>
            <p className="mt-3 text-lg text-brass-soft font-editorial">
              {study.subtitle}
            </p>
            <p className="mt-6 max-w-2xl text-mist/80 leading-relaxed">
              {study.concept}
            </p>

            {/* Métricas */}
            {study.results.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-6">
                {study.results.map((r) => (
                  <div key={r.label} className="flex items-center gap-3">
                    <span className="font-editorial text-2xl text-gradient-brass">{r.metric}</span>
                    <span className="text-xs text-mist/60 max-w-[100px]">{r.label}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </Container>
      </section>

      {/* Soluções */}
      {study.solutions.length > 0 && (
        <Section tone="charcoal">
          <Container>
            <SectionHeading
              eyebrow="Soluções"
              title="Tendências e soluções em marcenaria."
              intro="Cada projeto é uma oportunidade de aplicar o que há de mais inovador em design de interiores e marcenaria de alto padrão."
              align="center"
            />

            <div className="mt-14 space-y-8">
              {study.solutions.map((sol, i) => (
                <ScrollReveal key={sol.title} delay={i * 0.1}>
                  <div className="glass-card rounded-xl overflow-hidden">
                    <div className="grid md:grid-cols-5">
                      <div className="md:col-span-2 relative aspect-[4/3] md:aspect-auto overflow-hidden">
                        <img
                          src={study.gallery[i % study.gallery.length] || study.image}
                          alt={sol.title}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-ink/20 to-transparent" />
                      </div>
                      <div className="md:col-span-3 p-8 sm:p-10 flex flex-col justify-center">
                        <span className="text-[10px] uppercase tracking-wider text-brass/70">
                          Solução {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 className="mt-2 font-editorial text-2xl text-paper">{sol.title}</h3>
                        <p className="mt-4 text-mist/70 leading-relaxed">{sol.description}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Galeria */}
      {study.gallery.length > 0 && (
        <Section tone="dark">
          <Container>
            <SectionHeading
              eyebrow="Galeria"
              title="Imagens do projeto."
              align="center"
            />
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {study.gallery.map((img, i) => (
                <ScrollReveal key={i} delay={i * 0.08}>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl glass-card group">
                    <img
                      src={img}
                      alt={`${study.title} - imagem ${i + 1}`}
                      loading="lazy"
                      className="h-full w-full object-cover transition-all duration-700 ease-refined group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-brass/30 rounded-xl transition-all duration-500" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* CTA e estudos relacionados */}
      <Section tone="charcoal">
        <Container>
          <div className="text-center">
            <SectionHeading
              eyebrow="Inspirado?"
              title="Vamos criar algo extraordinário juntos."
              intro="Cada projeto começa com uma conversa. Compartilhe sua visão e vamos transformá-la em marcenaria de alto padrão."
              align="center"
            />
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button href="https://wa.me/5585998162777" target="_blank" rel="noopener" variant="primary" size="lg">
                Solicitar projeto
              </Button>
              <Button to="/cases" variant="ghost" size="lg">
                Outros estudos
              </Button>
            </div>
          </div>

          {/* Estudos relacionados */}
          {CASE_STUDIES.filter((c) => c.id !== study.id && c.sector === study.sector).length > 0 && (
            <div className="mt-20">
              <h3 className="font-editorial text-2xl text-paper mb-8">
                Mais estudos de{' '}
                <span className="text-brass">{study.sector.toLowerCase()}</span>
              </h3>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {CASE_STUDIES.filter((c) => c.id !== study.id && c.sector === study.sector)
                  .slice(0, 3)
                  .map((related) => (
                    <Link
                      key={related.id}
                      to={`/cases/${related.slug}`}
                      className="group glass-card-hover rounded-xl overflow-hidden"
                    >
                      <div className="aspect-[16/10] overflow-hidden">
                        <img
                          src={related.image}
                          alt={related.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-all duration-700 ease-refined group-hover:scale-[1.05]"
                        />
                      </div>
                      <div className="p-5">
                        <span className="text-[10px] uppercase tracking-wider text-brass">
                          {related.subtitle}
                        </span>
                        <h4 className="mt-1 font-editorial text-lg text-paper group-hover:text-brass transition-colors">
                          {related.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </Container>
      </Section>
    </>
  )
}
