/**
 * Gera `dist/precache-manifest.js` com os assets do build (JS/CSS com hash)
 * referenciados pelo index.html. O service worker importa este arquivo e
 * pré-cacheia o "app shell" — offline funcional já na primeira visita.
 *
 * Uso: roda automaticamente após `vite build` (ver script "build" do web).
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dist = fileURLToPath(new URL('../dist/', import.meta.url))
const indexPath = `${dist}index.html`

const html = readFileSync(indexPath, 'utf8')

// Extrai /assets/*.js e /assets/*.css referenciados no index.html
const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map((m) => m[1])
const unique = [...new Set(assets)]

mkdirSync(dist, { recursive: true })
writeFileSync(
  `${dist}precache-manifest.js`,
  `// Gerado em build por scripts/gen-precache.mjs — não edite.\n` +
    `self.PRECACHE_ASSETS = ${JSON.stringify(unique, null, 2)}\n`,
)
console.log(`✓ precache-manifest.js gerado com ${unique.length} assets`)
