import type { FastifyPluginAsync } from 'fastify'
import { supabaseConfigured } from '../lib/supabaseAdmin'

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
    time: new Date().toISOString(),
    supabaseConfigured: supabaseConfigured(),
  }))
}
