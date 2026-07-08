import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { requireAdmin } from '../lib/auth'

/** /api/auth/me + /api/admin/metrics */
export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/auth/me', async (req, reply) => {
    const session = await requireAdmin(req)
    if (!session) return reply.code(401).send({ message: 'Não autorizado.' })
    return { user: { id: session.userId, email: session.email, role: session.role } }
  })

  app.get('/admin/metrics', { preHandler: requireAdminAndGuard }, async (_req, reply) => {
    const sb = getSupabaseAdmin()
    const [posts, comments, portfolio, contact] = await Promise.all([
      sb.from('blog_posts').select('id', { count: 'exact', head: true }).eq('is_published', true).is('deleted_at', null),
      sb.from('comments').select('id', { count: 'exact', head: true }).eq('status', 'pending').is('deleted_at', null),
      sb.from('portfolio_items').select('id', { count: 'exact', head: true }).eq('is_published', true).is('deleted_at', null),
      sb.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    ])
    return {
      publishedPosts: posts.count ?? 0,
      pendingComments: comments.count ?? 0,
      portfolioItems: portfolio.count ?? 0,
      newMessages: contact.count ?? 0,
    }
  })
}

async function requireAdminAndGuard(req: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) {
  const session = await requireAdmin(req)
  if (!session) return reply.code(401).send({ message: 'Não autorizado.' })
}
