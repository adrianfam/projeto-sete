import { cn } from '@/lib/utils'

export function Section({
  id,
  className,
  children,
  tone = 'dark',
}: {
  id?: string
  className?: string
  children: React.ReactNode
  tone?: 'dark' | 'light' | 'cream' | 'charcoal'
}) {
  const bg = {
    dark: 'bg-ink text-paper',
    charcoal: 'bg-charcoal text-paper',
    cream: 'bg-[#0D0F12] text-paper border-t border-white/5',
    light: 'bg-paper text-ink',
  }[tone]

  return (
    <section id={id} className={cn('scroll-mt-20 py-24 md:py-32', bg, className)}>
      {children}
    </section>
  )
}
