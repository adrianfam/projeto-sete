import { useState } from 'react'
import { cn } from '@/lib/utils'

export function LazyMedia({
  src,
  alt,
  className,
  imgClassName,
  loading = 'lazy',
  overlay,
  aspectRatio,
}: {
  src: string
  alt: string
  className?: string
  imgClassName?: string
  loading?: 'lazy' | 'eager'
  overlay?: boolean
  aspectRatio?: string
}) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div
      className={cn('overflow-hidden relative bg-charcoal', className)}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {!loaded && (
        <div className="absolute inset-0 skeleton" />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          'h-full w-full object-cover transition-all duration-700 ease-refined',
          loaded ? 'opacity-100' : 'opacity-0',
          imgClassName,
        )}
      />
      {overlay && <div className="img-overlay" />}
    </div>
  )
}
