/**
 * Service Worker — Projeto Sete (PWA)
 *
 * Estratégia (sem dependências, compatível com o build do Vite):
 * - Precache do shell (index.html, manifest, ícones) + assets do build
 *   (JS/CSS com hash via `precache-manifest.js`, gerado no build) → offline
 *   funcional já na primeira visita;
 * - Navegação (HTML do SPA): network-first, com fallback offline para o cache;
 * - Assets estáticos: stale-while-revalidate com limite de entradas;
 * - /api/* e requisições cross-origin (Supabase, fontes): sempre pela rede;
 * - Atualização controlada: a nova versão NÃO assume sozinha — ativa quando a
 *   página envia a mensagem SKIP_WAITING (banner "Atualizar") ou quando todas
 *   as abas do app forem fechadas.
 */
const CACHE = 'projeto-sete-v2'

// Assets do build (JS/CSS com hash) — gerado por scripts/gen-precache.mjs
let PRECACHE = []
try {
  importScripts('/precache-manifest.js')
  if (Array.isArray(self.PRECACHE_ASSETS)) PRECACHE = self.PRECACHE_ASSETS
} catch {
  // Sem o arquivo (dev/fallback): segue apenas com o shell estático.
}

const CORE = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-512.png',
  '/icons/apple-touch-icon.png',
]

// Limite de entradas no cache — evita crescimento infinito entre deploys.
const MAX_ENTRIES = 80

// URLs do shell (CORE + precache) que nunca são descartadas pela poda.
const PROTECTED_URLS = new Set([...CORE, ...PRECACHE])

self.addEventListener('install', (event) => {
  // add() individual com allSettled: a instalação não falha se um asset
  // opcional estiver indisponível no momento.
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => Promise.allSettled([...CORE, ...PRECACHE].map((url) => cache.add(url)))),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

// Ativa a nova versão sob demanda (acionado pelo banner "Atualizar")
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return // Supabase/fontes: fora do escopo
  if (url.pathname.startsWith('/api/')) return // API: sempre rede

  // Navegação (HTML do SPA) — network-first, offline usa o cache de '/'
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Só cacheia respostas válidas (nunca uma página de erro 4xx/5xx)
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put('/', copy)).catch(() => {})
          }
          return response
        })
        .catch(() => caches.match('/').then((cached) => cached || caches.match(request))),
    )
    return
  }

  // Assets estáticos — stale-while-revalidate com limite de entradas
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone()
            caches
              .open(CACHE)
              .then(async (cache) => {
                await cache.put(request, copy)
                // Descarta os itens não-protegidos mais antigos além do limite
                const keys = await cache.keys()
                const removable = keys.filter((k) => !PROTECTED_URLS.has(new URL(k.url).pathname))
                const extra = removable.length - MAX_ENTRIES
                if (extra > 0) {
                  await Promise.all(removable.slice(0, extra).map((k) => cache.delete(k)))
                }
              })
              .catch(() => {})
          }
          return response
        })
        .catch(() => cached)
      return cached || network
    }),
  )
})
