import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { useApi } from '@/hooks/useApi'

interface Testimonial {
  id: string
  author: string
  role: string | null
  company: string | null
  quote: string
  rating: number
  avatar_url: string | null
}

// Fallback estático caso o CMS ainda não tenha cadastrado depoimentos.
const FALLBACK: Testimonial[] = [
  {
    id: 'f1',
    author: 'Arq. Mariana Lima',
    role: 'Arquiteta de Interiores',
    company: 'Estúdio ML',
    quote:
      'A Projeto Sete entrega o que promete. Acabamento impecável e prazos respeitados — uma parceria que recomendo.',
    rating: 5,
    avatar_url: null,
  },
  {
    id: 'f2',
    author: 'Rodrigo Vasconcelos',
    role: 'Incorporador',
    company: 'Grupo Horizonte',
    quote:
      'Em todos os lançamentos que entregamos, a marcenaria da Projeto Sete foi o detalhe que encantou os clientes.',
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
          eyebrow="Depoimentos & Parcerias"
          title={<>Quem confia, <span className="text-brass">recomenda</span>.</>}
          intro="Arquitetos, construtores e clientes finais que confiaram na Projeto Sete."
          align="center"
          tone="dark"
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {items.map((t, i) => (
            <ScrollReveal key={t.id} delay={i * 0.1}>
              <figure className="border border-graphite bg-charcoal/60 p-8">
                <Stars rating={t.rating} />
                <blockquote className="mt-5 font-serif text-xl leading-relaxed text-paper">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-6">
                  <p className="font-medium text-brass">{t.author}</p>
                  <p className="text-sm text-mist">{[t.role, t.company].filter(Boolean).join(' · ')}</p>
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
    <div className="flex gap-1 text-brass" aria-label={`Avaliação ${rating} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? '' : 'opacity-25'}>
          ★
        </span>
      ))}
    </div>
  )
}
