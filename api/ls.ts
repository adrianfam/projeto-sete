// Diagnóstico: lista arquivos no runtime da Vercel
import fs from 'node:fs'
import path from 'node:path'

function listDir(dir: string, depth = 0): string[] {
  const results: string[] = []
  if (depth > 3) return results
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      results.push(fullPath)
      if (entry.isDirectory()) {
        results.push(...listDir(fullPath, depth + 1))
      }
    }
  } catch {
    // ignore permission denied etc
  }
  return results
}

export default async function handler(req: any, res: any) {
  const files: Record<string, string[]> = {}

  for (const dir of ['/var/task/api', '/var/task', process.cwd()]) {
    files[dir] = listDir(dir)
  }

  // Also check specific files that should exist
  const checks: Record<string, boolean> = {
    '/var/task/api/_src': false,
    '/var/task/api/_src/server.js': false,
    '/var/task/api/_src/server.ts': false,
    '/var/task/api/_src/plugins/cors.js': false,
    cwd_api: false,
    cwd_api_src: false,
  }

  for (const key of Object.keys(checks)) {
    if (key.startsWith('/')) {
      try { fs.accessSync(key); checks[key] = true } catch {}
    } else if (key === 'cwd_api') {
      try { 
        const cwdFiles = fs.readdirSync(path.join(process.cwd()))
        checks[key] = true
        files['cwd'] = cwdFiles.map(f => path.join(process.cwd(), f))
      } catch {}
    } else if (key === 'cwd_api_src') {
      try {
        const p = path.join(process.cwd(), '_src')
        const cwdFiles = fs.readdirSync(p)
        checks[key] = true
        files['cwd/_src'] = cwdFiles.map(f => path.join(p, f))
      } catch {}
    }
  }

  let cwdFiles: string[] = []
  try { cwdFiles = fs.readdirSync(process.cwd()) } catch {}

  res.status(200).json({
    cwd: process.cwd(),
    files,
    checks,
    cwdFiles,
  })
}
