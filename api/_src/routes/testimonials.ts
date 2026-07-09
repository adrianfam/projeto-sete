import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { testimonialInputSchema } from '@projeto-sete/shared'
import { adminGuard } from '../lib/auth'
import { toSnake } from '../lib/case'

export const testimonialRoutes: FastifyPluginAsync = async (app) => {
  app.get('/testimonials', async (_req, reply) => {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('testimonials')
      .select('id,author,role,company,quote,rating,avatar_url')
      .eq('is_published', true)
      .order('position', { ascending: true })
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  app.post('/testimonials', { preHandler: adminGuard }, async (req, reply) => {
    const input = testimonialInputSchema.parse(req.body)
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('testimonials')
      .insert(toSnake(input))
      .select()
      .single()
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(201).send({ item: data })
  })

  app.patch('/testimonials/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const input = testimonialInputSchema.partial().parse(req.body)
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('testimonials')
      .update(toSnake({ ...input, updatedAt: new Date().toISOString() }))
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) return reply.code(400).send({ message: error.message })
    if (!data) return reply.code(404).send({ message: 'Depoimento não encontrado.' })
    return { item: data }
  })

  app.delete('/testimonials/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const sb = getSupabaseAdmin()
    const { error } = await sb.from('testimonials').delete().eq('id', id)
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(204).send()
  })
}
