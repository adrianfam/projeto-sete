import { cn } from '@/lib/utils'

/** Cabeçalho de seção: eyebrow + título serif + régua de brass. */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'left',
  tone = 'light',
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  intro?: React.ReactNode
  align?: 'left' | 'center'
  tone?: 'light' | 'dark'
  className?: string
}) {
  const isDark = tone === 'dark'
  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2
        className={cn(
          'mt-3 font-serif text-4xl leading-tight sm:text-5xl',
          isDark ? 'text-paper' : 'text-ink',
        )}
      >
        {title}
      </h2>
      <div className={cn('section-rule', align === 'center' && 'mx-auto')} />
      {intro && (
        <p
          className={cn(
            'mt-6 text-lg leading-relaxed',
            isDark ? 'text-mist' : 'text-smoke',
          )}
        >
          {intro}
        </p>
      )}
    </div>
  )
}
