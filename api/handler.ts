// Adaptador Vercel Serverless.
// Rewrite explícita no vercel.json roteia /api/:path* → /api/handler?__path=:path*
// Este handler restaura a URL original para o Fastify.

import type { IncomingMessage, ServerResponse } from 'node:http'
import { buildServer } from './_src/server.js'

let appPromise: ReturnType<typeof buildServer> | null = null

async function getApp() {
  if (!appPromise) appPromise = buildServer()
  return appPromise
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  // Restaura URL original a partir do __path passado pela rewrite
  if (req.url) {
    const idx = req.url.indexOf('?__path=')
    if (idx !== -1) {
      const qs = req.url.slice(idx + 1)
      const params = new URLSearchParams(qs)
      const originalPath = params.get('__path')
      params.delete('__path')
      const rest = params.toString()
      req.url = '/api/' + (originalPath ?? '') + (rest ? '?' + rest : '')
    }
  }

  const app = await getApp()
  await app.ready()
  app.server.emit('request', req, res)
}

export const config = {
  maxDuration: 20,
}
