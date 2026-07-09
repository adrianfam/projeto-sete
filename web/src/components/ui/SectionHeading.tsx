import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'left',
  tone = 'dark',
  className,
}: {
  eyebrow?: string
  title: React.ReactNode
  intro?: React.ReactNode
  align?: 'left' | 'center'
  tone?: 'dark' | 'light'
  className?: string
}) {
  const isDark = tone === 'dark'
  return (
    <div
      className={cn(
        'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <span className="eyebrow inline-flex items-center gap-2">
          <span className="h-px w-6 bg-brass/60" aria-hidden="true" />
          {eyebrow}
        </span>
      )}
      <h2
        className={cn(
          'mt-4 font-editorial text-display-sm sm:text-display-md leading-[1.05] text-balance',
          isDark ? 'text-paper' : 'text-ink',
        )}
      >
        {title}
      </h2>
      <div className={cn('section-rule', align === 'center' && 'mx-auto')} />
      {intro && (
        <p
          className={cn(
            'mt-6 text-lg leading-relaxed max-w-2xl',
            align === 'center' && 'mx-auto',
            isDark ? 'text-mist' : 'text-smoke',
          )}
        >
          {intro}
        </p>
      )}
    </div>
  )
}
