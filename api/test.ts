// Teste mínimo: função sem dependências externas
export default async function handler(req: any, res: any) {
  res.status(200).json({
    ok: true,
    message: 'Função Serverless funcionando!',
    node: process.version,
    env: {
      node_env: process.env.NODE_ENV ?? '(não definido)',
      supabase_url: process.env.SUPABASE_URL ? 'definido' : '(não definido)',
      app_url: process.env.APP_URL ?? '(não definido)',
    },
  })
}
