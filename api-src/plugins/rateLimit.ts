import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'

export default fp(async (app) => {
  // In-memory em serverless (cada instância tem o seu contador).
  // Se escalar, trocar por Upstash Redis (@upstash/ratelimit).
  await app.register(rateLimit, {
    max: 30,
    timeWindow: '1 minute',
    // Rotas sensíveis têm limites próprios definidos inline.
  })
})
