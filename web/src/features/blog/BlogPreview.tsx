import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Button } from '@/components/ui/Button'
import { useApi } from '@/hooks/useApi'
import { Link } from 'react-router-dom'
import { formatDate } from '@/lib/utils'
import { BLOG_IMAGES } from '@/lib/images'

interface BlogPreviewItem {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_image_url: string | null
  reading_minutes: number | null
  published_at: string | null
}

type ApiResponse = { items: BlogPreviewItem[] } | BlogPreviewItem[]

export function BlogPreview() {
  const { data, status } = useApi<ApiResponse>('/blog?limit=3')
  const items = normalize(data)

  return (
    <Section id="blog" tone="charcoal">
      <Container>
        <SectionHeading
          eyebrow="Blog"
          title="Tendências em marcenaria e arquitetura."
          intro="Conteúdo para inspirar quem planeja ambientes de alto padrão."
          align="center"
        />

        {status === 'loading' && (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <div className="aspect-[3/2] skeleton" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-1/4 skeleton rounded" />
                  <div className="h-5 w-3/4 skeleton rounded" />
                  <div className="h-4 w-full skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === 'error' && (
          <p className="mt-12 text-center text-mist/50">Em breve novos artigos por aqui.</p>
        )}

        {items.length === 0 && status === 'success' && (
          <p className="mt-12 text-center text-mist/50">Nenhum artigo publicado ainda.</p>
        )}

        {items.length > 0 && (
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {items.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 0.08}>
                <Link to={`/blog/${p.slug}`} className="group flex h-full flex-col glass-card-hover rounded-xl overflow-hidden">
                  <div className="aspect-[3/2] overflow-hidden bg-graphite relative">
                    {p.cover_image_url ? (
                      <img
                        src={p.cover_image_url}
                        alt={p.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 ease-refined group-hover:scale-[1.05]"
                      />
                    ) : (
                      <img
                        src={BLOG_IMAGES[i % BLOG_IMAGES.length]}
                        alt={p.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 ease-refined group-hover:scale-[1.05]"
                      />
                    )}
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-brass/30 transition-all duration-500" />
                  </div>
                  <div className="flex flex-col flex-1 p-6">
                    <span className="text-[10px] uppercase tracking-wider text-brass">
                      {p.reading_minutes ? `${p.reading_minutes} min de leitura` : 'Artigo'}
                    </span>
                    <h3 className="mt-2 font-editorial text-xl text-paper group-hover:text-brass transition-colors duration-300">
                      {p.title}
                    </h3>
                    {p.excerpt && (
                      <p className="mt-2 text-sm text-mist/70 line-clamp-3 flex-1">{p.excerpt}</p>
                    )}
                    <p className="mt-4 text-xs text-mist/40">{formatDate(p.published_at)}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <Button to="/blog" variant="ghost">
            Ler todos os artigos
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </Container>
    </Section>
  )
}

function normalize(data: ApiResponse | null): BlogPreviewItem[] {
  if (!data) return []
  return Array.isArray(data) ? data : data.items ?? []
}
