import { Seo } from '@/components/seo/Seo'

/** Placeholder do dashboard — métricas reais conectadas na FASE 3. */
export function AdminDashboard() {
  return (
    <>
      <Seo title="Dashboard — Projeto Sete Admin" noindex path="/admin/dashboard" />
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <p className="mt-2 text-smoke">Visão geral do conteúdo. Métricas conectadas na Fase 3.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Posts publicados', value: '—' },
          { label: 'Comentários pendentes', value: '—' },
          { label: 'Itens de portfólio', value: '—' },
          { label: 'Mensagens recebidas', value: '—' },
        ].map((kpi) => (
          <div key={kpi.label} className="card-line rounded bg-paper p-6">
            <p className="eyebrow">{kpi.label}</p>
            <p className="mt-3 font-serif text-4xl">{kpi.value}</p>
          </div>
        ))}
      </div>
    </>
  )
}
