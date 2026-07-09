// Teste de importação: importa de api-src/server
import { buildServer } from '../api-src/server'

export default async function handler(req: any, res: any) {
  try {
    const app = await buildServer()
    await app.ready()
    res.status(200).json({
      ok: true,
      message: 'Fastify inicializado com sucesso!',
      routes: app.printRoutes(),
    })
  } catch (err: any) {
    res.status(500).json({
      ok: false,
      message: 'Erro ao inicializar Fastify',
      error: err?.message ?? String(err),
      stack: err?.stack?.split?.('\n') ?? [],
    })
  }
}
