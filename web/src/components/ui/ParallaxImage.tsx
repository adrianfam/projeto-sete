import { useRef } from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ParallaxImageProps {
  src: string
  alt: string
  className?: string
  speed?: number // 0 = no parallax, 0.5 = subtle, 1 = full
  loading?: 'lazy' | 'eager'
  overlay?: boolean
}

/**
 * Imagem de fundo com efeito parallax sutil.
 * Usa useScroll + useTransform do Framer Motion.
 * Respeita prefers-reduced-motion.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  speed = 0.3,
  loading = 'lazy',
  overlay = true,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [0, 0] : [speed * 40, speed * -40],
  )

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduce ? [1, 1, 1] : [1.05, 1, 1.05],
  )

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)}>
      <div ref={ref} className="relative h-full w-full">
        <motion.div
          className="absolute inset-0"
          style={{ y, scale }}
        >
          <img
            src={src}
            alt={alt}
            loading={loading}
            className="h-full w-full object-cover"
            draggable={false}
          />
        </motion.div>
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-transparent" />
        )}
      </div>
    </div>
  )
}
