import Fastify, { type FastifyInstance } from 'fastify'
import helmetPlugin from './plugins/helmet'
import corsPlugin from './plugins/cors'
import rateLimitPlugin from './plugins/rateLimit'
import errorPlugin from './plugins/errorHandler'

import { healthRoutes } from './routes/health'
import { portfolioRoutes } from './routes/portfolio'
import { caseStudyRoutes } from './routes/caseStudies'
import { testimonialRoutes } from './routes/testimonials'
import { instagramRoutes } from './routes/instagram'
import { blogRoutes } from './routes/blog'
import { commentRoutes } from './routes/comments'
import { contactRoutes } from './routes/contact'
import { uploadRoutes } from './routes/upload'
import { sitemapRoutes } from './routes/sitemap'
import { adminRoutes } from './routes/admin'
import { adminClientRoutes } from './routes/adminClient'
import { clienteRoutes } from './routes/cliente'
import { pontoRoutes } from './routes/ponto'
import { cronRoutes } from './routes/cron'

/** Constroi a instância Fastify (reutilizada por dev e pelo adapter Vercel). */
export async function buildServer(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: process.env.NODE_ENV !== 'production' ? { level: 'info' } : false,
    trustProxy: true,
  })

  await app.register(corsPlugin)
  await app.register(helmetPlugin)
  await app.register(rateLimitPlugin)
  await app.register(errorPlugin)

  // Todas as rotas sob /api
  await app.register(
    async (api) => {
      await api.register(healthRoutes)
      await api.register(portfolioRoutes)
      await api.register(caseStudyRoutes)
      await api.register(testimonialRoutes)
      await api.register(instagramRoutes)
      await api.register(blogRoutes)
      await api.register(commentRoutes)
      await api.register(contactRoutes)
      await api.register(uploadRoutes)
      await api.register(sitemapRoutes)
      await api.register(adminRoutes)
      await api.register(adminClientRoutes)
      await api.register(clienteRoutes)
      await api.register(pontoRoutes)
      await api.register(cronRoutes)
    },
    { prefix: '/api' },
  )

  return app
}
