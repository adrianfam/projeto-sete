import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { useApi } from '@/hooks/useApi'
import { brand } from '@projeto-sete/shared'
import { cn } from '@/lib/utils'
import { INSTAGRAM_IMAGES } from '@/lib/images'

interface InstagramPost {
  id: string
  caption: string | null
  image_url: string
  post_url: string | null
  aspect_ratio: 'square' | 'portrait' | 'landscape'
}

const aspectClass: Record<InstagramPost['aspect_ratio'], string> = {
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[4/3]',
}

export function InstagramGallery() {
  const { data, status } = useApi<{ items: InstagramPost[] }>('/instagram')
  const items = data?.items ?? []

  return (
    <Section id="instagram" tone="charcoal">
      <Container>
        <SectionHeading
          eyebrow="Instagram"
          title={<>Acompanhe <span className="text-gradient-brass">@_projetosete</span></>}
          intro="Galeria de destaques. Para o feed ao vivo, siga-nos no Instagram."
          align="center"
        />

        {status === 'loading' && <p className="mt-12 text-center text-mist/50">Carregando…</p>}

        <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {(items.length > 0 ? items.slice(0, 6) : INSTAGRAM_IMAGES.slice(0, 6)).map(
            (p, i) =>
              'image_url' in p ? (
                <a
                  key={p.id}
                  href={p.post_url ?? brand.social.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'group relative block overflow-hidden rounded-xl glass-card',
                    aspectClass[p.aspect_ratio] ?? 'aspect-square',
                  )}
                >
                  <img
                    src={p.image_url}
                    alt={p.caption ?? brand.social.instagram.handle}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-all duration-700 ease-refined group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  {p.caption && (
                    <span className="absolute bottom-0 left-0 right-0 p-4 text-xs text-paper/80 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      {p.caption}
                    </span>
                  )}
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-brass/30 rounded-xl transition-all duration-500" />
                </a>
              ) : (
                <a
                  key={`ig-fallback-${i}`}
                  href={brand.social.instagram.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'group relative block overflow-hidden rounded-xl glass-card',
                    p.aspect === 'portrait' ? 'aspect-[4/5]' : p.aspect === 'landscape' ? 'aspect-[4/3]' : 'aspect-square',
                  )}
                >
                  <img
                    src={p.url}
                    alt={p.caption}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-all duration-700 ease-refined group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <span className="absolute bottom-0 left-0 right-0 p-3 text-[10px] text-paper/80 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 leading-tight">
                    {p.caption}
                  </span>
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-brass/30 rounded-xl transition-all duration-500" />
                </a>
              ),
          )}
        </div>

        <div className="mt-12 text-center">
          <Button href={brand.social.instagram.url} target="_blank" rel="noopener" variant="outline">
            Seguir no Instagram
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </Button>
        </div>
      </Container>
    </Section>
  )
}
