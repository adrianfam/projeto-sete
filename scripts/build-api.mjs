// Build script para a API: compila _src/ → .js para Vercel
// Porque a Vercel não inclui arquivos .ts de subdiretórios no runtime.

import * as esbuild from 'esbuild'

// Pacotes externos (resolvidos de node_modules em runtime).
// @projeto-sete/shared NÃO está aqui porque é workspace — o esbuild precisa
// inlineá-lo no bundle, senão o Node runtime não consegue resolvê-lo.
const external = [
  'fastify',
  '@fastify/cors',
  '@fastify/helmet',
  '@fastify/rate-limit',
  '@supabase/supabase-js',
  'zod',
  'fastify-plugin',
]

async function main() {
  // 1. Compila server.ts (e todas as suas dependências locais) para _src/server.js
  await esbuild.build({
    entryPoints: ['api/_src/server.ts'],
    outfile: 'api/_src/server.js',
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'es2022',
    external,
    sourcemap: 'linked',
  })

  // 2. Também compila standalone.ts (para dev local, não essencial para Vercel)
  try {
    await esbuild.build({
      entryPoints: ['api/_src/standalone.ts'],
      outfile: 'api/_src/standalone.js',
      bundle: true,
      platform: 'node',
      format: 'esm',
      target: 'es2022',
      external,
      sourcemap: 'linked',
    })
  } catch {
    // standalone é opcional para o deploy
  }

  console.log('✓ api/_src/ compilado com sucesso')
}

main().catch((err) => {
  console.error('✗ Erro ao compilar api/_src:', err)
  process.exit(1)
})
