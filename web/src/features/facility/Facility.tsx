import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { PROCESS_IMAGES } from '@/lib/images'

const STEPS = [
  {
    n: '01',
    title: 'Briefing & Visita',
    text: 'Entendemos o desejo do cliente e as condições do espaço. Medições e primeiras ideias.',
    accent: 'bg-brass/20 text-brass',
  },
  {
    n: '02',
    title: 'Projeto & Materiais',
    text: 'Layout sob medida, escolha de madeiras, lâminas e ferragens de primeira linha.',
    accent: 'bg-teal text-teal-light',
  },
  {
    n: '03',
    title: 'Produção na Fábrica',
    text: 'Execução em fábrica própria com máquinas de precisão e controle de qualidade etapa a etapa.',
    accent: 'bg-brass/20 text-brass',
  },
  {
    n: '04',
    title: 'Montagem & Entrega',
    text: 'Instalação cuidadosa no local, com acabamento conferido peça por peça.',
    accent: 'bg-teal text-teal-light',
  },
]

const PILLARS = [
  'Fábrica própria em Fortaleza',
  'Máquinas CNC de precisão',
  'Madeiras nobres e ferragens premium',
  'Controle de qualidade em cada etapa',
]

export function Facility() {
  return (
    <Section id="estrutura" tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Processo"
          title="Da ideia à montagem, com controle de cada etapa."
          intro="A marcenaria de alto padrão nasce de processo. Veja como conduzimos cada projeto."
          align="center"
        />

        {/* Timeline horizontal com imagens */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <ScrollReveal key={s.n} delay={i * 0.08}>
              <div className="glass-card rounded-xl overflow-hidden h-full">
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={PROCESS_IMAGES[i]}
                    alt={s.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-all duration-700 ease-refined hover:scale-[1.05]"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-editorial text-2xl text-gradient-brass">{s.n}</span>
                    {i < STEPS.length - 1 && (
                      <span className="hidden lg:block flex-1 h-px bg-gradient-to-r from-brass/30 to-transparent" />
                    )}
                  </div>
                  <h3 className="font-editorial text-lg text-paper">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-mist/70">{s.text}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Pilares */}
        <ScrollReveal className="mt-10" delay={0.2}>
          <div className="flex flex-wrap justify-center gap-3">
            {PILLARS.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full border border-white/[0.06] bg-white/[0.02] text-mist/80 hover:border-brass/30 hover:text-brass transition-all duration-300"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-brass/60" />
                {p}
              </span>
            ))}
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  )
}
