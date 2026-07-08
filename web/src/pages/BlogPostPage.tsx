import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { Container } from '@/components/ui/Container'
import { LoadingState } from '@/components/ui/LoadingState'
import { Button } from '@/components/ui/Button'
import { useApi } from '@/hooks/useApi'
import { renderMarkdown } from '@/lib/markdown'
import { formatDate } from '@/lib/utils'
import { Comments } from '@/features/blog/Comments'

interface Comment {
  id: string
  parent_id: string | null
  author_name: string
  body: string
  created_at: string
}

interface BlogPostDTO {
  post: {
    id: string
    title: string
    slug: string
    excerpt: string | null
    body: string
    cover_image_url: string | null
    cover_alt: string | null
    reading_minutes: number | null
    tags: string[] | null
    author: string
    author_avatar_url: string | null
    published_at: string | null
    seo: { title?: string | null; description?: string | null } | null
  }
  comments: Comment[]
}

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const path = slug ? `/blog/${slug}` : null
  // Re-fetch key para forçar recarga após novo comentário.
  const [nonce, setNonce] = useState(0)
  const { data, status, error } = useApi<BlogPostDTO>(path ? `${path}?n=${nonce}` : '/blog/__missing__')

  const html = useMemo(() => renderMarkdown(data?.post?.body ?? ''), [data?.post?.body])

  if (status === 'loading') return <LoadingState className="pt-32" />
  if (status === 'error' || !data?.post)
    return (
      <Container className="pt-32 text-center">
        <p className="text-smoke">{error ?? 'Artigo não encontrado.'}</p>
        <Button to="/blog" variant="ghost" className="mt-6">
          Voltar ao blog
        </Button>
      </Container>
    )

  const { post } = data

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? undefined,
    image: post.cover_image_url ?? undefined,
    author: { '@type': 'Person', name: post.author },
    datePublished: post.published_at ?? undefined,
    dateModified: post.published_at ?? undefined,
  }

  return (
    <>
      <Seo
        title={post.seo?.title ?? `${post.title} — Projeto Sete`}
        description={post.seo?.description ?? post.excerpt ?? undefined}
        path={`/blog/${post.slug}`}
        image={post.cover_image_url ?? undefined}
        type="article"
        jsonLd={articleLd}
      />
      <article className="pt-32">
        <Container className="max-w-prose">
          <Link to="/blog" className="text-sm text-brass link-underline">
            ← Voltar ao blog
          </Link>
          <p className="mt-6 text-xs uppercase tracking-eyebrow text-brass">
            {post.reading_minutes ? `${post.reading_minutes} min de leitura` : 'Artigo'}
          </p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl text-balance">{post.title}</h1>
          <p className="mt-4 text-sm text-smoke">
            {post.author} · {formatDate(post.published_at)}
          </p>

          {post.cover_image_url && (
            <div className="mt-8 aspect-[16/9] overflow-hidden border border-mist/40">
              <img
                src={post.cover_image_url}
                alt={post.cover_alt ?? post.title}
                loading="eager"
                decoding="async"
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div
            className="prose-blog mt-10 text-ink"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Link
                  key={t}
                  to={`/blog?tag=${encodeURIComponent(t)}`}
                  className="border border-mist/60 px-3 py-1 text-xs text-smoke hover:border-brass"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}

          <hr className="my-12 border-mist/40" />

          <Comments
            slug={post.slug}
            comments={data.comments ?? []}
            onChanged={() => setNonce((n) => n + 1)}
          />
        </Container>
      </article>
    </>
  )
}
