import { cn } from '@/lib/utils'

/**
 * Imagem com lazy-loading nativo, decodificação assíncrona e acento brass
 * no hover (cartão). Mantém aspect-ratio travado via className do caller
 * para evitar CLS. LQIP opcional via prop `lqip`.
 */
export function LazyMedia({
  src,
  alt,
  className,
  imgClassName,
  loading = 'lazy',
  lqip,
  onLoad,
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  loading?: 'lazy' | 'eager'
  lqip?: string
  onLoad?: () => void
}) {
  return (
    <div className={cn('overflow-hidden', className)}>
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={onLoad}
        className={cn('h-full w-full object-cover', imgClassName)}
        // Mantém espaço mesmo antes do carregamento.
        style={lqip ? { background: `url(${lqip}) center/cover` } : undefined}
      />
    </div>
  )
}
