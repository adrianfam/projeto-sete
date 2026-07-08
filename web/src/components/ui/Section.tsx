import { cn } from '@/lib/utils'

/** Seção de página com ritmo vertical consistente e ID opcional p/ âncora. */
export function Section({
  id,
  className,
  children,
  tone = 'light',
}: {
  id?: string
  className?: string
  children: React.ReactNode
  tone?: 'light' | 'dark' | 'cream'
}) {
  const bg = tone === 'dark' ? 'bg-charcoal text-paper' : tone === 'cream' ? 'bg-cream' : 'bg-paper'
  return (
    <section id={id} className={cn('scroll-mt-24 py-24 md:py-32', bg, className)}>
      {children}
    </section>
  )
}
