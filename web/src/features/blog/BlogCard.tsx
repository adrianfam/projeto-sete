import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useParallax } from '@/hooks/useParallax'
import { formatDate } from '@/lib/utils'
import { BLOG_IMAGES } from '@/lib/images'

export interface BlogCardItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  cover_alt?: string | null
  reading_minutes: number | null
  published_at: string | null
}

interface BlogCardProps {
  post: BlogCardItem
  index?: number
  aspect?: '3/2' | '16/9'
}

export function BlogCard({ post, index = 0, aspect = '3/2' }: BlogCardProps) {
  const { ref: parallaxRef, offsetY } = useParallax(0.05)
  const [imgLoaded, setImgLoaded] = useState(false)
  const onLoad = useCallback(() => setImgLoaded(true), [])
  const onError = useCallback(() => setImgLoaded(true), [])

  const imgUrl = post.cover_image_url || BLOG_IMAGES[index % BLOG_IMAGES.length]

  return (
    <Link to={`/blog/${post.slug}`} className="group flex h-full flex-col glass-card-hover rounded-2xl overflow-hidden transition-transform duration-500 hover:-translate-y-1">
      <div ref={parallaxRef} className="overflow-hidden bg-graphite relative" style={{ aspectRatio: aspect }}>
        {/* Placeholder shimmer enquanto a imagem não carrega */}
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}

        <div
          className="h-full w-full transition-transform duration-[0.1s] ease-linear"
          style={{ transform: `translateY(${offsetY}px) scale(1.08)` }}
        >
          <img
            src={imgUrl}
            alt={post.cover_alt ?? post.title}
            loading="lazy"
            decoding="async"
            onLoad={onLoad}
            onError={onError}
            className={`h-full w-full object-cover transition-all duration-700 ease-refined group-hover:scale-[1.05] ${
              imgLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
            }`}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-brass/30 transition-all duration-500" />
      </div>
      <div className="flex flex-col flex-1 p-7">
        <span className="inline-flex self-start items-center gap-1.5 rounded-full border border-brass/20 bg-brass/5 px-3 py-1 text-[10px] uppercase tracking-wider text-brass">
          {post.reading_minutes ? `${post.reading_minutes} min de leitura` : 'Artigo'}
        </span>
        <h3 className="mt-3 font-editorial text-xl text-paper leading-snug group-hover:text-brass transition-colors duration-300">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 text-sm text-mist/70 line-clamp-2 flex-1 leading-relaxed">{post.excerpt}</p>
        )}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="text-xs text-mist/40">{formatDate(post.published_at)}</span>
          <span className="text-xs text-brass/60 group-hover:text-brass transition-colors duration-300 flex items-center gap-1">
            Ler mais
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  )
}
