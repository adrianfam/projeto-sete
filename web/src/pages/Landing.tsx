import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { brand } from '@projeto-sete/shared'

/** Placeholder da Landing — FASE 1 substitui pela composição completa das seções. */
export function Landing() {
  return (
    <>
      <Seo />
      <section className="relative flex min-h-screen items-center overflow-hidden bg-charcoal text-paper">
        <Container className="relative z-10 pt-20">
          <p className="eyebrow">{brand.references.join(' · ')} · Desde {brand.foundedYear}</p>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.05] sm:text-6xl lg:text-7xl">
            Marcenaria de alto padrão, <span className="text-brass">sob medida</span> para quem valoriza cada detalhe.
          </h1>
          <p className="mt-8 max-w-xl text-lg text-mist leading-relaxed">{brand.description}</p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button to="/portfolio" variant="primary" size="lg">
              Ver portfólio
            </Button>
            <Button href={brand.contact.whatsappLink} target="_blank" rel="noopener" variant="ghost" size="lg">
              Solicitar projeto
            </Button>
          </div>
        </Container>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-charcoal/40 via-charcoal/60 to-charcoal" />
      </section>

      {/* Conteúdo completo entra na FASE 1: Sobre, Portfólio, Cases, Depoimentos, Estrutura, Instagram, Blog, Contato */}
      <Container className="py-32 text-center">
        <p className="eyebrow">Em construção</p>
        <h2 className="mt-3 font-serif text-4xl">Landing completa — Fase 1</h2>
        <p className="mt-6 text-smoke">Fundação do projeto concluída. Próximas seções virão aqui.</p>
      </Container>
    </>
  )
}
