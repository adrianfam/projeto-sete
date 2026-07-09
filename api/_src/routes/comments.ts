import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { commentInputSchema, commentModerationSchema } from '@projeto-sete/shared'
import { adminGuard } from '../lib/auth'

export const commentRoutes: FastifyPluginAsync = async (app) => {
  // Comentários aprovados por post (público).
  app.get('/comments/:postId', async (req, reply) => {
    const { postId } = req.params as { postId: string }
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('comments')
      .select('id,parent_id,author_name,body,created_at')
      .eq('blog_post_id', postId)
      .eq('status', 'approved')
      .is('deleted_at', null)
      .order('created_at', { ascending: true })
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  // Envio público (status=pending). Rate-limit apertado + honeypot.
  app.post<{ Params: { slug: string } }>(
    '/blog/:slug/comments',
    { config: { rateLimit: { max: 3, timeWindow: '10 minutes' } } },
    async (req, reply) => {
      const body = req.body as Record<string, unknown>
      // Honeypot: campo "website" preenchido => bot.
      if (body.website && String(body.website).length > 0) {
        return reply.code(202).send({ ok: true }) // silenciosamente aceito e descartado
      }

      const input = commentInputSchema.omit({ website: true }).parse({
        authorName: body.authorName,
        authorEmail: body.authorEmail,
        body: body.body,
        parentId: body.parentId ?? null,
      })

      const { slug } = req.params
      const sb = getSupabaseAdmin()
      const { data: post } = await sb
        .from('blog_posts')
        .select('id')
        .eq('slug', slug)
        .eq('is_published', true)
        .is('deleted_at', null)
        .maybeSingle()
      if (!post) return reply.code(404).send({ message: 'Artigo não encontrado.' })

      const { error } = await sb.from('comments').insert({
        blog_post_id: post.id,
        parent_id: input.parentId ?? null,
        author_name: input.authorName,
        author_email: input.authorEmail,
        body: input.body,
        status: 'pending',
        ip: (req.ip ?? null) as never,
        user_agent: req.headers['user-agent'] ?? null,
      })
      if (error) return reply.code(400).send({ message: error.message })
      return reply.code(201).send({ ok: true, message: 'Comentário enviado para moderação.' })
    },
  )

  // --- Admin: fila + moderação ---
  app.get('/admin/comments', { preHandler: adminGuard }, async (req, reply) => {
    const status = (req.query as { status?: string }).status ?? 'pending'
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('comments')
      .select('id,blog_post_id,author_name,author_email,body,status,created_at')
      .eq('status', status)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  app.patch('/admin/comments/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const input = commentModerationSchema.parse(req.body)
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('comments')
      .update({ status: input.status, moderated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .maybeSingle()
    if (error) return reply.code(400).send({ message: error.message })
    if (!data) return reply.code(404).send({ message: 'Comentário não encontrado.' })
    return { comment: data }
  })

  app.delete('/admin/comments/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const sb = getSupabaseAdmin()
    const { error } = await sb.from('comments').update({ deleted_at: new Date().toISOString() }).eq('id', id)
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(204).send()
  })
}
