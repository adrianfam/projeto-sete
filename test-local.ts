import { buildServer } from './api-src/server'

async function runTest() {
  try {
    const app = await buildServer()
    await app.ready()
    console.log('Fastify initialized successfully!')
    app.close()
  } catch (err: any) {
    console.error('Error initializing Fastify:', err)
  }
}

runTest()
