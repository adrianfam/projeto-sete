import { useParams, Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { useApi } from '@/hooks/useApi'
import { ParallaxImage } from '@/components/ui/ParallaxImage'
import { PORTFOLIO_CARD_IMAGES } from '@/lib/images'
import { brand } from '@projeto-sete/shared'

interface PortfolioDetailItem {
  id: string
  title: string
  slug: string
  summary: string | null
  description: string | null
  cover_image_url: string | null
  project_type: string | null
  location: string | null
  year: number | null
  area_m2: number | null
  media: { url: string; alt?: string }[]
}

export function PortfolioDetail() {
  const { slug } = useParams<{ slug: string }>()
  const reduce = useReducedMotion()

  if (!slug) {
    return (
      <Section tone="dark" className="pt-32 min-h-screen">
        <Container className="text-center">
          <span className="eyebrow">Não encontrado</span>
          <h1 className="mt-4 font-editorial text-4xl text-paper">Projeto não disponível</h1>
          <div className="mt-8"><Button to="/portfolio" variant="outline">Ver todos os projetos</Button></div>
        </Container>
      </Section>
    )
  }

  const { data, status } = useApi<PortfolioDetailItem>(`/portfolio/${slug}`)

  if (status === 'loading') return <LoadingState className="min-h-screen pt-32" />

  if (!data) {
    return (
      <Section tone="dark" className="pt-32 min-h-screen">
        <Container className="text-center">
          <span className="eyebrow">Não encontrado</span>
          <h1 className="mt-4 font-editorial text-4xl text-paper">Projeto não disponível</h1>
          <p className="mt-4 text-mist/70">O projeto que você procura não existe ou foi removido.</p>
          <div className="mt-8"><Button to="/portfolio" variant="outline">Ver todos os projetos</Button></div>
        </Container>
      </Section>
    )
  }

  const allImages = [
    data.cover_image_url,
    ...(data.media ?? []).map((m) => m.url),
    ...PORTFOLIO_CARD_IMAGES,
  ].filter(Boolean) as string[]

  return (
    <>
      <Seo title={`${data.title} — Projeto Sete`} description={data.summary ?? ''} path={`/portfolio/${data.slug}`} image={data.cover_image_url ?? undefined} type="article" />

      {/* Hero */}
      <section className="relative min-h-[70svh] flex items-end overflow-hidden bg-ink">
        <ParallaxImage
          src={data.cover_image_url ?? PORTFOLIO_CARD_IMAGES[0]}
          alt={data.title}
          speed={0.2}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent z-[1]" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/40 to-transparent z-[1]" />

        <Container className="relative z-10 pb-16 pt-40">
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="eyebrow">{data.project_type ?? 'Projeto'}</span>
              <span className="h-3 w-px bg-brass/40" />
              <span className="text-xs uppercase tracking-wider text-mist/60">{data.location}</span>
            </div>
            <h1 className="font-editorial text-display-md sm:text-display-lg text-paper max-w-3xl">{data.title}</h1>
            {data.summary && <p className="mt-6 max-w-2xl text-mist/80 leading-relaxed">{data.summary}</p>}
            <div className="mt-8 flex flex-wrap gap-6">
              {data.year && (
                <div><span className="font-editorial text-2xl text-gradient-brass">{data.year}</span><p className="text-xs text-mist/60 mt-1">Ano</p></div>
              )}
              {data.area_m2 && (
                <div><span className="font-editorial text-2xl text-gradient-brass">{data.area_m2}m²</span><p className="text-xs text-mist/60 mt-1">Área</p></div>
              )}
              {data.location && (
                <div><span className="font-editorial text-2xl text-gradient-brass">{data.location.split(',').at(0)?.trim()}</span><p className="text-xs text-mist/60 mt-1">Local</p></div>
              )}
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Descrição */}
      {data.description && (
        <Section tone="charcoal">
          <Container>
            <SectionHeading eyebrow="Sobre o Projeto" title="Detalhes do projeto" />
            <div className="mt-8 max-w-3xl text-mist/80 leading-relaxed whitespace-pre-line">{data.description}</div>
          </Container>
        </Section>
      )}

      {/* Galeria */}
      <Section tone="dark">
        <Container>
          <SectionHeading eyebrow="Galeria" title="Imagens do projeto." align="center" />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {allImages.slice(0, 9).map((img, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl glass-card group">
                  <img src={img} alt={`${data.title} - imagem ${i + 1}`} loading="lazy"
                    className="h-full w-full object-cover transition-all duration-700 ease-refined group-hover:scale-[1.05]" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-brass/30 rounded-xl transition-all duration-500" />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section tone="charcoal">
        <Container className="text-center">
          <SectionHeading eyebrow="Gostou?" title="Vamos criar algo extraordinário juntos."
            intro="Cada projeto começa com uma conversa. Compartilhe sua visão e vamos transformá-la em marcenaria de alto padrão." align="center" />
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button href={brand.contact.whatsappLink} target="_blank" rel="noopener" variant="primary" size="lg">Solicitar projeto</Button>
            <Button to="/portfolio" variant="ghost" size="lg">Outros projetos</Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
