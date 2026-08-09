import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { ApiError } from '@/lib/apiClient'
import { pontoRequest } from '@/lib/pontoClient'
import { getUserPosition, GeoError } from '@/lib/geo'
import { GeoDiagnostics } from '@/components/ui/GeoDiagnostics'

/** Notificação simples via Browser Notification API. */
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



type StatusType = 'not_started' | 'working' | 'lunch' | 'back_from_lunch' | 'finished'
interface StatusResponse {
  status: StatusType
  label: string
  color: 'green' | 'yellow' | 'red'
}

const STATUS_STYLES: Record<string, { bg: string; hover: string; shadow: string }> = {
  green: { bg: 'bg-green-600', hover: 'hover:bg-green-700', shadow: 'shadow-green-600/30' },
  yellow: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', shadow: 'shadow-yellow-500/30' },
  red: { bg: 'bg-red-600', hover: 'hover:bg-red-700', shadow: 'shadow-red-600/30' },
}

interface Employee {
  id: string
  fullName: string
  matricula: number
}

export function PontoRegistrar() {
  const navigate = useNavigate()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [status, setStatus] = useState<StatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [lastRecord, setLastRecord] = useState<string | null>(null)

  // Carrega dados do colaborador
  useEffect(() => {
    const stored = sessionStorage.getItem('ponto_employee')
    if (!stored) {
      navigate('/ponto/login', { replace: true })
      return
    }
    setEmployee(JSON.parse(stored))
  }, [navigate])

  // Busca status atual (usa employee.id como Bearer token)
  const fetchStatus = useCallback(async () => {
    const empId = sessionStorage.getItem('ponto_employee_id')
    if (!empId) return
    try {
      const res = await pontoRequest<StatusResponse>('/ponto/status', { token: empId })
      setStatus(res)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Captura localização e registra ponto (nunca trava: watchdog + fallback de precisão)
  const register = async () => {
    setError(null)
    setSuccess(null)
    setGeoError(null)

    if (!navigator.geolocation) {
      setGeoError('Seu dispositivo não permite localização. Use um navegador com GPS (celular) ou conecte o computador à internet.')
      return
    }

    setRegistering(true)
    setLocating(true)
    try {
      const pos = await getUserPosition()
      setLocating(false)
      const empId = sessionStorage.getItem('ponto_employee_id')
      if (!empId) {
        navigate('/ponto/login', { replace: true })
        return
      }

      await pontoRequest('/ponto/register', {
        method: 'POST',
        body: {
          employeeId: empId,
          recordType: status?.status === 'not_started' ? 'entrada'
            : status?.status === 'working' ? 'almoco_ida'
            : status?.status === 'lunch' ? 'almoco_volta'
            : 'saida',
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        },
      }, empId)
      setSuccess('Ponto registrado com sucesso! ✅')
      setLastRecord(status?.label ?? '')
      // Notificação push (Browser Notification API)
      enviarNotificacao(status?.label ?? 'Ponto registrado')
      // Atualiza status
      fetchStatus()
    } catch (err) {
      setLocating(false)
      if (err instanceof GeoError) {
        // Qualquer falha de localização mostra instruções + botão de repetir
        setGeoError(err.message)
      } else {
        setError(err instanceof ApiError ? err.message : 'Erro ao registrar.')
      }
    } finally {
      setRegistering(false)
    }
  }

  const logout = () => {
    sessionStorage.removeItem('ponto_employee')
    sessionStorage.removeItem('ponto_employee_id')
    navigate('/ponto/login', { replace: true })
  }

  if (!employee || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <p className="text-lg text-smoke">Carregando…</p>
      </div>
    )
  }

  const style = status ? STATUS_STYLES[status.color] : STATUS_STYLES.green
  const disabled = registering || status?.status === 'finished'

  return (
    <>
      <Seo title="Registrar Ponto — Projeto Sete" noindex path="/ponto/registrar" />
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-green-50 to-white px-6">
        {/* Header */}
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="font-serif text-xl text-ink">
              Projeto <span className="text-brass">Sete</span>
            </h1>
            <p className="text-xs text-smoke">Ponto Eletrônico</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/ponto/extrato')}
              className="rounded-lg border border-mist/40 px-4 py-2 text-sm text-smoke hover:border-brass hover:text-ink"
            >
              Extrato
            </button>
            <button
              onClick={logout}
              className="rounded-lg border border-mist/40 px-4 py-2 text-sm text-smoke hover:border-brass hover:text-ink"
            >
              Sair
            </button>
          </div>
        </div>

        {/* Saudação */}
        <div className="mt-6 text-center">
          <p className="text-lg text-smoke">Olá,</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">{employee.fullName}</h2>
          <p className="mt-1 text-sm text-smoke">Matrícula {employee.matricula}</p>
        </div>

        {/* Botão principal */}
        <div className="mt-12 flex flex-1 flex-col items-center justify-start">
          <button
            onClick={register}
            disabled={disabled}
            className={`h-48 w-48 rounded-full ${style.bg} ${style.hover} ${style.shadow} text-white shadow-2xl transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center`}
          >
            <span className="text-2xl font-bold leading-tight">
              {registering ? (locating ? 'Localizando…' : '…') : (status?.label ?? 'Carregando')}
            </span>
          </button>

          {/* Mensagens */}
          <div className="mt-8 w-full max-w-sm space-y-3">
            {geoError && (
              <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 px-5 py-4 text-center">
                <p className="text-base font-medium text-yellow-800">📍 Não foi possível obter a localização</p>
                <p className="mt-2 text-sm text-yellow-700">{geoError}</p>
                <p className="mt-2 text-sm text-yellow-700">Verifique e tente novamente:</p>
                <ul className="mt-2 space-y-1 text-left text-sm text-yellow-700">
                  <li><strong>Android:</strong> deslize o menu superior e ative "Localização" (e a permissão do navegador)</li>
                  <li><strong>iPhone:</strong> Ajustes → Privacidade → Localização → ative para o navegador</li>
                  <li><strong>Computador:</strong> permita o navegador acessar a localização (no Chrome: cadeado na barra de endereço → Localização → Permitir)</li>
                  <li>Conecte-se a uma rede (Wi-Fi ou dados móveis) e tente em área aberta</li>
                </ul>
                <button
                  onClick={register}
                  disabled={registering}
                  className="mt-3 rounded-lg bg-yellow-500/20 px-4 py-2 text-sm font-semibold text-yellow-800 transition-colors hover:bg-yellow-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Tentar novamente
                </button>
                <div className="mt-1 flex justify-center">
                  <GeoDiagnostics />
                </div>
              </div>
            )}

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-base text-red-700">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-xl bg-green-50 px-4 py-3 text-center text-base text-green-700">
                {success}
                <br />
                <span className="text-sm">{lastRecord}</span>
              </p>
            )}

            {status?.status === 'finished' && (
              <p className="text-center text-lg text-smoke">Seu dia de trabalho foi encerrado. 🎉</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="py-8 text-center text-xs text-smoke">
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </>
  )
}
