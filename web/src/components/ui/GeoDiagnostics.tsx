import { useState } from 'react'
import { diagnoseLocation, geoErrorCodeLabel, type GeoDiagnosticsInfo } from '@/lib/geo'

/**
 * Botão "Diagnóstico de localização" para as telas de ponto.
 * Roda um teste direto no navegador (sem o retry do app) e mostra o resultado
 * de forma legível — usamos isso para descobrir por que a localização falha.
 */
export function GeoDiagnostics({ dark = false }: { dark?: boolean }) {
  const [result, setResult] = useState<GeoDiagnosticsInfo | null>(null)
  const [running, setRunning] = useState(false)

  const run = async () => {
    setRunning(true)
    try {
      setResult(await diagnoseLocation())
    } catch (err) {
      // Defensivo: nunca deixa o diagnóstico sem resposta na tela.
      setResult({
        supported: 'geolocation' in navigator,
        secureContext: window.isSecureContext ?? false,
        permission: 'unsupported',
        userAgent: navigator.userAgent,
        probe: { ok: false, code: 0, message: err instanceof Error ? err.message : 'Erro inesperado no diagnóstico.' },
      })
    } finally {
      setRunning(false)
    }
  }

  const probeSummary = !result
    ? ''
    : !result.supported
      ? '❌ Este navegador não suporta geolocalização (navigator.geolocation indisponível).'
      : result.probe.ok && result.probe.coords
        ? `✅ O navegador conseguiu a posição: ${result.probe.coords.latitude.toFixed(5)}, ${result.probe.coords.longitude.toFixed(5)} (precisão ~${Math.round(result.probe.coords.accuracy)}m) em ${result.probe.elapsedMs}ms`
        : `❌ O navegador NÃO conseguiu a posição: código ${result.probe.code ?? '?'} (${geoErrorCodeLabel(result.probe.code)}) — ${result.probe.message ?? 'sem mensagem'} em ${result.probe.elapsedMs}ms`

  const dica =
    result && !result.probe.ok
      ? result.probe.code === 1
        ? 'Dica: o acesso está bloqueado. No Chrome, clique no cadeado da barra de endereço → "Configurações do site" → Localização → Permitir.'
        : 'Dica: o navegador não conseguiu obter a posição. No Windows: Configurações → Privacidade e segurança → Localização → ative o serviço, "Permitir que os aplicativos acessem sua localização" e, principalmente, "Permitir que os aplicativos da área de trabalho acessem sua localização" (é o que libera o Chrome). Se usar VPN/proxy, desative e teste em outra rede (ex.: 4G do celular).'
      : ''

  return (
    <div className="mt-4 text-left">
      <button
        type="button"
        onClick={run}
        disabled={running}
        className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
          dark
            ? 'bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20'
            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        }`}
      >
        {running ? 'Diagnosticando… (pode levar ~15s)' : '🔍 Diagnóstico de localização'}
      </button>

      {result && (
        <div className={`mt-3 rounded-lg p-3 text-[11px] leading-relaxed ${dark ? 'bg-charcoal text-mist' : 'bg-white text-smoke border border-mist/40'}`}>
          <p className="font-medium">{probeSummary}</p>
          <p className="mt-1">Suportado: {result.supported ? 'sim' : 'não'} · HTTPS: {result.secureContext ? 'sim' : 'não'} · Permissão: {result.permission}</p>
          {dica && <p className={`mt-1 ${dark ? 'text-yellow-300/90' : 'text-yellow-700'}`}>{dica}</p>}
          <p className="mt-1 break-all opacity-70">Navegador: {result.userAgent}</p>
        </div>
      )}
    </div>
  )
}
