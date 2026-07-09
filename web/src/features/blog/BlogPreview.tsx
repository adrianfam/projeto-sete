import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { Button } from '@/components/ui/Button'
import { useApi } from '@/hooks/useApi'
import { BlogCard } from './BlogCard'
import type { BlogCardItem } from './BlogCard'

type ApiResponse = { items: BlogCardItem[] } | BlogCardItem[]

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
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden">
                <div className="aspect-[3/2] skeleton" />
                <div className="p-7 space-y-3">
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
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <ScrollReveal key={p.id} delay={i * 0.08}>
                <BlogCard post={p} index={i} />
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

function normalize(data: ApiResponse | null): BlogCardItem[] {
  if (!data) return []
  return Array.isArray(data) ? data : data.items ?? []
}
