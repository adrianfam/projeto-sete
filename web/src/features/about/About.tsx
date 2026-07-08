import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { brand } from '@projeto-sete/shared'

const mvv = [
  {
    title: 'Missão',
    text: 'Transformar ambientes em experiências sob medida, unindo funcionalidade e elegância com excelência artesanal.',
  },
  {
    title: 'Visão',
    text: 'Ser referência em móveis planejados de alto padrão no Ceará, reconhecida pela inventividade e pela qualidade.',
  },
  {
    title: 'Valores',
    text: 'Sofisticação atemporal, personalização, materiais de primeira linha e respeito absoluto aos prazos.',
  },
]

export function About() {
  return (
    <Section id="sobre" tone="light">
      <Container className="grid gap-16 lg:grid-cols-2 lg:items-start">
        <div>
          <SectionHeading
            eyebrow="Sobre a Projeto Sete"
            title={
              <>
                Mais de <span className="text-brass">15 anos</span> modelando ambientes
                sob medida.
              </>
            }
            intro="Desde 2009, a Projeto Sete se destaca como escolha ideal em móveis sob medida de alto padrão em Fortaleza e região. Especialistas em ambientes planejados e personalizados, transformamos sonhos em realidade com excelência e sofisticação."
          />

          <ScrollReveal className="mt-10" delay={0.1}>
            <ul className="grid gap-3">
              {brand.credentials.map((c) => (
                <li key={c} className="flex items-start gap-3 text-smoke">
                  <span className="mt-2 h-1 w-3 bg-brass" aria-hidden="true" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>

        {/* Cartão do CEO */}
        <ScrollReveal delay={0.15}>
          <div className="card-line bg-cream p-8 sm:p-10">
            <p className="eyebrow">Liderança</p>
            <p className="mt-4 font-serif text-3xl text-ink">{brand.owner.name}</p>
            <p className="text-sm uppercase tracking-eyebrow text-brass">{brand.owner.role}</p>
            <p className="mt-6 leading-relaxed text-smoke">
              À frente da Projeto Sete, conduz cada projeto com a obsessão pelo detalhe
              que define a marcenaria de alto padrão — da escolha das madeiras à conferência
              final do acabamento. Referências em CASACOR e ForMóbile atestam o cuidado
              com que cada ambiente é pensado.
            </p>
          </div>
        </ScrollReveal>
      </Container>

      {/* Missão, Visão, Valores */}
      <Container className="mt-16">
        <div className="grid gap-px overflow-hidden border border-mist/40 bg-mist/40 sm:grid-cols-3">
          {mvv.map((m, i) => (
            <ScrollReveal key={m.title} delay={i * 0.1} className="bg-paper p-8">
              <p className="font-serif text-xl text-ink">{m.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-smoke">{m.text}</p>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
