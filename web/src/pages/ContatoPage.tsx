import { Seo } from '@/components/seo/Seo'
import { ParallaxImage } from '@/components/ui/ParallaxImage'
import { Container } from '@/components/ui/Container'
import { Contact } from '@/features/contact/Contact'

export function ContatoPage() {
  return (
    <>
      <Seo
        title="Contato — Projeto Sete"
        description="Entre em contato com a Projeto Sete. Solicite um orçamento ou tire suas dúvidas sobre marcenaria de alto padrão."
        path="/contato"
      />

      {/* Hero compacto */}
      <section className="relative pt-32 pb-16 overflow-hidden bg-ink">
        <ParallaxImage
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=85"
          alt=""
          speed={0.2}
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/30 z-[1]" />
        <Container className="relative z-10 text-center">
          <span className="eyebrow">Entre em Contato</span>
          <h1 className="mt-4 font-editorial text-display-md sm:text-display-lg text-paper text-balance max-w-3xl mx-auto">
            Vamos conversar sobre o{' '}
            <span className="text-gradient-brass">seu projeto</span>.
          </h1>
          <p className="mt-4 text-lg text-mist/70 max-w-xl mx-auto">
            Conte sua ideia. Respondemos em até um dia útil.
          </p>
        </Container>
      </section>

      {/* Reusa o componente Contact sem o Section wrapper para evitar duplicação de padding */}
      <section className="bg-ink pb-24">
        <Contact />
      </section>
    </>
  )
}
