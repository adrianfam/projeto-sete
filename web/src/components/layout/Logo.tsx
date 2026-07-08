import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

/** Marca — usa o logotipo escuro em superfícies claras (footer) e
 * uma versão adequada em superfícies escuras (navbar transparente no hero). */
export function Logo({
  variant = 'light',
  className,
}: {
  variant?: 'light' | 'solid'
  className?: string
}) {
  // Em superfície escura (navbar sobre hero) usamos inversão sutil para legibilidade.
  const invertOnDark = variant === 'light'
  return (
    <Link to="/" aria-label="Projeto Sete — Página inicial" className={cn('inline-flex items-center', className)}>
      <img
        src="/imagens/logo-primary.jpeg"
        alt="Projeto Sete"
        width={44}
        height={44}
        className={cn('h-10 w-auto', invertOnDark && 'invert brightness-0')}
        style={invertOnDark ? { filter: 'invert(1) brightness(1.4) sepia(0.2) hue-rotate(-10deg)' } : undefined}
      />
      <span
        className={cn(
          'ml-2 font-serif text-lg leading-none',
          invertOnDark ? 'text-paper' : 'text-ink',
        )}
      >
        Projeto <span className="text-brass">Sete</span>
      </span>
    </Link>
  )
}
