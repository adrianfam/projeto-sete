/**
 * Helper de geolocalização robusto para o Ponto Eletrônico.
 *
 * Por que existe: no celular, `navigator.geolocation.getCurrentPosition` com
 * `enableHighAccuracy: true` pode nunca concluir (fix de GPS demora ou falha
 * dentro de casa) e no iOS Safari os parâmetros `timeout`/`maximumAge` são
 * ignorados — a chamada "trava" para sempre. Aqui garantimos:
 *
 * 1. Watchdog próprio (setTimeout): a Promise SEMPRE resolve ou rejeita em
 *    tempo finito, então a UI nunca fica presa em "Registrando…".
 * 2. Fallback de precisão: tenta primeiro alta precisão (GPS, melhor
 *    coordenada) com timeout curto; se não conseguir, usa localização por
 *    rede (WiFi/antena), que resolve rápido mesmo sem sinal de GPS.
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

interface RawRequestOptions {
  enableHighAccuracy: boolean
  timeoutMs: number
  maximumAgeMs: number
  /** Tempo máximo total (watchdog) antes de rejeitar. */
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
      reject(new GeoError('timeout', 'A localização demorou demais. Tente novamente.'))
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
      return new GeoError(
        'denied',
        'Para registrar o ponto, precisamos da sua localização. Ative o GPS nas configurações do seu celular e tente novamente.',
      )
    case err.POSITION_UNAVAILABLE:
      return new GeoError(
        'unavailable',
        'Não foi possível encontrar a sua localização. Tente novamente em um local aberto.',
      )
    case err.TIMEOUT:
      return new GeoError('timeout', 'A localização demorou demais. Tente novamente.')
    default:
      return new GeoError('error', 'Não foi possível pegar a localização. Tente novamente.')
  }
}

/**
 * Obtém a posição do dispositivo sem nunca travar a interface.
 *
 * - Tenta alta precisão (GPS) com watchdog curto (~6s) para coordenadas exatas;
 * - Se falhar (timeout/erro/indisponível), faz fallback para localização por rede (~12s);
 * - Se o usuário negar a permissão, rejeita imediatamente com `GeoError`.
 */
export async function getUserPosition(): Promise<GeolocationPosition> {
  try {
    return await rawRequest({
      enableHighAccuracy: true,
      timeoutMs: 5000,
      maximumAgeMs: 0,
      watchdogMs: 6000,
    })
  } catch (firstErr) {
    // Só permissão negada interrompe: o fallback pediria a mesma permissão.
    // POSITION_UNAVAILABLE é muitas vezes temporário (GPS sem fix dentro de casa)
    // e a localização por rede (WiFi/antena) ainda pode funcionar.
    if (firstErr instanceof GeoError && firstErr.kind === 'denied') {
      throw firstErr
    }
    // Timeout/erro/indisponível: cai para localização rápida por rede.
    return rawRequest({
      enableHighAccuracy: false,
      timeoutMs: 10000,
      maximumAgeMs: 30_000,
      watchdogMs: 12_000,
    })
  }
}
