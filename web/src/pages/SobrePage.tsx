import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { ParallaxImage } from '@/components/ui/ParallaxImage'
import { Button } from '@/components/ui/Button'
import { brand } from '@projeto-sete/shared'
import { WORKSHOP_IMAGE, CEO_IMAGE } from '@/lib/images'

const mvv = [
  { title: 'Missão', text: 'Transformar ambientes em experiências sob medida, unindo funcionalidade e elegância com excelência artesanal.' },
  { title: 'Visão', text: 'Ser referência em móveis planejados de alto padrão no Ceará, reconhecida pela inventividade e pela qualidade.' },
  { title: 'Valores', text: 'Sofisticação atemporal, personalização, materiais de primeira linha e respeito absoluto aos prazos.' },
]

const timeline = [
  { year: 2009, title: 'Fundação', text: 'Felipe Amorim funda a Projeto Sete com a visão de elevar a marcenaria cearense ao nível de alto padrão.' },
  { year: 2012, title: 'Primeira Fábrica', text: 'Inauguração da primeira fábrica própria, permitindo controle total sobre cada etapa da produção.' },
  { year: 2015, title: 'CASACOR', text: 'Primeira participação na CASACOR Ceará, consolidando a marca no circuito de arquitetura e design.' },
  { year: 2018, title: 'ForMóbile', text: 'Reconhecimento na ForMóbile, a maior feira de móveis da América Latina.' },
  { year: 2024, title: 'Expansão CNC', text: 'Modernização da fábrica com máquinas CNC de última geração para precisão milimétrica.' },
]

export function SobrePage() {
  return (
    <>
      <Seo
        title="Sobre — Projeto Sete"
        description="Conheça a história da Projeto Sete, mais de 15 anos de marcenaria de alto padrão em Fortaleza."
        path="/sobre"
      />

      {/* Hero */}
      <section className="relative min-h-[60svh] flex items-end overflow-hidden bg-ink">
        <ParallaxImage src={WORKSHOP_IMAGE} alt="Oficina Projeto Sete" speed={0.25} loading="eager" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent z-[1]" />
        <Container className="relative z-10 pb-16 pt-40">
          <span className="eyebrow">História</span>
          <h1 className="mt-4 font-editorial text-display-md sm:text-display-lg text-paper max-w-3xl">
            Mais de{' '}
            <span className="text-gradient-brass">15 anos</span>
            <br />modelando ambientes sob medida.
          </h1>
          <p className="mt-6 max-w-2xl text-mist/80 text-lg leading-relaxed">
            Desde 2009, a Projeto Sete transforma sonhos em realidade com excelência e sofisticação,
            combinando funcionalidade e elegância para espaços residenciais e comerciais.
          </p>
        </Container>
      </section>

      {/* Timeline */}
      <Section tone="charcoal">
        <Container>
          <SectionHeading eyebrow="Trajetória" title="Nossa história" intro="Cada ano, um marco na construção de uma marcenaria de referência." align="center" />
          <div className="mt-14 relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brass/40 via-brass/20 to-transparent hidden md:block" />
            <div className="space-y-8">
              {timeline.map((t, i) => (
                <ScrollReveal key={t.year} delay={i * 0.08}>
                  <div className={`flex items-start gap-6 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                      <div className="glass-card rounded-xl p-6 inline-block max-w-md">
                        <span className="font-editorial text-3xl text-gradient-brass">{t.year}</span>
                        <h3 className="mt-1 font-editorial text-xl text-paper">{t.title}</h3>
                        <p className="mt-2 text-sm text-mist/70">{t.text}</p>
                      </div>
                    </div>
                    <div className="hidden md:flex w-4 h-4 shrink-0 mt-6 rounded-full bg-brass ring-4 ring-charcoal relative z-10" />
                    <div className="flex-1" />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* CEO + MVV */}
      <Section tone="dark">
        <Container>
          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            <ScrollReveal>
              <div className="glass-card p-8 sm:p-10 rounded-xl">
                <div className="flex items-start gap-5">
                  <div className="h-20 w-20 shrink-0 rounded-full overflow-hidden ring-2 ring-brass/30">
                    <img src={CEO_IMAGE} alt={brand.owner.name} loading="lazy" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.15em] text-brass">Liderança</span>
                    <p className="mt-1 font-editorial text-3xl text-paper">{brand.owner.name}</p>
                    <p className="text-sm text-brass/80">{brand.owner.role}</p>
                  </div>
                </div>
                <p className="mt-6 leading-relaxed text-mist/80">
                  À frente da Projeto Sete, conduz cada projeto com a obsessão pelo detalhe
                  que define a marcenaria de alto padrão — da escolha das madeiras à conferência
                  final do acabamento. Referências em CASACOR e ForMóbile atestam o cuidado
                  com que cada ambiente é pensado.
                </p>
                <div className="mt-5 flex gap-3">
                  {brand.references.map((r) => (<span key={r} className="badge">{r}</span>))}
                </div>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              <SectionHeading eyebrow="Fundamentos" title="Missão, Visão & Valores" tone="dark" />
              {mvv.map((m, i) => (
                <ScrollReveal key={m.title} delay={0.1 + i * 0.05}>
                  <div className="glass-card p-6 rounded-xl">
                    <p className="font-editorial text-lg text-paper">{m.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-mist/70">{m.text}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Credenciais */}
      <Section tone="charcoal">
        <Container className="text-center">
          <SectionHeading eyebrow="Diferenciais" title="Por que a Projeto Sete?" align="center" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {brand.credentials.map((c, i) => (
              <ScrollReveal key={c} delay={i * 0.05}>
                <div className="glass-card p-6 rounded-xl text-left">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brass/10 text-brass font-editorial text-sm mb-3">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="text-sm text-mist/80">{c}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <div className="mt-10">
            <Button to="/contato" variant="primary" size="lg">Solicitar projeto</Button>
          </div>
        </Container>
      </Section>
    </>
  )
}
