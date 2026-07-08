import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Button } from '@/components/ui/Button'
import { useApi } from '@/hooks/useApi'
import { Link } from 'react-router-dom'
import { formatDate } from '@/lib/utils'

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
    <Section id="blog" tone="cream">
      <Container>
        <SectionHeading
          eyebrow="Blog"
          title="Tendências em marcenaria e arquitetura."
          intro="Conteúdo para inspirar quem planeja ambientes de alto padrão."
          align="center"
        />

        {status === 'loading' && <p className="mt-12 text-center text-smoke">Carregando…</p>}
        {status === 'error' && (
          <p className="mt-12 text-center text-smoke">Em breve novos artigos por aqui.</p>
        )}

        {items.length === 0 && status === 'success' && (
          <p className="mt-12 text-center text-smoke">Nenhum artigo publicado ainda.</p>
        )}

        {items.length > 0 && (
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {items.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 0.08}>
                <Link to={`/blog/${p.slug}`} className="group flex h-full flex-col">
                  <div className="aspect-[3/2] overflow-hidden border border-mist/40 bg-graphite">
                    {p.cover_image_url && (
                      <img
                        src={p.cover_image_url}
                        alt={p.title}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-700 ease-refined group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <p className="mt-4 text-xs uppercase tracking-eyebrow text-brass">
                    {p.reading_minutes ? `${p.reading_minutes} min de leitura` : 'Artigo'}
                  </p>
                  <h3 className="mt-1 font-serif text-xl text-ink">{p.title}</h3>
                  {p.excerpt && <p className="mt-2 text-sm text-smoke line-clamp-3">{p.excerpt}</p>}
                  <p className="mt-3 text-xs text-smoke">{formatDate(p.published_at)}</p>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Button to="/blog" variant="ghost">
            Ler todos os artigos
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
