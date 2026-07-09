import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { brand } from '@projeto-sete/shared'
import { WORKSHOP_IMAGE, CEO_IMAGE } from '@/lib/images'

const mvv = [
  {
    title: 'Missão',
    text: 'Transformar ambientes em experiências sob medida, unindo funcionalidade e elegância com excelência artesanal.',
    icon: '🎯',
  },
  {
    title: 'Visão',
    text: 'Ser referência em móveis planejados de alto padrão no Ceará, reconhecida pela inventividade e pela qualidade.',
    icon: '🔭',
  },
  {
    title: 'Valores',
    text: 'Sofisticação atemporal, personalização, materiais de primeira linha e respeito absoluto aos prazos.',
    icon: '✦',
  },
]

export function About() {
  return (
    <Section id="sobre" tone="charcoal">
      <Container className="grid gap-16 lg:grid-cols-2 lg:items-start">
        <div>
          <SectionHeading
            eyebrow="Sobre"
            title={
              <>
                Mais de{' '}
                <span className="text-gradient-brass">15 anos</span>
                <br />
                modelando ambientes sob medida.
              </>
            }
            intro="Desde 2009, a Projeto Sete se destaca como escolha ideal em móveis sob medida de alto padrão em Fortaleza e região."
          />

          <ScrollReveal className="mt-12 space-y-4" delay={0.1}>
            {brand.credentials.map((c) => (
              <div key={c} className="flex items-start gap-4 group">
                <span className="mt-1.5 h-px w-6 bg-brass/60 group-hover:w-8 transition-all duration-500" aria-hidden="true" />
                <span className="text-mist text-sm leading-relaxed">{c}</span>
              </div>
            ))}
          </ScrollReveal>
        </div>

        {/* Bento Grid: imagem da oficina + CEO + MVV */}
        <div className="grid gap-4">
          {/* Imagem da oficina */}
          <ScrollReveal delay={0.1}>
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl glass-card">
              <img
                src={WORKSHOP_IMAGE}
                alt="Oficina Projeto Sete"
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-[10px] uppercase tracking-wider text-brass">Nossa Oficina</span>
                <p className="mt-1 text-sm text-paper/80">Fábrica própria em Fortaleza com máquinas CNC de precisão</p>
              </div>
            </div>
          </ScrollReveal>

          {/* CEO card */}
          <ScrollReveal delay={0.15}>
            <div className="glass-card p-6 sm:p-8 rounded-xl flex items-start gap-5">
              <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden ring-2 ring-brass/30">
                <img
                  src={CEO_IMAGE}
                  alt={brand.owner.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-[0.15em] text-brass">Liderança</span>
                <p className="mt-1 font-editorial text-2xl text-paper">{brand.owner.name}</p>
                <p className="text-sm text-brass/80">{brand.owner.role}</p>
                <p className="mt-3 leading-relaxed text-mist/80 text-sm">
                  À frente da Projeto Sete, conduz cada projeto com a obsessão pelo detalhe
                  que define a marcenaria de alto padrão.
                </p>
                <div className="mt-4 flex gap-2">
                  {brand.references.map((r) => (
                    <span key={r} className="badge">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* MVV grid */}
          <div className="grid gap-4 sm:grid-cols-3">
            {mvv.map((m, i) => (
              <ScrollReveal key={m.title} delay={0.2 + i * 0.05}>
                <div className="glass-card p-6 rounded-xl h-full">
                  <span className="text-lg">{m.icon}</span>
                  <p className="mt-3 font-editorial text-lg text-paper">{m.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-mist/70">{m.text}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
