import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { blogQuerySchema, blogPostInputSchema } from '@projeto-sete/shared'
import { adminGuard } from '../lib/auth'

export const blogRoutes: FastifyPluginAsync = async (app) => {
  // Lista pública (paginada, filtro por tag, busca).
  app.get('/blog', async (req, reply) => {
    const q = blogQuerySchema.parse(req.query)
    const sb = getSupabaseAdmin()
    let query = sb
      .from('blog_posts')
      .select('id,title,slug,excerpt,cover_image_url,cover_alt,reading_minutes,tags,author,author_avatar_url,published_at,is_featured')
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
      .range((q.page - 1) * q.limit, q.page * q.limit - 1)

    if (q.tag) query = query.contains('tags', [q.tag])
    if (q.q) {
      const text = q.q.trim()
      query = query.or(`title.ilike.%${text}%,excerpt.ilike.%${text}%`)
    }

    const { data, error, count } = await query
    if (error) return reply.code(500).send({ message: error.message })
    return {
      items: data ?? [],
      page: q.page,
      limit: q.limit,
      total: count ?? null,
    }
  })

  // Detalhe público + comentários aprovados.
  app.get('/blog/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string }
    const sb = getSupabaseAdmin()
    const { data: post, error } = await sb
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .is('deleted_at', null)
      .maybeSingle()
    if (error) return reply.code(500).send({ message: error.message })
    if (!post) return reply.code(404).send({ message: 'Artigo não encontrado.' })

    const { data: comments } = await sb
      .from('comments')
      .select('id,parent_id,author_name,body,created_at')
      .eq('blog_post_id', post.id)
      .eq('status', 'approved')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })

    return { post, comments: comments ?? [] }
  })

  // --- Admin CRUD ---
  app.post('/blog', { preHandler: adminGuard }, async (req, reply) => {
    const input = blogPostInputSchema.parse(req.body)
    const sb = getSupabaseAdmin()
    const payload = {
      ...input,
      reading_minutes: input.readingMinutes ?? estimateReadingMinutes(input.body),
      published_at: input.isPublished ? input.publishedAt ?? new Date().toISOString() : null,
    }
    const { data, error } = await sb.from('blog_posts').insert(payload).select().single()
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(201).send({ post: data })
  })

  app.patch('/blog/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const input = blogPostInputSchema.partial().parse(req.body)
    const sb = getSupabaseAdmin()
    const body = input.body
    const reading = body ? { reading_minutes: estimateReadingMinutes(body) } : {}
    const { data, error } = await sb
      .from('blog_posts')
      .update({ ...input, ...reading, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .maybeSingle()
    if (error) return reply.code(400).send({ message: error.message })
    if (!data) return reply.code(404).send({ message: 'Post não encontrado.' })
    return { post: data }
  })

  app.delete('/blog/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const sb = getSupabaseAdmin()
    const { error } = await sb.from('blog_posts').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(204).send()
  })
}

function estimateReadingMinutes(body: string): number {
  const words = body.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}
