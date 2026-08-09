/**
 * Helper de geolocalização robusto para o Ponto Eletrônico.
 *
 * Por que existe: no celular, `navigator.geolocation.getCurrentPosition` com
 * `enableHighAccuracy: true` pode demorar muito (fix de GPS) ou falhar, e no
 * iOS Safari os parâmetros `timeout`/`maximumAge` são ignorados — a chamada
 * "trava" para sempre sem um watchdog próprio. Aqui garantimos:
 *
 * 1. Watchdog próprio (setTimeout): a Promise SEMPRE resolve ou rejeita em
 *    tempo finito, então a UI nunca fica presa em "Registrando…".
 * 2. Timeouts generosos: o `timeout` do navegador começa a contar na hora da
 *    chamada e INCLUI o tempo que o usuário leva para responder ao prompt de
 *    permissão. Com timeout curto (ex.: 5s), um "Permitir" demorado já falha
 *    mesmo com o GPS funcionando.
 * 3. Retry com intervalo: chamar `getCurrentPosition` de novo imediatamente
 *    após um timeout pode reaproveitar o erro da chamada anterior (o provider
 *    do navegador ainda está processando). Uma pequena pausa entre tentativas
 *    evita esse "retry envenenado".
 * 4. Fallback de precisão: tenta primeiro alta precisão (GPS, melhor
 *    coordenada); se não conseguir, usa localização por rede (WiFi/antena) e,
 *    por fim, uma última tentativa aceitando posição em cache (resolve rápido
 *    em repetições próximas — o primeiro fix de GPS pode levar 20-30s).
 * 5. Permissão negada detectada na hora (Permissions API), sem esperar timeout.
 */

export type GeoErrorKind = 'unavailable' | 'denied' | 'timeout' | 'error'

export class GeoError extends Error {
  readonly kind: GeoErrorKind

  constructor(kind: GeoErrorKind, message: string) {
    super(message)
    this.name = 'GeoError'
    this.kind = kind
  }
}

/** Mensagem padrão para permissão negada (usada em mais de um ponto). */
const DENIED_MESSAGE =
  'Permissão de localização negada. Ative a localização/GPS do aparelho e a permissão do navegador, depois tente novamente.'

interface RawRequestOptions {
  enableHighAccuracy: boolean
  timeoutMs: number
  maximumAgeMs: number
  /** Tempo máximo total (watchdog) antes de rejeitar. Nunca pendura. */
  watchdogMs: number
}

/** Faz UMA chamada ao geolocation com watchdog próprio. Nunca pendura. */
function rawRequest(opts: RawRequestOptions): Promise<GeolocationPosition> {
  return new Promise<GeolocationPosition>((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new GeoError('unavailable', 'Seu dispositivo não permite localização.'))
      return
    }

    let settled = false
    let timer = 0

    const onSuccess = (pos: GeolocationPosition) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(pos)
    }

    const onError = (err: GeolocationPositionError) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(mapPositionError(err))
    }

    timer = window.setTimeout(() => {
      if (settled) return
      settled = true
      reject(new GeoError('timeout', 'A localização demorou demais para ser obtida.'))
    }, opts.watchdogMs)

    navigator.geolocation.getCurrentPosition(onSuccess, onError, {
      enableHighAccuracy: opts.enableHighAccuracy,
      timeout: opts.timeoutMs,
      maximumAge: opts.maximumAgeMs,
    })
  })
}

function mapPositionError(err: GeolocationPositionError): GeoError {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return new GeoError('denied', DENIED_MESSAGE)
    case err.POSITION_UNAVAILABLE:
      return new GeoError(
        'unavailable',
        'Não foi possível identificar a sua localização no momento.',
      )
    case err.TIMEOUT:
      return new GeoError('timeout', 'A localização demorou demais para ser obtida.')
    default:
      return new GeoError('error', 'Não foi possível obter a localização. Tente novamente.')
  }
}

/** Estado da permissão de geolocalização, quando o navegador expõe via Permissions API. */
type PermissionState = 'granted' | 'prompt' | 'denied' | 'unsupported'

async function checkPermissionState(): Promise<PermissionState> {
  try {
    const perms = navigator.permissions
    if (!perms || typeof perms.query !== 'function') return 'unsupported'
    const res = await perms.query({ name: 'geolocation' })
    return res.state as PermissionState
  } catch {
    return 'unsupported'
  }
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

/**
 * Tentativas em ordem (da mais precisa para a mais tolerante).
 * - `timeout` do navegador cobre o prompt de permissão + fix; o `watchdog` é
 *   sempre um pouco maior para o navegador encerrar a chamada antes do retry.
 * - `maximumAge` permite reusar posição em cache (quase instantâneo em
 *   repetições próximas, sem nova espera de GPS).
 */
const ATTEMPTS: RawRequestOptions[] = [
  // 1º: GPS de alta precisão (melhor coordenada) — tempo generoso.
  { enableHighAccuracy: true, timeoutMs: 15_000, maximumAgeMs: 0, watchdogMs: 16_000 },
  // 2º: Por rede (WiFi/antena), aceita posição em cache de até 1 min.
  { enableHighAccuracy: false, timeoutMs: 12_000, maximumAgeMs: 60_000, watchdogMs: 13_000 },
  // 3º: Última chance: rede com cache de até 2 min (posição recente ainda vale
  //     para o ponto — o colaborador estava no local minutos antes).
  { enableHighAccuracy: false, timeoutMs: 15_000, maximumAgeMs: 120_000, watchdogMs: 16_000 },
]

/** Intervalo entre tentativas para não empilhar requisições no provider. */
const RETRY_DELAY_MS = 800

/**
 * Obtém a posição do dispositivo sem nunca travar a interface e sem desistir
 * por causa de timeout curto ou de um retry imediato.
 *
 * - Se a permissão já está negada, rejeita imediatamente (sem esperar timeout).
 * - Tenta até 3 estratégias (GPS → rede → rede com cache). Só a permissão
 *   negada interrompe o fluxo; timeout/erro/indisponível caem para a próxima.
 */
export async function getUserPosition(): Promise<GeolocationPosition> {
  if (!navigator.geolocation) {
    throw new GeoError(
      'unavailable',
      'Seu dispositivo não permite localização. Use um navegador com GPS (celular) ou conecte o computador à internet e permita o acesso à localização.',
    )
  }

  const permission = await checkPermissionState()
  if (permission === 'denied') {
    throw new GeoError('denied', DENIED_MESSAGE)
  }

  let teveTimeout = false
  for (let i = 0; i < ATTEMPTS.length; i += 1) {
    try {
      return await rawRequest(ATTEMPTS[i])
    } catch (err) {
      const geoErr =
        err instanceof GeoError ? err : new GeoError('error', 'Não foi possível obter a localização. Tente novamente.')
      // Permissão negada é definitiva: não adianta tentar de novo.
      if (geoErr.kind === 'denied') throw geoErr
      if (geoErr.kind === 'timeout') teveTimeout = true
      // Pequena pausa antes de tentar de novo (evita retry envenenado).
      if (i < ATTEMPTS.length - 1) await delay(RETRY_DELAY_MS)
    }
  }

  // Todas as tentativas falharam: mensagem final acionável.
  throw new GeoError(
    'unavailable',
    teveTimeout
      ? 'A localização demorou demais para ser obtida. Aproxime-se de uma janela ou área aberta, conecte-se a uma rede (Wi-Fi ou dados móveis) e tente novamente.'
      : 'Não foi possível identificar a sua localização. Ative a localização/GPS do aparelho, permita o acesso do navegador à localização e tente novamente.',
  )
}
