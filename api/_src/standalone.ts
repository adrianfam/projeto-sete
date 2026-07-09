// Carrega .env (dotenvx auto-loader busca na árvore de diretórios)
import 'dotenv/config'
import { buildServer } from './server'

const PORT = Number(process.env.PORT ?? 3001)
const HOST = process.env.HOST ?? '0.0.0.0'

async function start() {
  const app = await buildServer()
  try {
    await app.listen({ port: PORT, host: HOST })
    app.log.info(`API Projeto Sete rodando em http://${HOST}:${PORT}`)
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

void start()
