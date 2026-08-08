import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { LoadingState } from '@/components/ui/LoadingState'
import { useClienteApi, clienteRequest } from '@/lib/clienteClient'
import { KitExperienceCard } from './KitExperienceCard'
import {
  projectStatusOrder,
  projectStatusLabels,
  propertyPhaseOptions,
  roomOptions,
  annualVolumeOptions,
  contactStatusLabels,
  type ClientType,
  type ContactStatus,
  type ProjectStatus,
} from '@projeto-sete/shared'
import { cn } from '@/lib/utils'

interface Profile {
  id: string
  client_type: ClientType
  full_name: string
  email: string | null
  whatsapp: string | null
  status: 'lead' | 'active'
}

interface Project {
  id: string
  client_id: string
  architect_id: string | null
  title: string
  status: ProjectStatus
  notes: string | null
  client_name: string | null
  architect_name: string | null
  created_at: string
}

interface FileItem {
  id: string
  name: string
  file_type: string
  created_at: string
}

interface EventItem {
  id: string
  project_id: string
  title: string
  scheduled_at: string
  professional: string
  notes: string | null
}

const inputCls =
  'mt-1 w-full rounded-lg border border-graphite-light bg-graphite px-4 py-3 text-paper outline-none transition-colors focus:border-brass placeholder:text-mist/40'
const labelCls = 'block text-xs uppercase tracking-eyebrow text-mist'

export function ClienteHub() {
  const me = useClienteApi<{ profile: Profile | null }>('/cliente/me')
  const profile = me.data?.profile ?? null

  if (me.status === 'loading' || me.status === 'idle') {
    return (
      <>
        <Seo title="Meu Espaço — Projeto Sete" noindex path="/cliente" />
        <LoadingState className="py-16" />
      </>
    )
  }

  return (
    <>
      <Seo title="Meu Espaço — Projeto Sete" noindex path="/cliente" />
      {profile ? <HubWithProfile key={profile.id} profile={profile} /> : <CompleteProfile />}
    </>
  )
}

