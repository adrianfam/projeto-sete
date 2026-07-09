import { motion } from 'framer-motion'
import { useReducedMotion } from 'framer-motion'
import type { Variants } from 'framer-motion'

export function ScrollReveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'article' | 'li' | 'figure'
}) {
  const reduce = useReducedMotion()

  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 32 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1], delay },
    },
  }

  const MotionTag = motion[as] ?? motion.div

  return (
    <MotionTag
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {children}
    </MotionTag>
  )
}
