import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi, adminRequest } from '@/hooks/useAdminApi'
import { LoadingState } from '@/components/ui/LoadingState'
import { ApiError } from '@/lib/apiClient'
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
// Helpers
// ---------------------------------------------------------------------------
/** "2026-08-09T07:52" (local, para input datetime-local) a partir de um ISO. */
function toLocalInputValue(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

/** Valor do input datetime-local (local) → ISO UTC, ou null se vazio/inválido. */
function fromLocalInputValue(v: string): string | null {
  if (!v) return null
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString()
}

/** Minutos trabalhados no dia (entrada→saída, descontando o intervalo de almoço). */
function workMinutes(records: TimeRecord[]): number | null {
  const entrada = records.find((r) => r.record_type === 'entrada')
  const saida = records.find((r) => r.record_type === 'saida')
  if (!entrada || !saida) return null
  let total = new Date(saida.recorded_at).getTime() - new Date(entrada.recorded_at).getTime()
  const almocoIda = records.find((r) => r.record_type === 'almoco_ida')
  const almocoVolta = records.find((r) => r.record_type === 'almoco_volta')
  if (almocoIda && almocoVolta) {
    total -= new Date(almocoVolta.recorded_at).getTime() - new Date(almocoIda.recorded_at).getTime()
  }
  if (total <= 0) return null
  return Math.round(total / 60_000)
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${h}h ${String(m).padStart(2, '0')}min`
}

function formatDateShort(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR')
  } catch {
    return ''
  }
}

// ---------------------------------------------------------------------------
// Componente de Timeline Visual para um colaborador (dia único)
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
  const minutes = workMinutes(sorted)

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
      {isComplete && sorted.length >= 2 && minutes !== null && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-lg bg-green-900/20 border border-green-800/50 px-4 py-2.5 text-xs text-green-400">
          <span>
            🕐 Entrada{' '}
            <strong>{formatTime(sorted.find((r) => r.record_type === 'entrada')!.recorded_at)}</strong>
          </span>
          <span className="text-green-700">→</span>
          <span>
            🏁 Saída{' '}
            <strong>{formatTime(sorted.find((r) => r.record_type === 'saida')!.recorded_at)}</strong>
          </span>
          <span className="text-green-700">·</span>
          <span>
            ⏱️ Total: <strong>{formatMinutes(minutes)}</strong>
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
      color: 'text-green-400',
      bg: 'bg-green-900/10',
    },
    {
      label: 'Em andamento',
      value: inProgress,
      sub: 'ainda não finalizaram',
      icon: '⏳',
      color: 'text-yellow-400',
      bg: 'bg-yellow-900/10',
    },
    {
      label: 'Total de registros',
      value: totalRecords,
      sub: 'no período',
      icon: '📋',
      color: 'text-blue-400',
      bg: 'bg-blue-900/10',
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
// Linha de registro na Lista — com GPS, edição inline e exclusão
// ---------------------------------------------------------------------------
function RecordRow({
  record,
  showDate,
  onChanged,
}: {
  record: TimeRecord
  showDate: boolean
  onChanged: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [draftType, setDraftType] = useState<string>(record.record_type)
  const [draftLocal, setDraftLocal] = useState(toLocalInputValue(record.recorded_at))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mapsUrl =
    record.latitude && record.longitude
      ? `https://www.google.com/maps?q=${record.latitude},${record.longitude}`
      : null

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      const body: Record<string, unknown> = { recordType: draftType }
      const iso = fromLocalInputValue(draftLocal)
      if (iso) body.recordedAt = iso
      await adminRequest(`/admin/time-records/${record.id}`, { method: 'PATCH', body })
      setEditing(false)
      onChanged()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao salvar o registro.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Excluir este registro de ponto? Essa ação não pode ser desfeita.')) return
    setSaving(true)
    setError(null)
    try {
      await adminRequest(`/admin/time-records/${record.id}`, { method: 'DELETE' })
      onChanged()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao excluir o registro.')
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-brass/40 bg-ink/60 px-4 py-3">
        <p className="mb-2 text-xs uppercase tracking-eyebrow text-brass">
          ✏️ Corrigindo registro
        </p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-mist">Tipo</label>
            <select
              value={draftType}
              onChange={(e) => setDraftType(e.target.value)}
              className="admin-input w-auto"
            >
              {Object.entries(RECORD_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-mist">Data e hora</label>
            <input
              type="datetime-local"
              value={draftLocal}
              onChange={(e) => setDraftLocal(e.target.value)}
              className="admin-input w-auto"
            />
          </div>
          <div className="flex items-center gap-2 pb-0.5">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-md bg-brass px-3 py-2 text-xs font-medium text-charcoal hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
            <button
              onClick={() => {
                setEditing(false)
                setError(null)
              }}
              disabled={saving}
              className="rounded-md border border-graphite-light px-3 py-2 text-xs text-mist hover:text-paper"
            >
              Cancelar
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-xs text-error">{error}</p>}
      </div>
    )
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 ${RECORD_COLORS[record.record_type]}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{RECORD_LABELS[record.record_type]}</span>
        <span className="text-xs opacity-60">
          {showDate ? `${formatDateShort(record.recorded_at)} · ` : ''}
          {formatTime(record.recorded_at)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {record.latitude && record.longitude ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-mono opacity-70">
            📍 {record.latitude.toFixed(5)}, {record.longitude.toFixed(5)}
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-brass link-underline"
              >
                Mapa
              </a>
            )}
          </span>
        ) : (
          <span className="text-[11px] opacity-50">📍 sem GPS</span>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setDraftType(record.record_type)
              setDraftLocal(toLocalInputValue(record.recorded_at))
              setError(null)
              setEditing(true)
            }}
            className="text-xs text-brass link-underline"
            title="Corrigir tipo ou horário"
          >
            ✏️ Corrigir
          </button>
          <button
            onClick={remove}
            disabled={saving}
            className="text-xs text-red-400 link-underline hover:text-red-300 disabled:opacity-50"
            title="Excluir registro"
          >
            🗑️ Excluir
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------
type ViewMode = 'list' | 'daily'
type Period = 'today' | '7d' | 'month' | 'prevMonth' | 'all'

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: '7d', label: 'Últimos 7 dias' },
  { key: 'month', label: 'Este mês' },
  { key: 'prevMonth', label: 'Mês anterior' },
  { key: 'all', label: 'Tudo' },
]

