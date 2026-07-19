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
  entrada: 'bg-green-900/30 text-green-400',
  almoco_ida: 'bg-yellow-900/30 text-yellow-400',
  almoco_volta: 'bg-blue-900/30 text-blue-400',
  saida: 'bg-red-900/30 text-red-400',
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

export function ColaboradorExtrato() {
  const navigate = useNavigate()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(
    `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`,
  )
  const [records, setRecords] = useState<TimeRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRecords = useCallback(async () => {
    const empId = sessionStorage.getItem('ponto_employee_id')
    if (!empId) {
      navigate('/colaborador/login', { replace: true })
      return
    }
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
  }, [currentMonth, navigate])

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
      <Seo title="Meu Extrato — Colaborador" noindex path="/colaborador/extrato" />
      <div className="mx-auto max-w-lg">
        <h2 className="text-2xl font-semibold text-paper mb-6">Meu Extrato</h2>

        {/* Navegação de meses */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="rounded-lg px-3 py-2 text-lg text-mist hover:text-paper hover:bg-graphite/50">
            ←
          </button>
          <h3 className="text-xl font-semibold text-paper">{monthLabel}</h3>
          <button
            onClick={nextMonth}
            disabled={isCurrentMonth}
            className="rounded-lg px-3 py-2 text-lg text-mist hover:text-paper hover:bg-graphite/50 disabled:opacity-30"
          >
            →
          </button>
        </div>

        {/* Resumo */}
        {!loading && records.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 text-center">
            <div className="rounded-xl card-line bg-graphite px-4 py-3">
              <p className="text-2xl font-bold text-green-400">
                {records.filter((r) => r.record_type === 'entrada').length}
              </p>
              <p className="text-xs text-mist">Dias trabalhados</p>
            </div>
            <div className="rounded-xl card-line bg-graphite px-4 py-3">
              <p className="text-2xl font-bold text-paper">
                {Object.keys(grouped).length}
              </p>
              <p className="text-xs text-mist">Dias com registro</p>
            </div>
          </div>
        )}

        {/* Lista */}
        {loading && (
          <p className="text-center text-mist py-12">Carregando…</p>
        )}
        {!loading && Object.keys(grouped).length === 0 && (
          <p className="text-center text-mist py-12">Nenhum registro neste mês.</p>
        )}

        <div className="space-y-4">
          {Object.entries(grouped)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([day, dayRecords]) => (
              <div key={day} className="rounded-xl card-line bg-graphite px-5 py-4">
                <p className="mb-3 text-base font-medium text-paper">
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

        <p className="mt-8 text-center text-xs text-mist">
          Extrato mensal de ponto eletrônico
        </p>
      </div>
    </>
  )
}
