// Teste: importa server.js dinamicamente e captura erro exato
export default async function handler(req: any, res: any) {
  try {
    const { buildServer } = await import('./_src/server.js')
    const app = await buildServer()
    await app.ready()
    res.status(200).json({ ok: true })
  } catch (e: any) {
    res.status(500).json({
      ok: false,
      error: e?.message ?? String(e),
      stack: e?.stack?.split('\n').slice(0, 6).join('\n'),
      name: e?.name,
      code: e?.code,
    })
  }
}
