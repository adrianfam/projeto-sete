import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { ApiError } from '@/lib/apiClient'
import { pontoRequest } from '@/lib/pontoClient'

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
  const [locationDenied, setLocationDenied] = useState(false)
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
          setRegistering(false)
          // Notificação push (Browser Notification API)
          enviarNotificacao(status?.label ?? 'Ponto registrado')
          // Atualiza status
          fetchStatus()
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
              {registering ? '…' : status?.label ?? 'Carregando'}
            </span>
          </button>

          {/* Mensagens */}
          <div className="mt-8 w-full max-w-sm space-y-3">
            {locationDenied && (
              <div className="rounded-xl border-2 border-yellow-300 bg-yellow-50 px-5 py-4 text-center">
                <p className="text-base font-medium text-yellow-800">📍 Localização necessária</p>
                <p className="mt-2 text-sm text-yellow-700">
                  Para registrar, ative o GPS do seu celular:
                </p>
                <ul className="mt-2 space-y-1 text-left text-sm text-yellow-700">
                  <li><strong>Android:</strong> Deslize o menu superior e ative "Localização"</li>
                  <li><strong>iPhone:</strong> Ajustes → Privacidade → Localização → Ativar</li>
                </ul>
                <p className="mt-2 text-sm text-yellow-700">Depois é só tentar novamente!</p>
              </div>
            )}

            {error && !locationDenied && (
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
