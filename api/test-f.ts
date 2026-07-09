// Teste mínimo: Fastify puro, sem plugins, sem Supabase
import Fastify from 'fastify'

const app = Fastify({ trustProxy: true })

app.get('/api/ping', async () => ({ pong: true }))

export default async function handler(req: any, res: any) {
  await app.ready()
  app.server.emit('request', req, res)
}
