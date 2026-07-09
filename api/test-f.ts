// Teste: testa cada plugin individualmente para achar o culpado
import Fastify from 'fastify'

async function testPlugin(name: string, loader: () => Promise<any>) {
  try {
    const mod = await loader()
    const app = Fastify()
    await app.register(mod.default || mod)
    await app.ready()
    return { name, ok: true }
  } catch (e: any) {
    return { name, ok: false, error: e?.message ?? String(e) }
  }
}

export default async function handler(req: any, res: any) {
  const results = await Promise.all([
    testPlugin('cors', () => import('./_src/plugins/cors')),
    testPlugin('helmet', () => import('./_src/plugins/helmet')),
    testPlugin('rate-limit', () => import('./_src/plugins/rateLimit')),
    testPlugin('errorHandler', () => import('./_src/plugins/errorHandler')),
  ])

  const allOk = results.every(r => r.ok)
  res.status(allOk ? 200 : 500).json({ ok: allOk, results })
}
