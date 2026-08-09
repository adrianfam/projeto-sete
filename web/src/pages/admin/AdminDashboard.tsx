import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi } from '@/hooks/useAdminApi'
import { Link } from 'react-router-dom'
import { formatTime } from '@/lib/utils'

interface Metrics {
  publishedPosts: number
  pendingComments: number
  portfolioItems: number
  newMessages: number
  activeEmployees: number
  todayRecords: number
}

interface Employee {
  id: string
  full_name: string
  matricula: number
  is_active: boolean
}

interface DailyRecord {
  id: string
  employee_id: string
  record_type: 'entrada' | 'almoco_ida' | 'almoco_volta' | 'saida'
  recorded_at: string
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const { data, status } = useAdminApi<Metrics>('/admin/metrics')

  // Alertas de ponto: pendências do dia (sem entrada / sem saída)
  const { data: empData } = useAdminApi<{ items: Employee[] }>('/admin/employees')
  const { data: dailyData, status: dailyStatus } = useAdminApi<{ items: DailyRecord[] }>(
    '/admin/time-records/daily',
  )
  const employees = empData?.items ?? []
  const dailyRecords = dailyData?.items ?? []

  const pendencies = employees
    .filter((e) => e.is_active)
    .map((e) => {
      const recs = dailyRecords.filter((r) => r.employee_id === e.id)
      const hasEntry = recs.some((r) => r.record_type === 'entrada')
      const hasExit = recs.some((r) => r.record_type === 'saida')
      if (!hasEntry) return { name: e.full_name, issue: recs.length === 0 ? 'Sem registro hoje' : 'Sem entrada' }
      if (!hasExit) return { name: e.full_name, issue: 'Sem saída' }
      return null
    })
    .filter((p): p is { name: string; issue: string } => p !== null)

  // Último registro de cada colaborador hoje (para o resumo positivo)
  const lastToday = (empId: string): string | null => {
    const recs = dailyRecords
      .filter((r) => r.employee_id === empId)
      .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    if (recs.length === 0) return null
    const last = recs[recs.length - 1]
    const label: Record<string, string> = {
      entrada: 'Entrada',
      almoco_ida: 'Almoço',
      almoco_volta: 'Retorno',
      saida: 'Saída',
    }
    return `${label[last.record_type] ?? last.record_type} ${formatTime(last.recorded_at)}`
  }

  // Sessão expirada -> login.
  useEffect(() => {
    if (status === 'unauth') navigate('/admin/login', { replace: true })
  }, [status, navigate])

  const contentKpis: { label: string; value: number | string; to: string }[] = data
    ? [
        { label: 'Posts publicados', value: data.publishedPosts, to: '/admin/blog' },
        { label: 'Comentários pendentes', value: data.pendingComments, to: '/admin/comments' },
        { label: 'Itens de portfólio', value: data.portfolioItems, to: '/admin/portfolio' },
        { label: 'Mensagens recebidas', value: data.newMessages, to: '/admin/contact' },
      ]
    : [
        { label: 'Posts publicados', value: '—', to: '/admin/blog' },
        { label: 'Comentários pendentes', value: '—', to: '/admin/comments' },
        { label: 'Itens de portfólio', value: '—', to: '/admin/portfolio' },
        { label: 'Mensagens recebidas', value: '—', to: '/admin/contact' },
      ]

  const pontoKpis: { label: string; value: number | string; to: string }[] = data
    ? [
        { label: 'Colaboradores ativos', value: data.activeEmployees, to: '/admin/employees' },
        { label: 'Registros hoje', value: data.todayRecords, to: '/admin/time-records' },
      ]
    : [
        { label: 'Colaboradores ativos', value: '—', to: '/admin/employees' },
        { label: 'Registros hoje', value: '—', to: '/admin/time-records' },
      ]

