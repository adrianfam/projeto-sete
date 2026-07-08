import fp from 'fastify-plugin'
import cors from '@fastify/cors'

export default fp(async (app) => {
  const origin = process.env.APP_URL ?? 'http://localhost:5173'
  await app.register(cors, {
    origin: process.env.NODE_ENV === 'production' ? false : origin.split(','),
    credentials: true,
  })
})
