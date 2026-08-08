import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Evento `beforeinstallprompt` — não padronizado (Chrome/Edge/Android).
 * Disparado quando o site atende os critérios de instalabilidade.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean }

const IS_IOS =
  typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as NavigatorWithStandalone).standalone === true
  )
}

/**
 * Status de instalação do PWA:
 * - `canInstall`: navegador disparou beforeinstallprompt (botão real de instalar);
 * - `installed`: rodando em modo standalone (já instalado);
 * - `isIOS`: Safari iOS (não tem beforeinstallprompt — mostrar instruções).
 */
export function usePwaInstall() {
  const [canInstall, setCanInstall] = useState(false)
  const [installed, setInstalled] = useState(() => isStandalone())
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      setCanInstall(true)
    }
    const onInstalled = () => {
      setInstalled(true)
      setCanInstall(false)
      deferredPrompt.current = null
    }
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<boolean> => {
    const event = deferredPrompt.current
    if (!event) return false
    deferredPrompt.current = null
    setCanInstall(false)
    await event.prompt()
    const choice = await event.userChoice
    return choice.outcome === 'accepted'
  }, [])

  return { canInstall, installed, isIOS: IS_IOS, promptInstall }
}

/**
 * Detecção de nova versão do app (service worker atualizado).
 *
 * Fluxo: quando o SW novo termina de instalar e fica "waiting", expõe
 * `updateAvailable`. Ao clicar em "Atualizar", envia `SKIP_WAITING` para o SW,
 * que ativa a nova versão; o evento `controllerchange` recarrega a página.
 */
export function usePwaUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const registrationRef = useRef<ServiceWorkerRegistration | null>(null)
  const refreshingRef = useRef(false)
  const updateRequestedRef = useRef(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Recarrega a página apenas quando o usuário pediu a atualização
    // (clients.claim() no 1º acesso também dispara controllerchange —
    //  sem este guard, um visitante novo tomaria um reload inesperado).
    const onControllerChange = () => {
      if (refreshingRef.current) return
      if (!updateRequestedRef.current) return
      refreshingRef.current = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    let active = true
    navigator.serviceWorker.ready
      .then((reg) => {
        if (!active) return
        registrationRef.current = reg

        // SW novo já estava waiting (atualização de uma visita anterior)
        if (reg.waiting && navigator.serviceWorker.controller) {
          setUpdateAvailable(true)
        }

        const onUpdateFound = () => {
          const newWorker = reg.installing
          if (!newWorker) return
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
            }
          })
        }
        reg.addEventListener('updatefound', onUpdateFound)

        // Verifica atualizações nesta visita e depois a cada hora
        reg.update().catch(() => {})
        intervalRef.current = window.setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000)
      })
      .catch(() => {})

    return () => {
      active = false
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current)
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
    }
  }, [])

  const applyUpdate = useCallback(() => {
    const reg = registrationRef.current
    if (!reg) return

    const postSkipWaiting = (worker: ServiceWorker) => {
      updateRequestedRef.current = true
      worker.postMessage({ type: 'SKIP_WAITING' })
    }

    const newWorker = reg.waiting ?? reg.installing
    if (newWorker) {
      if (newWorker.state === 'installed') {
        postSkipWaiting(newWorker)
      } else if (newWorker.state === 'installing') {
        // Ainda instalando: ativa assim que concluir
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') postSkipWaiting(newWorker)
        })
      }
    } else {
      reg.update().catch(() => {})
    }
  }, [])

  return { updateAvailable, applyUpdate }
}
