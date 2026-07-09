import { motion, useReducedMotion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { ParallaxImage } from '@/components/ui/ParallaxImage'
import { brand } from '@projeto-sete/shared'

export function Hero() {
  const reduce = useReducedMotion()

  return (
    <section
      id="topo"
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink text-paper"
    >
      {/* Camada de fundo com parallax */}
      <ParallaxImage
        src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=85"
        alt=""
        loading="eager"
        speed={0.25}
        overlay={false}
      />
      {/* Overlay escuro gradiente */}
      <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/60 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-ink/40 z-[1]" />
      {/* Glow de brass */}
      <div
        className="absolute inset-0 opacity-40 z-[1]"
        style={{
          background:
            'radial-gradient(60% 45% at 65% 25%, rgba(184,134,60,0.2), transparent 60%), radial-gradient(40% 35% at 25% 65%, rgba(26,74,74,0.3), transparent 50%)',
        }}
      />
      {/* Gride sutil */}
      <div
        className="absolute inset-0 opacity-[0.04] z-[1]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <Container className="relative z-10 pt-28 pb-20">
        <div className="max-w-5xl">
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="h-px w-8 bg-brass/60" aria-hidden="true" />
            <span className="eyebrow text-brass-soft">
              {brand.references.join(' · ')}
            </span>
            <span className="h-px w-8 bg-brass/60" aria-hidden="true" />
            <span className="text-xs text-mist/60">Desde {brand.foundedYear}</span>
          </motion.div>

          <motion.h1
            className="font-editorial text-display-lg sm:text-display-xl leading-[0.98] text-balance"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 32 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            Marcenaria de{' '}
            <span className="text-gradient-brass">alto padrão</span>
            <br />
            <span className="text-paper/70">sob medida para quem</span>
            <br />
            <span className="text-paper">valoriza cada detalhe.</span>
          </motion.h1>

          <motion.p
            className="mt-8 max-w-2xl text-lg leading-relaxed text-mist/80"
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
              Explorar portfólio
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Button>
            <Button
              href={brand.contact.whatsappLink}
              target="_blank"
              rel="noopener"
              variant="outline"
              size="lg"
            >
              Solicitar projeto
            </Button>
          </motion.div>
        </div>

        {/* Métricas */}
        <motion.div
          className="mt-20 grid max-w-3xl grid-cols-3 gap-8 border-t border-white/10 pt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          {[
            { value: '15+', label: 'anos de experiência' },
            { value: '2009', label: 'fundação' },
            { value: 'A · B', label: 'classes atendidas' },
          ].map((m) => (
            <div key={m.label} className="group">
              <dt className="font-editorial text-4xl sm:text-5xl text-gradient-brass">
                {m.value}
              </dt>
              <dd className="mt-2 text-xs uppercase tracking-wider text-mist/50">
                {m.label}
              </dd>
            </div>
          ))}
        </motion.div>
      </Container>

      {/* Scroll indicator */}
      <motion.div
        className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-mist/40">
          Scroll
        </span>
        <div className="relative h-8 w-px overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-full w-px bg-gradient-to-b from-brass via-brass/40 to-transparent animate-float" />
        </div>
      </motion.div>
    </section>
  )
}
