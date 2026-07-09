import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { useApi } from '@/hooks/useApi'
import { AVATAR_IMAGES } from '@/lib/images'

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
  {
    id: 'f1',
    author: 'Arq. Mariana Lima',
    role: 'Arquiteta de Interiores',
    company: 'Estúdio ML',
    quote: 'A Projeto Sete entrega o que promete. Acabamento impecável e prazos respeitados — uma parceria que recomendo.',
    rating: 5,
    avatar_url: null,
  },
  {
    id: 'f2',
    author: 'Rodrigo Vasconcelos',
    role: 'Incorporador',
    company: 'Grupo Horizonte',
    quote: 'Em todos os lançamentos que entregamos, a marcenaria da Projeto Sete foi o detalhe que encantou os clientes.',
    rating: 5,
    avatar_url: null,
  },
]

export function Testimonials() {
  const { data, status } = useApi<{ items: Testimonial[] }>('/testimonials')
  const items = status === 'success' && (data?.items?.length ?? 0) > 0 ? data!.items : FALLBACK

  return (
    <Section id="depoimentos" tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Depoimentos"
          title={
            <>
              Quem confia,{' '}
              <span className="text-gradient-brass">recomenda</span>.
            </>
          }
          intro="Arquitetos, construtores e clientes finais que confiaram na Projeto Sete."
          align="center"
        />

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {items.map((t, i) => (
            <ScrollReveal key={t.id} delay={i * 0.1}>
              <figure className="glass-card-hover rounded-xl p-8 sm:p-10 h-full flex flex-col">
                <Stars rating={t.rating} />
                <blockquote className="mt-6 font-editorial text-xl leading-relaxed text-paper flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8 pt-6 border-t border-white/5 flex items-center gap-4">
                  <div className="h-12 w-12 shrink-0 rounded-full overflow-hidden bg-graphite ring-2 ring-brass/30">
                    <img
                      src={t.avatar_url ?? AVATAR_IMAGES[Math.abs(t.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_IMAGES.length]}
                      alt={t.author}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
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
      </Container>
    </Section>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-1" aria-label={`Avaliação ${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < rating ? '#B8863C' : 'none'} stroke="#B8863C" strokeWidth="1.5">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  )
}