/** Limites do período em ISO UTC (dia local do admin) — recorded_at é timestamptz (UTC). */
function periodRange(period: Period): { from?: string; to?: string } {
  const now = new Date()
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const endOfDay = (d: Date) =>
    new Date(new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1).getTime() - 1)
  switch (period) {
    case 'today':
      return { from: startOfDay(now).toISOString(), to: endOfDay(now).toISOString() }
    case '7d': {
      const from = new Date(now)
      from.setDate(from.getDate() - 6)
      return { from: startOfDay(from).toISOString(), to: endOfDay(now).toISOString() }
    }
    case 'month':
      return {
        from: startOfDay(new Date(now.getFullYear(), now.getMonth(), 1)).toISOString(),
        to: endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0)).toISOString(),
      }
    case 'prevMonth':
      return {
        from: startOfDay(new Date(now.getFullYear(), now.getMonth() - 1, 1)).toISOString(),
        to: endOfDay(new Date(now.getFullYear(), now.getMonth(), 0)).toISOString(),
      }
    case 'all':
      return {}
  }
}

export function AdminTimeRecords() {
  const [searchParams] = useSearchParams()
  const [viewMode, setViewMode] = useState<ViewMode>('daily')
  const [selectedEmployee, setSelectedEmployee] = useState<string>(
    () => searchParams.get('employee_id') ?? '',
  )
  const [period, setPeriod] = useState<Period>('today')

  // Deep-link do menu Colaboradores (?employee_id=...)
  useEffect(() => {
    const emp = searchParams.get('employee_id')
    if (emp) setSelectedEmployee(emp)
  }, [searchParams])

  // A visão "Resumo Diário" só faz sentido para um dia único
  useEffect(() => {
    if (period !== 'today') setViewMode('list')
  }, [period])

  const { data: empData } = useAdminApi<{ items: Employee[] }>('/admin/employees')

  const range = periodRange(period)
  const params = new URLSearchParams()
  if (selectedEmployee) params.set('employee_id', selectedEmployee)
  if (range.from) params.set('date_from', range.from)
  if (range.to) params.set('date_to', range.to)
  params.set('limit', period === 'all' ? '2000' : '1000')
  const recordsPath = `/admin/time-records?${params.toString()}`

  const { data: recordsData, status, refetch } = useAdminApi<{ items: TimeRecord[] }>(recordsPath)
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
      <h1 className="font-serif text-3xl text-paper">Pontos Eletrônicos</h1>
      <p className="mt-2 text-smoke">
        Controle total dos registros de ponto: visualize, corrija horários/tipos e exclua
        batidas erradas, sempre com a localização GPS de cada registro.
      </p>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 rounded-lg border border-graphite-light bg-graphite p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setViewMode(tab.key)}
            disabled={period !== 'today' && tab.key === 'daily'}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
              viewMode === tab.key
                ? 'admin-tab-active bg-brass text-charcoal font-medium shadow-sm'
                : 'admin-tab text-mist hover:text-paper'
            } ${
              period !== 'today' && tab.key === 'daily'
                ? 'cursor-not-allowed opacity-40 hover:text-mist'
                : ''
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
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as Period)}
          className="admin-input w-auto"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.label}
            </option>
          ))}
        </select>
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
              Nenhum registro encontrado para o período selecionado.
            </p>
          ) : (
            <div className="mt-6 space-y-6">
              {Object.entries(grouped).map(([empId, empRecords]) => (
                <div key={empId} className="card-line bg-graphite p-5">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-medium text-paper">
                      {getEmployeeName(empId)}
                      <span className="ml-2 text-xs text-mist">
                        {empRecords.length} registro{empRecords.length !== 1 ? 's' : ''}
                      </span>
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {[...empRecords]
                      .sort(
                        (a, b) =>
                          new Date(a.recorded_at).getTime() -
                          new Date(b.recorded_at).getTime(),
                      )
                      .map((rec) => (
                        <RecordRow
                          key={rec.id}
                          record={rec}
                          showDate={period !== 'today'}
                          onChanged={refetch}
                        />
                      ))}
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
