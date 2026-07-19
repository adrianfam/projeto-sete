import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi } from '@/hooks/useAdminApi'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatTime } from '@/lib/utils'

interface TimeRecord {
  id: string
  employee_id: string
  record_type: 'entrada' | 'almoco_ida' | 'almoco_volta' | 'saida'
  latitude: number | null
  longitude: number | null
  recorded_at: string
}

interface Employee {
  id: string
  full_name: string
  matricula: number
}

const RECORD_LABELS: Record<string, string> = {
  entrada: 'Entrada',
  almoco_ida: 'Almoço (ida)',
  almoco_volta: 'Almoço (volta)',
  saida: 'Saída',
}

const RECORD_COLORS: Record<string, string> = {
  entrada: 'text-green-400 bg-green-900/30 border-green-800',
  almoco_ida: 'text-yellow-400 bg-yellow-900/30 border-yellow-800',
  almoco_volta: 'text-blue-400 bg-blue-900/30 border-blue-800',
  saida: 'text-red-400 bg-red-900/30 border-red-800',
}

const RECORD_ICONS: Record<string, string> = {
  entrada: '🌅',
  almoco_ida: '🍽️',
  almoco_volta: '☕',
  saida: '🏁',
}

const RECORD_ORDER: Record<string, number> = {
  entrada: 0,
  almoco_ida: 1,
  almoco_volta: 2,
  saida: 3,
}

