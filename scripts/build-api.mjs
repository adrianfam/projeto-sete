// Build script para a API: compila _src/ → .js para Vercel
// Usa esbuild com --bundle para inline de todo o código local (incluindo
// @projeto-sete/shared), mantendo apenas pacotes npm como external.

import * as esbuild from 'esbuild'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

// --- paths absolutos (independentes de CWD) ---
const __dirname = dirname(fileURLToPath(import.meta.url))
const root = resolve(__dirname, '..') // raiz do projeto

const API_SRC_ENTRY = resolve(root, 'api/_src/server.ts')
const API_SRC_OUT = resolve(root, 'api/_src/server.js')
const STANDALONE_ENTRY = resolve(root, 'api/_src/standalone.ts')
const STANDALONE_OUT = resolve(root, 'api/_src/standalone.js')
const SHARED_ENTRY = resolve(root, 'shared/dist/index.js')

// Pacotes npm (resolvidos de node_modules em runtime).
// @projeto-sete/shared NÃO está aqui — inlineado via plugin + --bundle.
const external = [
  'fastify',
  '@fastify/cors',
  '@fastify/helmet',
  '@fastify/rate-limit',
  '@supabase/supabase-js',
  'zod',
  'fastify-plugin',
]

// Plugin que resolve @projeto-sete/shared para shared/dist/index.js.
// O --bundle segue os imports relativos (./schemas/index, etc.) e inlineia tudo.
const sharedPlugin = {
  name: 'shared-pkg',
  setup(build) {
    build.onResolve({ filter: /^@projeto-sete\/shared$/ }, () => {
      return { path: SHARED_ENTRY }
    })
  },
}

async function main() {
  // 1. Bundle server.ts → server.js (inlineia shared + dependências)
  await esbuild.build({
    entryPoints: [API_SRC_ENTRY],
    outfile: API_SRC_OUT,
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'es2022',
    external,
    plugins: [sharedPlugin],
    sourcemap: 'linked',
  })

  // 2. standalone.ts (dev local, opcional para Vercel)
  try {
    await esbuild.build({
      entryPoints: [STANDALONE_ENTRY],
      outfile: STANDALONE_OUT,
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'es2022',
      external,
      plugins: [sharedPlugin],
      sourcemap: 'linked',
    })
  } catch {
    console.warn('[build] standalone.ts opcional, ignorado')
  }

  console.log('✓ api/_src/ compilado com sucesso')
}

main().catch((err) => {
  console.error('✗ Erro ao compilar api/_src:', err)
  process.exit(1)
})
