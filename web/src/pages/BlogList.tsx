import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/ui/Container'
import { LoadingState } from '@/components/ui/LoadingState'
import { useApi } from '@/hooks/useApi'
import { BlogCard } from '@/features/blog/BlogCard'
import type { BlogCardItem } from '@/features/blog/BlogCard'

interface BlogItem extends BlogCardItem {
  tags: string[] | null
  author: string | null
}
type ApiResponse = { items: BlogItem[] } | BlogItem[]

export function BlogList() {
  const [tag, setTag] = useState<string | undefined>(undefined)
  const path = `/blog?limit=20${tag ? `&tag=${encodeURIComponent(tag)}` : ''}`
  const { data, status } = useApi<ApiResponse>(path)
  const items = normalize(data)
  const tags = collectTags(items)

  return (
    <>
      <Seo
        title="Blog — Projeto Sete"
        description="Tendências, materiais e bastidores da marcenaria de alto padrão. Artigos da Projeto Sete."
        path="/blog"
      />
      <Container className="pt-32">
        <div className="max-w-2xl">
          <p className="eyebrow">Conteúdo</p>
          <h1 className="mt-3 font-serif text-5xl">Blog</h1>
          <p className="mt-6 text-lg text-smoke">
            Tendências em marcenaria, design de interiores e arquitetura de alto padrão.
          </p>
        </div>

        {tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            <button
              onClick={() => setTag(undefined)}
              className="border border-mist/60 px-3 py-1 text-sm hover:border-brass"
            >
              Todos
            </button>
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className="border border-mist/60 px-3 py-1 text-sm hover:border-brass"
              >
                {t}
              </button>
            ))}
          </div>
        )}

        {status === 'loading' && <LoadingState className="py-24" />}
        {status === 'error' && <p className="py-24 text-center text-smoke">Em breve novos artigos.</p>}

        {items.length === 0 && status !== 'loading' && status !== 'error' && (
          <p className="py-24 text-center text-smoke">Nenhum artigo publicado ainda.</p>
        )}

        {items.length > 0 && (
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p, i) => (
              <BlogCard key={p.id} post={p} index={i} aspect="16/9" />
            ))}
          </div>
        )}
      </Container>
    </>
  )
}

function normalize(data: ApiResponse | null): BlogItem[] {
  if (!data) return []
  return Array.isArray(data) ? data : data.items ?? []
}
function collectTags(items: BlogItem[]): string[] {
  const set = new Set<string>()
  for (const i of items) for (const t of i.tags ?? []) set.add(t)
  return [...set].sort()
}
