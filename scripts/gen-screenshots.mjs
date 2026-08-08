/**
 * Gera os screenshots do PWA (usados no prompt de instalação do Chrome).
 * Uso: node scripts/gen-screenshots.mjs
 * Variável opcional: SCREENSHOT_URL (default: produção).
 */
import { mkdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const SITE_URL = process.env.SCREENSHOT_URL ?? 'https://projeto-sete.vercel.app'
const outDir = fileURLToPath(new URL('../web/public/screenshots/', import.meta.url))
mkdirSync(outDir, { recursive: true })

const shots = [
  { name: 'desktop.png', width: 1280, height: 800 },
  { name: 'mobile.png', width: 750, height: 1334 },
]

const browser = await chromium.launch()
try {
  for (const { name, width, height } of shots) {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
    await page.goto(SITE_URL, { waitUntil: 'load', timeout: 60_000 })
    // Espera imagens/parallax assentarem antes de capturar
    await page.waitForTimeout(3000)
    await page.screenshot({ path: `${outDir}${name}`, animations: 'disabled' })
    await page.close()
    console.log(`✓ ${name} (${width}x${height}) ← ${SITE_URL}`)
  }
} finally {
  await browser.close()
}
