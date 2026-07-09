// Diagnóstico: verifica se api/_src/server.js existe no runtime
import { readdirSync, accessSync } from 'node:fs'

export default async function handler(req: any, res: any) {
  const cwd = process.cwd()
  const results: Record<string, any> = {}

  // Tenta listar api/ se existir
  try {
    results['cwd'] = cwd
    results['cwd_files'] = readdirSync(cwd)
  } catch (e: any) {
    results['cwd_error'] = e.message
  }

  // Tenta listar o dir pai ( /var/task ou similar)
  try {
    const parent = cwd.replace(/\/[^/]+$/, '') // parent dir
    results['parent'] = parent
    results['parent_files'] = readdirSync(parent)
  } catch (e: any) {
    results['parent_error'] = e.message
  }

  // Verifica se api/ existe
  const pathsToCheck = [
    cwd + '/api',
    cwd + '/api/_src',
    cwd + '/api/_src/server.js',
    cwd + '/_src',
    cwd + '/_src/server.js',
  ]

  for (const p of pathsToCheck) {
    try {
      accessSync(p)
      results[p] = 'EXISTS'
    } catch {
      results[p] = 'NOT_FOUND'
    }
  }

  // Tenta importar server.js dinamicamente
  try {
    const mod = await import(cwd + '/_src/server.js')
    results['import_server'] = 'OK'
  } catch (e: any) {
    results['import_server'] = `FAILED: ${e.message}`
  }

  res.status(200).json(results)
}
