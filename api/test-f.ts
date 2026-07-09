// Teste: Fastify + plugins, sem routes/Supabase/shared
import Fastify from 'fastify'
import corsPlugin from './_src/plugins/cors'
import helmetPlugin from './_src/plugins/helmet'
import rateLimitPlugin from './_src/plugins/rateLimit'
import errorPlugin from './_src/plugins/errorHandler'

async function buildApp() {
  const app = Fastify({ trustProxy: true })
  await app.register(corsPlugin)
  await app.register(helmetPlugin)
  await app.register(rateLimitPlugin)
  await app.register(errorPlugin)
  app.get('/api/ping', async () => ({ pong: true, plugins: true }))
  return app
}

let appPromise: ReturnType<typeof buildApp> | null = null

async function getApp() {
  if (!appPromise) appPromise = buildApp()
  return appPromise
}

export default async function handler(req: any, res: any) {
  const app = await getApp()
  await app.ready()
  app.server.emit('request', req, res)
}
