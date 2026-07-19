import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { ApiError } from '@/lib/apiClient'
import { pontoRequest } from '@/lib/pontoClient'

type StatusType = 'not_started' | 'working' | 'lunch' | 'back_from_lunch' | 'finished' | 'overtime'
type RecordType = 'entrada' | 'almoco_ida' | 'almoco_volta' | 'saida'

interface StatusResponse {
  status: StatusType
  label: string
  color: 'green' | 'yellow' | 'red'
}

const RECORD_OPTIONS: { value: RecordType; label: string; icon: string }[] = [
  { value: 'entrada', label: 'Entrada', icon: '🌅' },
  { value: 'almoco_ida', label: 'Entrada Almoço', icon: '🍽️' },
  { value: 'almoco_volta', label: 'Retorno Almoço', icon: '☕' },
  { value: 'saida', label: 'Saída', icon: '🏁' },
]

function enviarNotificacao(acao: string) {
  if (!('Notification' in window)) return
  if (Notification.permission === 'granted') {
    new Notification('Projeto Sete - Ponto', {
      body: `${acao} registrado com sucesso! ✅`,
      icon: '/favicon.svg',
    })
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((p) => {
      if (p === 'granted') {
        new Notification('Projeto Sete - Ponto', {
          body: `${acao} registrado com sucesso! ✅`,
          icon: '/favicon.svg',
        })
      }
    })
  }
}

