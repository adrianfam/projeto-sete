import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { portfolioQuerySchema, portfolioItemInputSchema } from '@projeto-sete/shared'
import { adminGuard } from '../lib/auth'

export const portfolioRoutes: FastifyPluginAsync = async (app) => {
  // Lista pública publicados.
  app.get('/portfolio', async (req, reply) => {
    const q = portfolioQuerySchema.parse(req.query)
    const sb = getSupabaseAdmin()
    let query = sb
      .from('portfolio_items')
      .select('id,title,slug,summary,cover_image_url,project_type,is_featured,location,year,area_m2,position,published_at')
      .is('deleted_at', null)
      .eq('is_published', true)
      .order('position', { ascending: true })
      .range(q.offset, q.offset + q.limit - 1)

    if (q.projectType) query = query.eq('project_type', q.projectType)
    if (q.featured) query = query.eq('is_featured', true)

    const { data, error } = await query
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  // Detalhe público por slug.
  app.get('/portfolio/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string }
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('portfolio_items')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .is('deleted_at', null)
      .maybeSingle()
    if (error) return reply.code(500).send({ message: error.message })
    if (!data) return reply.code(404).send({ message: 'Projeto não encontrado.' })
    return { item: data }
  })

  // --- Admin CRUD ---
  app.post('/portfolio', { preHandler: adminGuard }, async (req, reply) => {
    const input = portfolioItemInputSchema.parse(req.body)
    const sb = getSupabaseAdmin()
    const { publishedAt, ...rest } = input
    const payload = {
      ...rest,
      published_at: input.isPublished ? publishedAt ?? new Date().toISOString() : null,
    }
    const { data, error } = await sb.from('portfolio_items').insert(payload).select().single()
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(201).send({ item: data })
  })

  app.patch('/portfolio/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const input = portfolioItemInputSchema.partial().parse(req.body)
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('portfolio_items')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .maybeSingle()
    if (error) return reply.code(400).send({ message: error.message })
    if (!data) return reply.code(404).send({ message: 'Item não encontrado.' })
    return { item: data }
  })

  app.delete('/portfolio/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const sb = getSupabaseAdmin()
    const { error } = await sb
      .from('portfolio_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(204).send()
  })
}
