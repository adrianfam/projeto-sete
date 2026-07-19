import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { formatTime } from '@/lib/utils'
import { pontoRequest } from '@/lib/pontoClient'

interface TimeRecord {
  id: string
  record_type: 'entrada' | 'almoco_ida' | 'almoco_volta' | 'saida'
  latitude: number | null
  longitude: number | null
  recorded_at: string
}

const RECORD_LABELS: Record<string, string> = {
  entrada: 'Entrada',
  almoco_ida: 'Almoço (ida)',
  almoco_volta: 'Almoço (volta)',
  saida: 'Saída',
}

const RECORD_COLORS: Record<string, string> = {
  entrada: 'bg-green-100 text-green-800',
  almoco_ida: 'bg-yellow-100 text-yellow-800',
  almoco_volta: 'bg-blue-100 text-blue-800',
  saida: 'bg-red-100 text-red-800',
}



const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

function formatDay(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDate()
  const weekday = d.toLocaleDateString('pt-BR', { weekday: 'long' })
  return `${day} (${weekday})`
}

export function PontoExtrato() {
  const navigate = useNavigate()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
  )
  const [records, setRecords] = useState<TimeRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [employee, setEmployee] = useState<{ fullName: string; matricula: number } | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('ponto_employee')
    if (!stored) {
      navigate('/ponto/login', { replace: true })
      return
    }
    setEmployee(JSON.parse(stored))
  }, [navigate])

  const fetchRecords = useCallback(async () => {
    const empId = sessionStorage.getItem('ponto_employee_id')
    if (!empId) return
    setLoading(true)
    try {
      const res = await pontoRequest<{ items: TimeRecord[]; month: string }>(
        `/ponto/records?month=${currentMonth}`,
        { token: empId },
      )
      setRecords(res.items)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [currentMonth])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // Agrupa por dia
  const grouped: Record<string, TimeRecord[]> = {}
  records.forEach((r) => {
    const day = r.recorded_at.slice(0, 10)
    if (!grouped[day]) grouped[day] = []
    grouped[day].push(r)
  })

  const prevMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number)
    const d = new Date(y, m - 2, 1)
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const nextMonth = () => {
    const [y, m] = currentMonth.split('-').map(Number)
    const d = new Date(y, m, 1)
    setCurrentMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }

  const [y, m] = currentMonth.split('-').map(Number)
  const monthLabel = `${MONTHS[m - 1]} de ${y}`
  const isCurrentMonth = currentMonth === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`

  return (
    <>
      <Seo title="Meu Extrato — Projeto Sete" noindex path="/ponto/extrato" />
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white px-6 pb-12">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-b from-green-50 to-green-50/95 pb-3 pt-6 backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-xl text-ink">
                Projeto <span className="text-brass">Sete</span>
              </h1>
              <p className="text-xs text-smoke">Meu Extrato</p>
            </div>
            <button
              onClick={() => navigate('/ponto/registrar')}
              className="rounded-lg border border-mist/40 px-4 py-2 text-sm text-smoke hover:border-brass hover:text-ink"
            >
              ← Registrar
            </button>
          </div>

          {employee && (
            <p className="mt-3 text-lg font-medium text-ink">{employee.fullName}</p>
          )}
        </div>

        {/* Navegação de meses */}
        <div className="mt-4 flex items-center justify-between">
          <button onClick={prevMonth} className="rounded-lg px-3 py-2 text-lg hover:bg-white/50">
            ←
          </button>
          <h2 className="text-xl font-semibold text-ink">{monthLabel}</h2>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="rounded-lg px-3 py-2 text-lg hover:bg-white/50 disabled:opacity-30"
          >
            →
          </button>
        </div>

        {/* Resumo */}
        {!loading && records.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl bg-white/70 px-4 py-3">
              <p className="text-2xl font-bold text-green-600">
                {records.filter((r) => r.record_type === 'entrada').length}
              </p>
              <p className="text-xs text-smoke">Dias trabalhados</p>
            </div>
            <div className="rounded-xl bg-white/70 px-4 py-3">
              <p className="text-2xl font-bold text-ink">
                {Object.keys(grouped).length}
              </p>
              <p className="text-xs text-smoke">Dias com registro</p>
            </div>
          </div>
        )}

        {/* Lista por dia */}
        {loading && (
          <p className="mt-12 text-center text-smoke">Carregando…</p>
        )}
        {!loading && Object.keys(grouped).length === 0 && (
          <p className="mt-12 text-center text-smoke">
            Nenhum registro neste mês.
          </p>
        )}

        <div className="mt-6 space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([day, dayRecords]) => (
              <div key={day} className="rounded-xl bg-white/70 px-5 py-4 shadow-sm">
                <p className="mb-3 text-base font-medium text-ink">
                  {formatDay(day)}
                </p>
                <div className="space-y-2">
                  {dayRecords.map((rec) => (
                    <div
                      key={rec.id}
                      className={`flex items-center justify-between rounded-lg px-4 py-2.5 ${RECORD_COLORS[rec.record_type]}`}
                    >
                      <span className="text-sm font-medium">
                        {RECORD_LABELS[rec.record_type]}
                      </span>
                      <span className="text-sm opacity-80">
                        {formatTime(rec.recorded_at)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        <p className="mt-8 text-center text-xs text-smoke">
          Extrato mensal de ponto eletrônico
        </p>
      </div>
    </>
  )
}
