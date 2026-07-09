import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function Logo({
  variant = 'light',
  className,
}: {
  variant?: 'light' | 'solid'
  className?: string
}) {
  return (
    <Link to="/" aria-label="Projeto Sete — Página inicial" className={cn('inline-flex items-center gap-3 group', className)}>
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-brass/40 bg-gradient-to-br from-charcoal to-ink flex items-center justify-center shadow-glow-sm ring-1 ring-inset ring-white/[0.06] group-hover:border-brass/70 group-hover:shadow-glow transition-all duration-500">
        <picture>
          <source srcSet="/imagens/logo-primary.svg" type="image/svg+xml" />
          <source srcSet="/imagens/logo-primary.webp" type="image/webp" />
          <img
            src="/imagens/logo-primary.svg"
            alt="Projeto Sete"
            width={44}
            height={44}
            loading="eager"
            className="h-10 w-10 object-contain"
          />
        </picture>
      </div>
      <span className="flex flex-col leading-none">
        <span className={cn(
          'font-editorial text-xl tracking-wide',
          variant === 'light' ? 'text-paper' : 'text-paper',
        )}>
          Projeto<span className="text-brass">Sete</span>
        </span>
        <span className={cn(
          'text-[10px] uppercase tracking-[0.22em]',
          variant === 'light' ? 'text-mist/50' : 'text-mist/50',
        )}>
          Marcenaria de Alto Padrão
        </span>
      </span>
    </Link>
  )
}
