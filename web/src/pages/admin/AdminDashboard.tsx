import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi } from '@/hooks/useAdminApi'
import { Link } from 'react-router-dom'

interface Metrics {
  publishedPosts: number
  pendingComments: number
  portfolioItems: number
  newMessages: number
  activeEmployees: number
  todayRecords: number
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const { data, status } = useAdminApi<Metrics>('/admin/metrics')

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
    </>
  )
}
