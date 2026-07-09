import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Button } from '@/components/ui/Button'
import { useApi } from '@/hooks/useApi'
import { AVATAR_IMAGES } from '@/lib/images'
import { brand } from '@projeto-sete/shared'

interface Testimonial {
  id: string
  author: string
  role: string | null
  company: string | null
  quote: string
  rating: number
  avatar_url: string | null
}

const FALLBACK: Testimonial[] = [
  { id: 'f1', author: 'Arq. Mariana Lima', role: 'Arquiteta de Interiores', company: 'Estúdio ML', quote: 'A Projeto Sete entrega o que promete. Acabamento impecável e prazos respeitados — uma parceria que recomendo.', rating: 5, avatar_url: null },
  { id: 'f2', author: 'Rodrigo Vasconcelos', role: 'Incorporador', company: 'Grupo Horizonte', quote: 'Em todos os lançamentos que entregamos, a marcenaria da Projeto Sete foi o detalhe que encantou os clientes.', rating: 5, avatar_url: null },
  { id: 'f3', author: 'Dra. Carolina Mendes', role: 'Médica', company: null, quote: 'Meu home office ficou exatamente como imaginei. Cada detalhe pensado — das prateleiras aos nichos para cabos. Superou minhas expectativas.', rating: 5, avatar_url: null },
  { id: 'f4', author: 'Carlos Alberto Neto', role: 'Empresário', company: 'Rede Norte', quote: 'Contratei para o escritório e acabei fazendo toda a casa. A qualidade do acabamento e o respeito ao prazo são diferenciais raros hoje em dia.', rating: 5, avatar_url: null },
]

const getAvatar = (id: string) => {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return AVATAR_IMAGES[Math.abs(hash) % AVATAR_IMAGES.length]
}

export function TestimonialsPage() {
  const { data, status } = useApi<{ items: Testimonial[] }>('/testimonials')
  const items = status === 'success' && (data?.items?.length ?? 0) > 0 ? data!.items : FALLBACK

  return (
    <>
      <Seo title="Depoimentos — Projeto Sete" description="Veja o que nossos clientes e parceiros dizem sobre a Projeto Sete." path="/testimonials" />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-ink overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal to-ink" />
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(60% 50% at 50% 30%, rgba(184,134,60,0.15), transparent 60%)' }} />
        <Container className="relative z-10 text-center">
          <span className="eyebrow">Depoimentos</span>
          <h1 className="mt-4 font-editorial text-display-md sm:text-display-lg text-paper text-balance max-w-3xl mx-auto">
            Quem confia,{' '}<span className="text-gradient-brass">recomenda</span>.
          </h1>
          <p className="mt-4 text-lg text-mist/70 max-w-xl mx-auto">Arquitetos, construtores e clientes finais que confiaram na Projeto Sete.</p>
        </Container>
      </section>

      {/* Grid */}
      <Section tone="dark">
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {items.map((t, i) => (
              <ScrollReveal key={t.id} delay={i * 0.05}>
                <figure className="glass-card-hover rounded-xl p-8 sm:p-10 h-full flex flex-col">
                  <Stars rating={t.rating} />
                  <blockquote className="mt-6 font-editorial text-xl leading-relaxed text-paper flex-1">&ldquo;{t.quote}&rdquo;</blockquote>
                  <figcaption className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4">
                    <div className="h-14 w-14 shrink-0 rounded-full overflow-hidden bg-graphite ring-2 ring-brass/30">
                      <img src={t.avatar_url ?? getAvatar(t.id)} alt={t.author} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium text-brass">{t.author}</p>
                      <p className="text-sm text-mist/60">{[t.role, t.company].filter(Boolean).join(' · ')}</p>
                    </div>
                  </figcaption>
                </figure>
              </ScrollReveal>
            ))}
          </div>
          <div className="mt-14 text-center">
            <Button href={brand.contact.whatsappLink} target="_blank" rel="noopener" variant="primary" size="lg">
              Solicitar projeto
            </Button>
          </div>
        </Container>
      </Section>
    </>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`Avaliacao ${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < rating ? '#B8863C' : 'none'} stroke="#B8863C" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}