// ---------------------------------------------------------------------------
// Componente de Timeline Visual para um colaborador
// ---------------------------------------------------------------------------
function EmployeeTimeline({
  employee,
  records,
}: {
  employee: { id: string; full_name: string; matricula: number }
  records: TimeRecord[]
}) {
  // Dados do dia
  const sorted = [...records].sort(
    (a, b) => RECORD_ORDER[a.record_type] - RECORD_ORDER[b.record_type],
  )
  const stepOrder = ['entrada', 'almoco_ida', 'almoco_volta', 'saida']
  const completedSteps = sorted.map((r) => r.record_type)
  const isComplete =
    completedSteps.includes('entrada') && completedSteps.includes('saida')
  const statusBadge = isComplete
    ? { label: 'Dia completo', class: 'bg-green-900/40 text-green-400 border-green-700' }
    : sorted.length === 0
      ? { label: 'Sem registro', class: 'bg-graphite text-mist border-graphite-light' }
      : { label: 'Em andamento', class: 'bg-yellow-900/40 text-yellow-400 border-yellow-700' }

  // Última localização (compatível com ES2020)
  const lastWithLocation = [...sorted].reverse().find((r) => r.latitude && r.longitude)

  return (
    <div className="card-line bg-graphite p-5 transition-all hover:border-brass/40">
      {/* Cabeçalho */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-paper">{employee.full_name}</h3>
            <span className="rounded border border-graphite-light px-2 py-0.5 text-xs font-mono text-mist">
              #{employee.matricula}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-mist">
            {sorted.length} registro{sorted.length !== 1 ? 's' : ''} ·{' '}
            {sorted[0]?.recorded_at
              ? new Date(sorted[0].recorded_at).toLocaleDateString('pt-BR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })
              : '—'}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${statusBadge.class}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isComplete
                ? 'bg-green-400'
                : sorted.length === 0
                  ? 'bg-smoke'
                  : 'bg-yellow-400 animate-pulse'
            }`}
          />
          {statusBadge.label}
        </span>
      </div>

      {/* Timeline horizontal */}
      <div className="relative overflow-x-auto pb-2">
        <div className="flex items-start justify-between min-w-[320px]">
          {stepOrder.map((step, idx) => {
            const rec = sorted.find((r) => r.record_type === step)
            const isCompleted = !!rec
            const isLast = idx === stepOrder.length - 1
            const mapsUrl =
              rec?.latitude && rec?.longitude
                ? `https://www.google.com/maps?q=${rec.latitude},${rec.longitude}`
                : null

            return (
              <div key={step} className="flex flex-1 flex-col items-center">
                {/* Linha conectora */}
                {!isLast && (
                  <div className="relative mb-2 h-1 w-full self-center">
                    <div
                      className={`absolute inset-0 rounded-full transition-colors duration-500 ${
                        isCompleted ? 'bg-brass/40' : 'bg-mist/20'
                      }`}
                    />
                    <div
                      className={`absolute left-0 top-0 h-full rounded-full transition-all duration-700 ${
                        isCompleted ? 'bg-brass' : 'bg-mist/20'
                      }`}
                      style={{
                        width: isCompleted ? '100%' : '0%',
                      }}
                    />
                  </div>
                )}

                {/* Círculo do step */}
                <div
                  className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 text-lg transition-all duration-300 ${
                    isCompleted
                      ? 'border-brass bg-brass/10 text-brass shadow-sm'
                      : 'border-graphite-light bg-graphite text-mist/50'
                  } ${!isCompleted ? 'border-dashed' : ''}`}
                >
                  {RECORD_ICONS[step]}
                </div>

                {/* Label e horário */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium transition-colors ${
                      isCompleted ? 'text-paper' : 'text-mist/50'
                    }`}
                  >
                    {RECORD_LABELS[step]}
                  </p>
                  {isCompleted && rec && (
                    <>
                      <p className="mt-0.5 text-xs font-mono font-bold text-brass">
                        {formatTime(rec.recorded_at)}
                      </p>
                      {mapsUrl && (
                        <a
                          href={mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-0.5 inline-flex items-center gap-0.5 text-[10px] text-smoke hover:text-brass transition-colors"
                          title="Ver localização no mapa"
                        >
                          📍
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Resumo do expediente */}
      {isComplete && sorted.length >= 2 && (
        <div className="mt-4 flex items-center justify-center gap-4 rounded-lg bg-green-900/20 border border-green-800/50 px-4 py-2.5 text-xs text-green-400">
          <span>
            🕐 Entrada{' '}
            <strong>{formatTime(sorted.find((r) => r.record_type === 'entrada')!.recorded_at)}</strong>
          </span>
          <span className="text-green-700">→</span>
          <span>
            🏁 Saída{' '}
            <strong>{formatTime(sorted.find((r) => r.record_type === 'saida')!.recorded_at)}</strong>
          </span>
        </div>
      )}

      {/* Última localização */}
      {lastWithLocation && (
        <div className="mt-2 text-center">
          <a
            href={`https://www.google.com/maps?q=${lastWithLocation.latitude},${lastWithLocation.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[10px] text-smoke hover:text-brass transition-colors"
          >
            📍 Última localização registrada
          </a>
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Componente de Cards de Resumo
// ---------------------------------------------------------------------------
function DailySummaryCards({
  grouped,
  employees,
  allRecords,
  employeeFilter,
}: {
  grouped: Record<string, TimeRecord[]>
  employees: Employee[]
  allRecords: TimeRecord[]
  employeeFilter: string
}) {
  const totalEmployees = Object.keys(grouped).length
  const daysComplete = Object.values(grouped).filter(
    (recs) =>
      recs.some((r) => r.record_type === 'entrada') &&
      recs.some((r) => r.record_type === 'saida'),
  ).length
  const inProgress = Object.values(grouped).filter(
    (recs) =>
      !recs.some((r) => r.record_type === 'saida'),
  ).length
  const totalRecords = allRecords.length

  const cards = [
    {
      label: 'Colaboradores com registro',
      value: totalEmployees,
      sub: `de ${employees.length} cadastrados`,
      icon: '👥',
      color: 'text-brass',
      bg: 'bg-brass/5',
    },
    {
      label: 'Dias completos',
      value: daysComplete,
      sub: 'entrada + saída registrados',
      icon: '✅',
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Em andamento',
      value: inProgress,
      sub: 'ainda não finalizaram',
      icon: '⏳',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      label: 'Total de registros',
      value: totalRecords,
      sub: 'nesta data',
      icon: '📋',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
  ]

  // Oculta cards de resumo quando um funcionário específico está filtrado
  if (employeeFilter) {
    const emp = employees.find((e) => e.id === employeeFilter)
    return (
      <div className="rounded-lg border border-graphite-light bg-graphite p-4 text-center text-sm text-mist">
        Exibindo dados filtrados para{' '}
        <strong className="text-paper">{emp?.full_name ?? 'colaborador selecionado'}</strong>
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`card-line rounded p-5 ${card.bg}`}
        >
          <div className="flex items-start justify-between">
            <p className="text-xs uppercase tracking-eyebrow text-smoke">
              {card.label}
            </p>
            <span className="text-lg">{card.icon}</span>
          </div>
          <p className={`mt-2 font-serif text-4xl ${card.color}`}>
            {card.value}
          </p>
          <p className="mt-1 text-xs text-smoke">{card.sub}</p>
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------
type ViewMode = 'list' | 'daily'

export function AdminTimeRecords() {
  const [viewMode, setViewMode] = useState<ViewMode>('daily')
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))

  const { data: empData } = useAdminApi<{ items: Employee[] }>('/admin/employees')
  const recordsPath = `/admin/time-records?date_from=${date}&limit=500${selectedEmployee ? `&employee_id=${selectedEmployee}` : ''}`
  const { data: recordsData, status } = useAdminApi<{ items: TimeRecord[] }>(recordsPath)
  const employees = empData?.items ?? []
  const records = recordsData?.items ?? []

  // Agrupa por colaborador
  const grouped: Record<string, TimeRecord[]> = {}
  records.forEach((r) => {
    if (!grouped[r.employee_id]) grouped[r.employee_id] = []
    grouped[r.employee_id].push(r)
  })

  const getEmployeeName = (id: string) =>
    employees.find((e) => e.id === id)?.full_name ?? id.slice(0, 8)

  const tabs: { key: ViewMode; label: string }[] = [
    { key: 'daily', label: '📊 Resumo Diário' },
    { key: 'list', label: '📋 Lista' },
  ]

  return (
    <>
      <Seo title="Pontos — Projeto Sete Admin" noindex />
      <h1 className="font-serif text-3xl">Pontos Eletrônicos</h1>
      <p className="mt-2 text-smoke">
        {viewMode === 'daily'
          ? 'Resumo visual dos registros de ponto do dia.'
          : 'Histórico detalhado de registros dos colaboradores.'}
      </p>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg border border-graphite-light bg-graphite p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              viewMode === tab.key
                ? 'admin-tab-active bg-brass text-charcoal font-medium shadow-sm'
                : 'admin-tab text-mist hover:text-paper'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div className="mt-4 flex flex-wrap gap-4">
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="admin-input w-auto"
        >
          <option value="">Todos os colaboradores</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="admin-input w-auto"
        />
      </div>

      {status === 'loading' && <LoadingState className="py-16" />}

      {/* VIEW: Resumo Diário */}
      {viewMode === 'daily' && status !== 'loading' && (
        <>
          {/* Cards de resumo */}
          <div className="mt-6">
            <DailySummaryCards
              grouped={grouped}
              employees={employees}
              allRecords={records}
              employeeFilter={selectedEmployee}
            />
          </div>

          {/* Timeline dos colaboradores */}
          {Object.keys(grouped).length === 0 ? (
            <p className="py-16 text-center text-smoke">
              Nenhum registro encontrado para esta data.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-paper">
                  Timeline dos Colaboradores
                </h2>
                <span className="rounded-full bg-brass/10 px-2.5 py-0.5 text-xs font-medium text-brass">
                  {Object.keys(grouped).length} colaborador
                  {Object.keys(grouped).length !== 1 ? 'es' : ''}
                </span>
              </div>

              {Object.entries(grouped).map(([empId, empRecords]) => {
                const emp = employees.find((e) => e.id === empId)
                if (!emp) return null
                return (
                  <EmployeeTimeline
                    key={empId}
                    employee={emp}
                    records={empRecords}
                  />
                )
              })}
            </div>
          )}
        </>
      )}

      {/* VIEW: Lista */}
      {viewMode === 'list' && status !== 'loading' && (
        <>
          {Object.keys(grouped).length === 0 ? (
            <p className="py-16 text-center text-mist">
              Nenhum registro encontrado para esta data.
            </p>
          ) : (
            <div className="mt-6 space-y-6">
              {Object.entries(grouped).map(([empId, empRecords]) => (
                <div key={empId} className="card-line bg-graphite p-5">
                  <h3 className="font-medium text-paper">
                    {getEmployeeName(empId)}
                  </h3>
                  <div className="mt-3 space-y-2">
                    {empRecords
                      .sort(
                        (a, b) =>
                          new Date(a.recorded_at).getTime() -
                          new Date(b.recorded_at).getTime(),
                      )
                      .map((rec) => {
                        const mapsUrl =
                          rec.latitude && rec.longitude
                            ? `https://www.google.com/maps?q=${rec.latitude},${rec.longitude}`
                            : null
                        return (
                          <div
                            key={rec.id}
                            className={`flex items-center justify-between rounded-lg border px-4 py-3 ${RECORD_COLORS[rec.record_type]}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium">
                                {RECORD_LABELS[rec.record_type]}
                              </span>
                              <span className="text-xs opacity-60">
                                {formatTime(rec.recorded_at)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {mapsUrl && (
                                <a
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-brass link-underline"
                                >
                                  📍 Mapa
                                </a>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )
}