  return (
    <>
      <Seo title="Dashboard — Projeto Sete Admin" noindex path="/admin/dashboard" />
      <h1 className="font-serif text-3xl text-paper">Dashboard</h1>
      <p className="mt-2 text-mist">
        {status === 'loading'
          ? 'Carregando métricas…'
          : status === 'error'
            ? 'Não foi possível carregar as métricas.'
            : 'Visão geral do conteúdo e ponto eletrônico.'}
      </p>

      {/* Métricas de Conteúdo */}
      <div className="mt-8">
        <h2 className="text-xs uppercase tracking-eyebrow text-mist mb-4"><span aria-hidden="true">📄</span> Conteúdo</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {contentKpis.map((kpi) => (
            <Link
              key={kpi.label}
              to={kpi.to}
              className="card-line rounded bg-graphite p-6 transition-colors hover:border-brass"
            >
              <p className="eyebrow">{kpi.label}</p>
              <p className="mt-3 font-serif text-4xl text-paper">{kpi.value}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Métricas de Ponto Eletrônico */}
      {data && (
        <div className="mt-8">
          <h2 className="text-xs uppercase tracking-eyebrow text-mist mb-4"><span aria-hidden="true">🕐</span> Ponto Eletrônico</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {pontoKpis.map((kpi) => (
              <Link
                key={kpi.label}
                to={kpi.to}
                className="card-line rounded bg-graphite p-6 transition-colors hover:border-brass"
              >
                <p className="eyebrow">{kpi.label}</p>
                <p className="mt-3 font-serif text-4xl text-paper">{kpi.value}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Alertas de Ponto — pendências do dia */}
      {data && (
        <div className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-eyebrow text-mist">
              <span aria-hidden="true">🚨</span> Alertas de Ponto — hoje
            </h2>
            <Link
              to="/admin/time-records"
              className="text-xs text-brass link-underline"
            >
              Ver registros completos
            </Link>
          </div>

          {dailyStatus === 'error' ? (
            <div className="card-line rounded bg-graphite p-5">
              <p className="text-sm text-mist">
                Não foi possível carregar as pendências do dia. Tente novamente em instantes.
              </p>
            </div>
          ) : pendencies.length === 0 ? (
            <div className="card-line rounded bg-green-900/10 border-green-800/40 p-5">
              <p className="flex items-center gap-2 text-sm text-green-400">
                ✅ Nenhuma pendência hoje — todos os colaboradores ativos registraram entrada e saída.
              </p>
            </div>
          ) : (
            <div className="card-line rounded bg-yellow-900/10 border-yellow-800/40 p-5">
              <p className="text-sm font-medium text-yellow-300">
                {pendencies.length} colaborador{pendencies.length !== 1 ? 'es' : ''} com pendência hoje
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {pendencies.map((p) => (
                  <li key={p.name} className="flex items-center justify-between gap-3 rounded-lg border border-yellow-800/50 bg-ink/50 px-3 py-2 text-xs">
                    <span className="font-medium text-paper">{p.name}</span>
                    <span className="text-yellow-300">{p.issue}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Status rápido por colaborador */}
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {employees
              .filter((e) => e.is_active)
              .map((e) => {
                const last = lastToday(e.id)
                const hasPendency = pendencies.some((p) => p.name === e.full_name)
                return (
                  <div
                    key={e.id}
                    className={`rounded-lg border px-3 py-2 text-xs ${hasPendency ? 'border-yellow-800/50' : 'border-graphite-light'}`}
                  >
                    <span className="font-medium text-paper">{e.full_name}</span>
                    <span className={`ml-2 ${hasPendency ? 'text-yellow-300' : 'text-green-400'}`}>
                      {last ?? '—'}
                    </span>
                  </div>
                )
              })}
          </div>

          <p className="mt-3 text-[11px] text-smoke">
            Alerta automático por e-mail enviado todos os dias às 18h quando houver pendências.
          </p>
        </div>
      )}
    </>
  )
}
