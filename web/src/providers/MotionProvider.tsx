import { MotionConfig } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'

/**
 * Honra prefers-reduced-motion globalmente: em reduced-motion o Framer
 * transição vira instantânea (transformações são desligadas, mantendo só fade).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <MotionConfig reducedMotion={reduce ? 'always' : 'never'} transition={{ duration: 0.6 }}>
      {children}
    </MotionConfig>
  )
}
