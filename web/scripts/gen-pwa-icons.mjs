/**
 * Gera os ícones PNG do PWA a partir dos SVGs em web/public/icons.
 * Uso: node web/scripts/gen-pwa-icons.mjs
 * Depende do sharp (devDependency do pacote web).
 */
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const iconsDir = fileURLToPath(new URL('../public/icons/', import.meta.url))
mkdirSync(iconsDir, { recursive: true })

const targets = [
  { name: 'icon-192.png', size: 192, source: 'icon.svg' },
  { name: 'icon-512.png', size: 512, source: 'icon.svg' },
  { name: 'apple-touch-icon.png', size: 180, source: 'icon.svg' },
  { name: 'icon-maskable-512.png', size: 512, source: 'icon-maskable.svg' },
]

for (const { name, size, source } of targets) {
  const out = `${iconsDir}${name}`
  await sharp(`${iconsDir}${source}`).resize(size, size).png().toFile(out)
  console.log(`✓ ${name} (${size}px) ← ${source}`)
}
