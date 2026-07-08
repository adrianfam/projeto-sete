import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { adminGuard } from '../lib/auth'

export const instagramRoutes: FastifyPluginAsync = async (app) => {
  // Galeria pública (manual — alimentada pela equipe).
  app.get('/instagram', async (_req, reply) => {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('instagram_posts')
      .select('id,caption,image_url,post_url,aspect_ratio,posted_at')
      .eq('is_published', true)
      .order('posted_at', { ascending: false })
      .limit(24)
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  app.post('/instagram', { preHandler: adminGuard }, async (req, reply) => {
    const body = req.body as Record<string, unknown>
    const payload = {
      caption: body.caption as string | null,
      image_url: body.image_url as string,
      post_url: body.post_url as string | null,
      aspect_ratio: (body.aspect_ratio as string) ?? 'square',
      posted_at: body.posted_at as string,
      is_published: body.is_published ?? true,
    }
    const sb = getSupabaseAdmin()
    const { data, error } = await sb.from('instagram_posts').insert(payload).select().single()
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(201).send({ item: data })
  })

  app.delete('/instagram/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const sb = getSupabaseAdmin()
    const { error } = await sb.from('instagram_posts').delete().eq('id', id)
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(204).send()
  })
}
