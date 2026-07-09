// Adaptador Vercel Serverless.
// O frontend (Vite) chama /api/* que é roteado automaticamente para esta função.
// Usamos o framework handler nativo do Fastify para um proxy transparente.

import type { IncomingMessage, ServerResponse } from 'node:http'
import { buildServer } from './_src/server'

let appPromise: ReturnType<typeof buildServer> | null = null

async function getApp() {
  if (!appPromise) appPromise = buildServer()
  return appPromise
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const app = await getApp()
  await app.ready()
  // Fastify expõe o servidor HTTP interno; repassamos a request/response.
  app.server.emit('request', req, res)
}

export const config = {
  maxDuration: 20,
}