export function ColaboradorPonto() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [locationDenied, setLocationDenied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<RecordType>('entrada')

  const statusCheckRef = useRef(false)

  // Busca status atual
  const fetchStatus = useCallback(async (showLoading = true) => {
    const empId = sessionStorage.getItem('ponto_employee_id')
    if (!empId) {
      navigate('/colaborador/login', { replace: true })
      return
    }
    if (showLoading) setLoading(true)
    try {
      const res = await pontoRequest<StatusResponse>('/ponto/status', { token: empId })
      setStatus(res)
      // Auto-select o próximo tipo baseado no status
      const nextType = statusToRecordType(res.status)
      setSelectedType(nextType)
    } catch {
      // silently fail
    } finally {
      if (showLoading) setLoading(false)
    }
  }, [navigate])

  // Só executa fetchStatus uma vez na montagem
  useEffect(() => {
    if (!statusCheckRef.current) {
      statusCheckRef.current = true
      fetchStatus()
    }
  }, [fetchStatus])

  // Mapeia status para o próximo tipo de registro
  function statusToRecordType(s: StatusType): RecordType {
    switch (s) {
      case 'not_started': return 'entrada'
      case 'working': return 'almoco_ida'
      case 'lunch': return 'almoco_volta'
      case 'back_from_lunch': return 'saida'
      case 'finished': return 'entrada' // Hora extra: começa novo ciclo
      case 'overtime': return 'saida' // Hora extra ativa: registrar saída
    }
  }

  // Captura localização e registra ponto
  const register = () => {
    setError(null)
    setSuccess(null)
    setLocationDenied(false)

    if (!navigator.geolocation) {
      setError('Seu dispositivo não permite localização. Use outro aparelho.')
      return
    }

    setRegistering(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const empId = sessionStorage.getItem('ponto_employee_id')
        if (!empId) return
        try {
          await pontoRequest('/ponto/register', {
            method: 'POST',
            body: {
              employeeId: empId,
              recordType: selectedType,
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            },
          }, empId)

          const optionLabel = RECORD_OPTIONS.find(o => o.value === selectedType)?.label ?? selectedType
          setSuccess(`${optionLabel} registrada com sucesso! ✅`)
          setRegistering(false)
          enviarNotificacao(optionLabel)
          // Recarrega status e auto-select
          await fetchStatus(false)
        } catch (err) {
          setError(err instanceof ApiError ? err.message : 'Erro ao registrar.')
          setRegistering(false)
        }
      },
      (err) => {
        setRegistering(false)
        if (err.code === err.PERMISSION_DENIED) {
          setLocationDenied(true)
          setError(
            'Para registrar o ponto, precisamos da sua localização. Ative o GPS nas configurações do seu celular e tente novamente.',
          )
        } else {
          setError('Não foi possível pegar a localização. Tente novamente em um local aberto.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-lg text-mist">Carregando…</p>
      </div>
    )
  }

  const isFinished = status?.status === 'finished'
  const disabled = registering

  return (
    <>
      <Seo title="Registrar Ponto — Colaborador" noindex path="/colaborador/ponto" />
      <div className="mx-auto max-w-md">
        {/* Cabeçalho */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-brass/10 px-4 py-1.5 text-xs font-medium text-brass-soft mb-3">
            <span className={`h-1.5 w-1.5 rounded-full ${
              isFinished ? 'bg-red-400' : status?.color === 'green' ? 'bg-green-400' : status?.color === 'yellow' ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
            }`} />
            {status?.label ?? 'Carregando'}
          </div>
          <h2 className="text-2xl font-semibold text-paper">Registrar Ponto</h2>
          <p className="mt-1 text-sm text-mist">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>

        {/* Timeline compacta do dia */}
        <div className="card-line bg-graphite p-4 mb-6">
          <p className="text-xs uppercase tracking-eyebrow text-mist mb-3">Registros de hoje</p>
          <div className="grid grid-cols-4 gap-2">
            {RECORD_OPTIONS.map((opt) => {
              const isActive = selectedType === opt.value
              const isDone = status && (
                (opt.value === 'entrada' && ['working', 'lunch', 'back_from_lunch', 'finished', 'overtime'].includes(status.status)) ||
                (opt.value === 'almoco_ida' && ['lunch', 'back_from_lunch', 'finished', 'overtime'].includes(status.status)) ||
                (opt.value === 'almoco_volta' && ['back_from_lunch', 'finished', 'overtime'].includes(status.status)) ||
                (opt.value === 'saida' && ['finished', 'overtime'].includes(status.status))
              )
              return (
                <div
                  key={opt.value}
                  className={`flex flex-col items-center gap-1 rounded-lg p-2 transition-all ${
                    isDone
                      ? 'bg-green-900/30 text-green-400'
                      : isActive && !isFinished && status?.status !== 'overtime'
                        ? 'bg-brass/10 text-brass-soft ring-1 ring-brass/30'
                        : 'bg-charcoal text-mist/40'
                  }`}
                >
                  <span className="text-lg">{opt.icon}</span>
                  <span className="text-[10px] font-medium leading-tight text-center">{opt.label}</span>
                  {isDone && <span className="text-[10px]">✅</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Seletor de tipo (combo) */}
        <div className="card-line bg-graphite p-5 mb-6">
          <label className="block text-xs uppercase tracking-eyebrow text-mist mb-3">
            Selecione o tipo de registro
          </label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as RecordType)}
            className="admin-input w-full text-base"
          >
            {RECORD_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Botão principal */}
        <div className="flex flex-col items-center">
          <button
            onClick={register}
            disabled={disabled}
            className={`w-full rounded-xl px-6 py-5 text-lg font-bold text-white shadow-lg transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 shadow-green-600/20`}
          >
            {registering ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                </svg>
                Registrando…
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Registrar {RECORD_OPTIONS.find(o => o.value === selectedType)?.label}
              </>
            )}
          </button>

          {/* Mensagens */}
          <div className="mt-6 w-full space-y-3">
            {locationDenied && (
              <div className="rounded-xl border-2 border-yellow-700/50 bg-yellow-900/20 px-5 py-4 text-center">
                <p className="text-base font-medium text-yellow-400">📍 Localização necessária</p>
                <p className="mt-2 text-sm text-yellow-300/80">
                  Para registrar, ative o GPS do seu celular:
                </p>
                <ul className="mt-2 space-y-1 text-left text-sm text-yellow-300/70">
                  <li><strong>Android:</strong> Deslize o menu superior e ative "Localização"</li>
                  <li><strong>iPhone:</strong> Ajustes → Privacidade → Localização → Ativar</li>
                </ul>
                <p className="mt-2 text-sm text-yellow-300/80">Depois é só tentar novamente!</p>
              </div>
            )}

            {error && !locationDenied && (
              <p className="rounded-xl border border-red-800/50 bg-red-900/20 px-4 py-3 text-center text-base text-red-400">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-xl border border-green-800/50 bg-green-900/20 px-4 py-3 text-center text-base text-green-400">
                {success}
              </p>
            )}

            {isFinished && (
              <div className="rounded-xl border border-yellow-700/50 bg-yellow-900/20 px-5 py-4 text-center">
                <p className="text-base font-medium text-yellow-400">⏰ Dia finalizado</p>
                <p className="mt-1 text-sm text-yellow-300/80">
                  Se precisar registrar hora extra, selecione o tipo acima e clique em Registrar.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
