import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'

// PWA: registra o service worker somente em produção.
// Em dev o SW não é registrado para não interferir no HMR do Vite.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // PWA é melhoria progressiva — falha silenciosa é aceitável.
    })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
