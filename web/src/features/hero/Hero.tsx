import { motion, useReducedMotion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { brand } from '@projeto-sete/shared'

export function Hero() {
  const reduce = useReducedMotion()

  return (
    <section
      id="topo"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-charcoal text-paper"
    >
      {/* Camada de fundo — gradiente arquitetônico (sem imagem pesada no MVP) */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-graphite via-charcoal to-ink" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'radial-gradient(60% 50% at 70% 20%, rgba(176,131,66,0.25), transparent 60%)',
          }}
        />
      </div>

      <Container className="relative z-10 pt-28">
        <motion.p
          className="eyebrow"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          {brand.references.join(' · ')} · Desde {brand.foundedYear}
        </motion.p>

        <motion.h1
          className="mt-6 max-w-4xl font-serif text-5xl leading-[1.04] sm:text-6xl lg:text-7xl text-balance"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          Marcenaria de alto padrão, <span className="text-brass">sob medida</span> para quem
          valoriza cada detalhe.
        </motion.h1>

        <motion.p
          className="mt-8 max-w-xl text-lg leading-relaxed text-mist"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
        >
          {brand.description}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap gap-4"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        >
          <Button to="/portfolio" variant="primary" size="lg">
            Ver portfólio
          </Button>
          <Button href={brand.contact.whatsappLink} target="_blank" rel="noopener" variant="ghost" size="lg">
            Solicitar projeto
          </Button>
        </motion.div>

        {/* Métricas de credibilidade */}
        <motion.dl
          className="mt-16 grid max-w-2xl grid-cols-3 gap-6 border-t border-graphite pt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {[
            { v: '15+', l: 'anos de marcenaria' },
            { v: '2009', l: 'tradição desde' },
            { v: 'A · B', l: 'público atendido' },
          ].map((m) => (
            <div key={m.l}>
              <dt className="font-serif text-3xl text-brass">{m.v}</dt>
              <dd className="mt-1 text-xs uppercase tracking-eyebrow text-brass-soft">{m.l}</dd>
            </div>
          ))}
        </motion.dl>
      </Container>

      {/* Indicador de scroll */}
      <div className="absolute inset-x-0 bottom-8 flex justify-center" aria-hidden="true">
        <div className="h-12 w-px bg-gradient-to-b from-transparent via-brass to-transparent" />
      </div>
    </section>
  )
}
