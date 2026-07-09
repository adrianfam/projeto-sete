import { useEffect, useRef, useState } from 'react'

/* -------------------------------------------------------------------------- */
/*  Sistema compartilhado de observer + scroll listener                       */
/*  Um único IntersectionObserver e um único scroll listener com rAF         */
/*  atendem todas as instâncias do hook, evitando N observers + N listeners. */
/* -------------------------------------------------------------------------- */

interface Entry {
  el: HTMLElement
  speed: number
  setOffsetY: (v: number) => void
}

const entries = new Set<Entry>()
let observer: IntersectionObserver | null = null
let ticking = false
let scrollListenerAttached = false

function updateOffsets() {
  ticking = false
  const vh = window.innerHeight
  const halfVh = vh * 0.5
  for (const entry of entries) {
    const rect = entry.el.getBoundingClientRect()
    const center = rect.top + rect.height / 2
    const distance = center - vh / 2
    const normalized = Math.max(-1, Math.min(1, distance / halfVh))
    entry.setOffsetY(normalized * 15 * entry.speed * 25)
  }
}

function onScroll() {
  if (!ticking) {
    window.requestAnimationFrame(updateOffsets)
    ticking = true
  }
}

function ensureSharedObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (observed) => {
        for (const { isIntersecting, target } of observed) {
          for (const entry of entries) {
            if (entry.el === target) {
              // Quando um elemento entra na viewport, liga o scroll listener
              // Quando sai, desliga se não houver mais elementos visíveis
              if (isIntersecting) {
                if (!scrollListenerAttached) {
                  window.addEventListener('scroll', onScroll, { passive: true })
                  scrollListenerAttached = true
                }
                // Atualiza imediatamente ao entrar
                const rect = entry.el.getBoundingClientRect()
                const vh = window.innerHeight
                const center = rect.top + rect.height / 2
                const distance = center - vh / 2
                const normalized = Math.max(-1, Math.min(1, distance / (vh * 0.5)))
                entry.setOffsetY(normalized * 15 * entry.speed * 25)
              }
              break
            }
          }
        }
        // Se nenhum elemento mais estiver visível, remove o scroll listener
        let anyVisible = false
        for (const entry of entries) {
          const rect = entry.el.getBoundingClientRect()
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            anyVisible = true
            break
          }
        }
        if (!anyVisible && scrollListenerAttached) {
          window.removeEventListener('scroll', onScroll)
          scrollListenerAttached = false
        }
      },
      { threshold: 0 },
    )
  }
  return observer
}

/**
 * Hook de parallax suave baseado em scroll.
 * Usa um IntersectionObserver e scroll listener COMPARTILHADOS entre
 * todas as instâncias para máxima performance (1 observer + 1 listener).
 *
 * @param speed Fator de velocidade (0.03 = 3% da distância da viewport)
 * @returns { ref, offsetY } — ref para anexar ao container, offsetY para aplicar
 */
export function useParallax(speed = 0.04) {
  const ref = useRef<HTMLDivElement>(null)
  const [offsetY, setOffsetY] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const entry: Entry = { el, speed, setOffsetY }
    entries.add(entry)

    const obs = ensureSharedObserver()
    obs.observe(el)

    return () => {
      entries.delete(entry)
      obs.unobserve(el)
      if (entries.size === 0 && scrollListenerAttached) {
        window.removeEventListener('scroll', onScroll)
        scrollListenerAttached = false
      }
    }
  }, [speed])

  return { ref, offsetY }
}