// ---------------------------------------------------------------------------
// Perfil ainda não criado (cadastro pós-confirmação de e-mail)
// ---------------------------------------------------------------------------
function CompleteProfile() {
  const [draft, setDraft] = useState({
    clientType: 'final' as ClientType,
    fullName: '',
    whatsapp: '',
    city: '',
    neighborhood: '',
    propertyPhase: '',
    deliveryDate: '',
    rooms: [] as string[],
    professionalReg: '',
    officeName: '',
    annualVolume: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const toggleRoom = (room: string) =>
    setDraft((d) => ({
      ...d,
      rooms: d.rooms.includes(room) ? d.rooms.filter((r) => r !== room) : [...d.rooms, room],
    }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (draft.fullName.trim().length < 2) return setError('Informe seu nome completo.')
    setSaving(true)
    try {
      await clienteRequest('/cliente/profile', {
        method: 'POST',
        body: {
          clientType: draft.clientType,
          fullName: draft.fullName,
          whatsapp: draft.whatsapp || null,
          preferMessages: false,
          city: draft.city || null,
          neighborhood: draft.neighborhood || null,
          propertyPhase: draft.propertyPhase || null,
          deliveryDate: draft.deliveryDate || null,
          rooms: draft.rooms,
          professionalReg: draft.professionalReg || null,
          officeName: draft.officeName || null,
          portfolioUrl: null,
          annualVolume: draft.annualVolume || null,
        },
      })
      setSaved(true)
      window.location.reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (saved) return <LoadingState className="py-16" />

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl text-paper">Complete seu cadastro</h1>
      <p className="mt-2 text-mist">Faltam só alguns detalhes para liberar seu espaço.</p>

      <form onSubmit={submit} className="mt-8 space-y-5 card-line bg-graphite p-6">
        <div className="flex gap-3">
          {(['final', 'architect'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setDraft((d) => ({ ...d, clientType: t }))}
              className={cn(
                'flex-1 rounded-lg border px-4 py-3 text-sm transition-colors',
                draft.clientType === t
                  ? 'border-brass bg-brass/15 text-brass-soft'
                  : 'border-graphite-light text-mist hover:border-smoke',
              )}
            >
              {t === 'final' ? '🏠 Cliente Final' : '✏️ Arquiteto'}
            </button>
          ))}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Nome completo *</label>
            <input className={inputCls} value={draft.fullName} onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))} />
          </div>
          <div>
            <label className={labelCls}>WhatsApp</label>
            <input className={inputCls} value={draft.whatsapp} onChange={(e) => setDraft((d) => ({ ...d, whatsapp: e.target.value }))} placeholder="(85) 99999-9999" />
          </div>
          {draft.clientType === 'final' ? (
            <>
              <div>
                <label className={labelCls}>Cidade</label>
                <input className={inputCls} value={draft.city} onChange={(e) => setDraft((d) => ({ ...d, city: e.target.value }))} />
              </div>
              <div>
                <label className={labelCls}>Fase do imóvel</label>
                <select className={inputCls} value={draft.propertyPhase} onChange={(e) => setDraft((d) => ({ ...d, propertyPhase: e.target.value }))}>
                  <option value="">Selecione…</option>
                  {propertyPhaseOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Cômodos de interesse</label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {roomOptions.map((room) => (
                    <button
                      key={room}
                      type="button"
                      onClick={() => toggleRoom(room)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs transition-colors',
                        draft.rooms.includes(room)
                          ? 'border-brass bg-brass/15 text-brass-soft'
                          : 'border-graphite-light text-mist hover:border-smoke',
                      )}
                    >
                      {room}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelCls}>Registro profissional</label>
                <input className={inputCls} value={draft.professionalReg} onChange={(e) => setDraft((d) => ({ ...d, professionalReg: e.target.value }))} placeholder="CAU/CREA/ABD" />
              </div>
              <div>
                <label className={labelCls}>Volume anual</label>
                <select className={inputCls} value={draft.annualVolume} onChange={(e) => setDraft((d) => ({ ...d, annualVolume: e.target.value }))}>
                  <option value="">Selecione…</option>
                  {annualVolumeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Escritório / portfólio</label>
                <input className={inputCls} value={draft.officeName} onChange={(e) => setDraft((d) => ({ ...d, officeName: e.target.value }))} />
              </div>
            </>
          )}
        </div>

        {error && <p className="text-sm text-error">{error}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-brass px-6 py-3.5 font-semibold text-ink transition-all hover:bg-brass-soft active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? 'Salvando…' : 'Salvar e entrar no meu espaço'}
        </button>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Hub com perfil (estágio lead ou cliente ativo)
// ---------------------------------------------------------------------------
function HubWithProfile({ profile }: { profile: Profile }) {
  const projects = useClienteApi<{ items: Project[] }>('/cliente/projects')
  const events = useClienteApi<{ items: EventItem[] }>('/cliente/events')
  const items = projects.data?.items ?? []
  const upcoming = events.data?.items ?? []

  const isLead = items.length === 0 || profile.status === 'lead'

  return (
    <div className="mx-auto max-w-4xl">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-eyebrow text-brass-soft">Meu espaço</p>
          <h1 className="mt-1 font-serif text-3xl text-paper">
            Olá, {profile.full_name.split(' ')[0]} 👋
          </h1>
        </div>
        <span className="badge border-brass/40 text-brass-soft">
          {profile.client_type === 'architect' ? '✏️ Arquiteto' : '🏠 Cliente'}
        </span>
      </div>

      {projects.status === 'loading' ? (
        <LoadingState className="py-16" />
      ) : isLead ? (
        <LeadView />
      ) : (
        <ActiveView items={items} upcoming={upcoming} />
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Estágio lead: orçamentos + kit experience
// ---------------------------------------------------------------------------
interface BudgetItem {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: ContactStatus
  created_at: string
}

function statusBadge(status: ContactStatus) {
  switch (status) {
    case 'replied':
      return 'border-success/50 text-success'
    case 'archived':
      return 'border-graphite-light text-mist'
    case 'read':
      return 'border-brass/40 text-brass-soft'
    default:
      return 'border-yellow-700/50 text-yellow-500'
  }
}

function LeadView() {
  const budgets = useClienteApi<{ items: BudgetItem[] }>('/cliente/budgets')
  const items = budgets.data?.items ?? []

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <div className="card-line bg-graphite p-6">
        <p className="text-2xl">📋</p>
        <h2 className="mt-3 font-serif text-xl text-paper">Meus Orçamentos</h2>

        {budgets.status === 'loading' ? (
          <p className="mt-3 text-sm text-mist">Carregando…</p>
        ) : items.length === 0 ? (
          <p className="mt-2 text-sm text-mist">
            Você ainda não enviou nenhum orçamento. Quando enviar pelo site
            logado, ele aparece aqui no seu histórico.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {items.map((b) => (
              <li key={b.id} className="rounded-lg border border-graphite-light bg-charcoal px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-paper">{b.subject ?? 'Orçamento'}</p>
                  <span className={cn('badge shrink-0', statusBadge(b.status))}>{contactStatusLabels[b.status]}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-mist">{b.message}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wider text-mist/60">
                  {new Date(b.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            to="/contato"
            className="inline-flex items-center gap-2 rounded-lg bg-brass px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-brass-soft"
          >
            Novo orçamento →
          </Link>
          <Link
            to="/contato?subject=Revisão técnica do meu orçamento"
            className="inline-flex items-center gap-2 rounded-lg border border-brass/50 px-4 py-2.5 text-sm font-semibold text-brass-soft transition-colors hover:bg-brass/15"
          >
            Solicitar revisão técnica
          </Link>
        </div>
      </div>

      <KitExperienceCard />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Estágio cliente ativo: timeline + downloads + eventos
// ---------------------------------------------------------------------------
function ActiveView({ items, upcoming }: { items: Project[]; upcoming: EventItem[] }) {
  const [selectedId, setSelectedId] = useState<string>(items[0]?.id ?? '')
  const project = items.find((p) => p.id === selectedId) ?? items[0]

  if (!project) return null

  return (
    <div className="mt-8 space-y-6">
      {/* Seletor de projeto */}
      {items.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {items.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={cn(
                'rounded-full border px-4 py-1.5 text-sm transition-colors',
                p.id === project.id
                  ? 'border-brass bg-brass/15 text-brass-soft'
                  : 'border-graphite-light text-mist hover:border-smoke',
              )}
            >
              {p.title}
            </button>
          ))}
        </div>
      )}

      {/* Timeline */}
      <section className="card-line bg-graphite p-6">
        <p className="text-xs uppercase tracking-eyebrow text-mist">Linha do tempo</p>
        <h2 className="mt-1 font-serif text-2xl text-paper">{project.title}</h2>
        {project.architect_name && (
          <p className="mt-1 text-sm text-mist">Arquiteto(a) parceiro(a): {project.architect_name}</p>
        )}
        <StatusTimeline current={project.status} />
        {project.notes && <p className="mt-4 text-sm text-mist">{project.notes}</p>}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <ProjectDownloads projectId={project.id} />
        <NextEvents events={upcoming.filter((e) => e.project_id === project.id)} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Link
          to="/cliente/inspiracoes"
          className="card-line group bg-graphite p-6 transition-colors hover:border-brass/40"
        >
          <p className="text-2xl">🖼️</p>
          <h2 className="mt-3 font-serif text-xl text-paper group-hover:text-brass-soft">Pasta de Inspirações</h2>
          <p className="mt-2 text-sm text-mist">
            Salve ideias de ambientes e acabamentos que combinam com o seu projeto.
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brass-soft">
            Abrir pasta →
          </span>
        </Link>
        <KitExperienceCard compact />
      </div>
    </div>
  )
}

function StatusTimeline({ current }: { current: ProjectStatus }) {
  const currentIndex = projectStatusOrder.indexOf(current)

  return (
    <ol className="mt-6 flex flex-wrap gap-y-4">
      {projectStatusOrder.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <li key={step} className="flex flex-1 items-start gap-2 last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors',
                  done && 'border-green-600/60 bg-green-900/40 text-green-400',
                  active && 'border-brass bg-brass text-ink',
                  !done && !active && 'border-graphite-light text-mist/40',
                )}
              >
                {done ? '✓' : i + 1}
              </span>
              {i < projectStatusOrder.length - 1 && (
                <span className={cn('mt-1 h-full w-px flex-1', done ? 'bg-green-700/50' : 'bg-graphite-light')} />
              )}
            </div>
            <span
              className={cn(
                'pt-1.5 text-xs leading-tight',
                active ? 'font-semibold text-brass-soft' : done ? 'text-mist' : 'text-mist/40',
              )}
            >
              {projectStatusLabels[step]}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function ProjectDownloads({ projectId }: { projectId: string }) {
  const files = useClienteApi<{ items: FileItem[] }>(`/cliente/projects/${projectId}/files`)
  const items = files.data?.items ?? []

  const download = async (fileId: string) => {
    try {
      const res = await clienteRequest<{ url: string; name: string }>(`/cliente/files/${fileId}/sign`)
      window.open(res.url, '_blank', 'noopener')
    } catch {
      /* link expirado ou sem acesso */
    }
  }

  return (
    <section className="card-line bg-graphite p-6">
      <p className="text-xs uppercase tracking-eyebrow text-mist">Central de Downloads</p>
      <h2 className="mt-1 font-serif text-xl text-paper">Arquivos do seu projeto</h2>

      {files.status === 'loading' ? (
        <p className="mt-4 text-sm text-mist">Carregando…</p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-sm text-mist">Nenhum arquivo publicado ainda.</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {items.map((f) => (
            <li key={f.id} className="flex items-center gap-3 rounded-lg border border-graphite-light bg-charcoal px-4 py-3">
              <span className="text-lg">📄</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-paper">{f.name}</p>
                <p className="text-[10px] uppercase tracking-wider text-mist/60">
                  {new Date(f.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <button
                onClick={() => download(f.id)}
                className="shrink-0 rounded-lg border border-brass/50 px-3 py-1.5 text-xs font-medium text-brass-soft transition-colors hover:bg-brass/15"
              >
                Baixar
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function NextEvents({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null

  return (
    <section className="card-line bg-graphite p-6">
      <p className="text-xs uppercase tracking-eyebrow text-mist">Próximos eventos</p>
      <h2 className="mt-1 font-serif text-xl text-paper">Agenda</h2>
      <ul className="mt-4 space-y-3">
        {events.map((ev) => (
          <li key={ev.id} className="rounded-lg border border-brass/30 bg-brass/5 p-4">
            <p className="text-sm font-semibold text-brass-soft">📅 {ev.title}</p>
            <p className="mt-1 text-sm text-paper">
              {new Date(ev.scheduled_at).toLocaleString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
            <p className="mt-0.5 text-xs text-mist">Com {ev.professional}</p>
            {ev.notes && <p className="mt-1 text-xs text-mist">{ev.notes}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
