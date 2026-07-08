import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

const STEPS = [
  {
    n: '01',
    title: 'Briefing & visita',
    text: 'Entendemos o desejo do cliente e as condições do espaço. medições e primeiras ideias.',
  },
  {
    n: '02',
    title: 'Projeto & materiais',
    text: 'Layout sob medida, escolha de madeiras, lâminas e ferragens de primeira linha.',
  },
  {
    n: '03',
    title: 'Produção na fábrica',
    text: 'Execução em fábrica própria com máquinas de precisão e controle de qualidade etapa a etapa.',
  },
  {
    n: '04',
    title: 'Montagem & entrega',
    text: 'Instalação cuidadosa no local, com acabamento conferido peça por peça.',
  },
]

const FACILITY_PILLARS = [
  'Fábrica própria em Fortaleza',
  'Máquinas CNC de precisão',
  'Madeiras nobres e ferrarias premium',
  'Controle de qualidade em cada etapa',
]

export function Facility() {
  return (
    <Section id="estrutura" tone="cream">
      <Container>
        <SectionHeading
          eyebrow="Estrutura & Processo"
          title="Da ideia à montagem, com controle de cada etapa."
          intro="A marcenaria de alto padrão nasce de processo. Veja como conduzimos cada projeto."
          align="center"
        />

        {/* Processo em 4 passos */}
        <div className="mt-14 grid gap-px overflow-hidden border border-mist/40 bg-mist/40 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <ScrollReveal key={s.n} delay={i * 0.08} className="bg-paper p-8">
              <p className="font-serif text-3xl text-brass">{s.n}</p>
              <h3 className="mt-3 font-serif text-lg text-ink">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-smoke">{s.text}</p>
            </ScrollReveal>
          ))}
        </div>

        {/* Pilares / tour */}
        <ScrollReveal className="mt-10" delay={0.1}>
          <ul className="flex flex-wrap justify-center gap-3">
            {FACILITY_PILLARS.map((p) => (
              <li
                key={p}
                className="border border-brass/40 px-4 py-2 text-sm text-smoke"
              >
                {p}
              </li>
            ))}
          </ul>
        </ScrollReveal>
      </Container>
    </Section>
  )
}
