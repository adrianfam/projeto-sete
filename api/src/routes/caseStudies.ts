import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { caseStudyInputSchema } from '@projeto-sete/shared'
import { adminGuard } from '../lib/auth'
import { toSnake } from '../lib/case'

export const caseStudyRoutes: FastifyPluginAsync = async (app) => {
  app.get('/cases', async (_req, reply) => {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('case_studies')
      .select(
        'id,title,slug,client,category,cover_image_url,results,is_featured,published_at',
      )
      .eq('is_published', true)
      .is('deleted_at', null)
      .order('published_at', { ascending: false })
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  app.get('/cases/:slug', async (req, reply) => {
    const { slug } = req.params as { slug: string }
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('case_studies')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .is('deleted_at', null)
      .maybeSingle()
    if (error) return reply.code(500).send({ message: error.message })
    if (!data) return reply.code(404).send({ message: 'Estudo de caso não encontrado.' })
    return { item: data }
  })

  app.post('/cases', { preHandler: adminGuard }, async (req, reply) => {
    const input = caseStudyInputSchema.parse(req.body)
    const sb = getSupabaseAdmin()
    const payload = toSnake({
      ...input,
      publishedAt: input.isPublished ? input.publishedAt ?? new Date().toISOString() : null,
    })
    const { data, error } = await sb.from('case_studies').insert(payload).select().single()
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(201).send({ item: data })
  })

  app.patch('/cases/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const input = caseStudyInputSchema.partial().parse(req.body)
    const sb = getSupabaseAdmin()
    const publishedAt =
      input.isPublished === undefined
        ? undefined
        : input.isPublished
          ? input.publishedAt ?? new Date().toISOString()
          : null
    const payload = toSnake({ ...input, publishedAt, updatedAt: new Date().toISOString() })
    const { data, error } = await sb
      .from('case_studies')
      .update(payload)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .maybeSingle()
    if (error) return reply.code(400).send({ message: error.message })
    if (!data) return reply.code(404).send({ message: 'Caso não encontrado.' })
    return { item: data }
  })

  app.delete('/cases/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const sb = getSupabaseAdmin()
    const { error } = await sb
      .from('case_studies')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(204).send()
  })
}
