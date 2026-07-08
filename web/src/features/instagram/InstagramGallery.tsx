import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { useApi } from '@/hooks/useApi'
import { brand } from '@projeto-sete/shared'
import { cn } from '@/lib/utils'

interface InstagramPost {
  id: string
  caption: string | null
  image_url: string
  post_url: string | null
  aspect_ratio: 'square' | 'portrait' | 'landscape'
}

// Ratio → classes de aspect
const aspectClass: Record<InstagramPost['aspect_ratio'], string> = {
  square: 'aspect-square',
  portrait: 'aspect-[4/5]',
  landscape: 'aspect-[4/3]',
}

export function InstagramGallery() {
  const { data, status } = useApi<{ items: InstagramPost[] }>('/instagram')
  const items = data?.items ?? []

  return (
    <Section id="instagram" tone="light">
      <Container>
        <SectionHeading
          eyebrow="Instagram"
          title="Acompanhe @_projetosete"
          intro="Galeria manual de destaques. Para o feed ao vivo, siga-nos no Instagram."
          align="center"
        />

        {status === 'loading' && <p className="mt-12 text-center text-smoke">Carregando…</p>}

        {items.length === 0 ? (
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex aspect-square items-center justify-center border border-mist/40 bg-paper text-sm text-smoke"
              >
                @
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {items.slice(0, 6).map((p) => (
              <a
                key={p.id}
                href={p.post_url ?? brand.social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'group relative block overflow-hidden border border-mist/40 bg-graphite',
                  aspectClass[p.aspect_ratio] ?? 'aspect-square',
                )}
              >
                <img
                  src={p.image_url}
                  alt={p.caption ?? brand.social.instagram.handle}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover opacity-90 transition-all duration-500 ease-refined group-hover:opacity-100"
                />
                {p.caption && (
                  <span className="absolute inset-0 hidden items-end bg-gradient-to-t from-charcoal/80 to-transparent p-3 text-xs text-paper group-hover:flex">
                    {p.caption}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button href={brand.social.instagram.url} target="_blank" rel="noopener" variant="primary">
            Seguir no Instagram
          </Button>
        </div>
      </Container>
    </Section>
  )
}
