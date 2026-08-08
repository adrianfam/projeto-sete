import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi, adminRequest } from '@/hooks/useAdminApi'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { ApiError } from '@/lib/apiClient'
import {
  propertyPhaseOptions,
  roomOptions,
  annualVolumeOptions,
  type ClientType,
} from '@projeto-sete/shared'
import { cn } from '@/lib/utils'

interface ClientRow {
  id: string
  client_type: ClientType
  full_name: string
  email: string | null
  whatsapp: string | null
  prefer_messages: boolean | null
  status: 'lead' | 'active'
  city: string | null
  neighborhood: string | null
  property_phase: string | null
  delivery_date: string | null
  rooms: string[] | null
  professional_reg: string | null
  office_name: string | null
  portfolio_url: string | null
  annual_volume: string | null
  created_at: string
  auth_user_id: string | null
}

interface Draft {
  clientType: ClientType
  fullName: string
  email: string
  whatsapp: string
  preferMessages: boolean
  city: string
  neighborhood: string
  propertyPhase: string
  deliveryDate: string
  rooms: string[]
  professionalReg: string
  officeName: string
  portfolioUrl: string
  annualVolume: string
}

const emptyDraft: Draft = {
  clientType: 'final',
  fullName: '',
  email: '',
  whatsapp: '',
  preferMessages: false,
  city: '',
  neighborhood: '',
  propertyPhase: '',
  deliveryDate: '',
  rooms: [],
  professionalReg: '',
  officeName: '',
  portfolioUrl: '',
  annualVolume: '',
}

function phoneMask(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3')
}

export function AdminClients() {
  const [tab, setTab] = useState<'all' | 'final' | 'architect'>('all')
  const [q, setQ] = useState('')
  const [query, setQuery] = useState('')
  const params = new URLSearchParams()
  if (tab !== 'all') params.set('type', tab)
  if (query) params.set('q', query)
  const { data, status, refetch } = useAdminApi<{ items: ClientRow[] }>(
    `/admin/clients?${params.toString()}`,
  )
  const items = data?.items ?? []

  const [editing, setEditing] = useState<ClientRow | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const startCreate = () => {
    setEditing(null)
    setDraft(emptyDraft)
    setError(null)
  }

  const startEdit = (row: ClientRow) => {
    setEditing(row)
    setError(null)
    // Preenche o formulário com os dados reais para que o PATCH
    // não sobrescreva campos ausentes com null/vazio.
    setDraft({
      ...emptyDraft,
      clientType: row.client_type,
      fullName: row.full_name,
      email: row.email ?? '',
      whatsapp: row.whatsapp ?? '',
      preferMessages: row.prefer_messages ?? false,
      city: row.city ?? '',
      neighborhood: row.neighborhood ?? '',
      propertyPhase: row.property_phase ?? '',
      deliveryDate: row.delivery_date ?? '',
      rooms: row.rooms ?? [],
      professionalReg: row.professional_reg ?? '',
      officeName: row.office_name ?? '',
      portfolioUrl: row.portfolio_url ?? '',
      annualVolume: row.annual_volume ?? '',
    })
  }

  const save = async () => {
    if (draft.fullName.trim().length < 2) {
      setError('Informe o nome.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await adminRequest(`/admin/clients/${editing.id}`, {
          method: 'PATCH',
          body: {
            clientType: draft.clientType,
            fullName: draft.fullName,
            email: draft.email || null,
            whatsapp: draft.whatsapp || null,
            preferMessages: draft.preferMessages,
            city: draft.city || null,
            neighborhood: draft.neighborhood || null,
            propertyPhase: draft.propertyPhase || null,
            deliveryDate: draft.deliveryDate || null,
            rooms: draft.rooms,
            professionalReg: draft.professionalReg || null,
            officeName: draft.officeName || null,
            portfolioUrl: draft.portfolioUrl || null,
            annualVolume: draft.annualVolume || null,
          },
        })
      } else {
        await adminRequest('/admin/clients', { method: 'POST', body: draft })
      }
      setDraft(emptyDraft)
      setEditing(null)
      refetch()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const toggleStatus = async (row: ClientRow) => {
    await adminRequest(`/admin/clients/${row.id}`, {
      method: 'PATCH',
      body: { status: row.status === 'lead' ? 'active' : 'lead' },
    })
    refetch()
  }

  return (
    <>
      <Seo title="Clientes — Projeto Sete Admin" noindex />
      <h1 className="font-serif text-3xl text-paper">Clientes</h1>
      <p className="mt-2 text-mist">Clientes finais e arquitetos cadastrados no portal.</p>

      {/* Filtros */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {([
            { key: 'all', label: 'Todos' },
            { key: 'final', label: '🏠 Clientes Finais' },
            { key: 'architect', label: '✏️ Arquitetos' },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn('admin-tab', tab === t.key && 'admin-tab-active')}
            >
              {t.label}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setQuery(q)
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nome…"
            className="admin-input w-56"
          />
          <Button type="submit" variant="ghost" size="sm">Buscar</Button>
        </form>
      </div>

      {/* Formulário criar/editar */}
      <div className="mt-6 card-line bg-graphite p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-paper">{editing ? '✏️ Editar cliente' : '＋ Novo cliente'}</p>
          {editing && (
            <button onClick={startCreate} className="text-xs text-mist hover:text-paper">Cancelar edição</button>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          {(['final', 'architect'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set('clientType', t)}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm transition-colors',
                draft.clientType === t ? 'border-brass bg-brass/15 text-brass-soft' : 'border-graphite-light text-mist hover:border-smoke',
              )}
            >
              {t === 'final' ? '🏠 Cliente Final' : '✏️ Arquiteto'}
            </button>
          ))}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Nome *</label>
            <input value={draft.fullName} onChange={(e) => set('fullName', e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">E-mail</label>
            <input type="email" value={draft.email} onChange={(e) => set('email', e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">WhatsApp</label>
            <input value={draft.whatsapp} onChange={(e) => set('whatsapp', phoneMask(e.target.value))} className="admin-input" placeholder="(85) 99999-9999" />
          </div>

          {draft.clientType === 'final' ? (
            <>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Cidade</label>
                <input value={draft.city} onChange={(e) => set('city', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Bairro / Condomínio</label>
                <input value={draft.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Fase do imóvel</label>
                <select value={draft.propertyPhase} onChange={(e) => set('propertyPhase', e.target.value)} className="admin-input">
                  <option value="">—</option>
                  {propertyPhaseOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Previsão de entrega</label>
                <input type="month" value={draft.deliveryDate} onChange={(e) => set('deliveryDate', e.target.value)} className="admin-input" />
              </div>
              <div className="sm:col-span-2 lg:col-span-2">
                <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Cômodos de interesse</label>
                <div className="flex flex-wrap gap-2">
                  {roomOptions.map((room) => (
                    <button
                      key={room}
                      type="button"
                      onClick={() =>
                        set('rooms', draft.rooms.includes(room) ? draft.rooms.filter((r) => r !== room) : [...draft.rooms, room])
                      }
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs transition-colors',
                        draft.rooms.includes(room) ? 'border-brass bg-brass/15 text-brass-soft' : 'border-graphite-light text-mist',
                      )}
                    >
                      {room}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm text-mist">
                <input type="checkbox" checked={draft.preferMessages} onChange={(e) => set('preferMessages', e.target.checked)} className="h-4 w-4 accent-brass" />
                Prefere contato por mensagens
              </label>
            </>
          ) : (
            <>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Registro profissional</label>
                <input value={draft.professionalReg} onChange={(e) => set('professionalReg', e.target.value)} className="admin-input" placeholder="CAU/CREA/ABD" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Escritório</label>
                <input value={draft.officeName} onChange={(e) => set('officeName', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Portfólio (URL)</label>
                <input value={draft.portfolioUrl} onChange={(e) => set('portfolioUrl', e.target.value)} className="admin-input" />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Volume anual</label>
                <select value={draft.annualVolume} onChange={(e) => set('annualVolume', e.target.value)} className="admin-input">
                  <option value="">—</option>
                  {annualVolumeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-error">{error}</p>}

        <div className="mt-4 flex gap-3">
          <Button onClick={save} variant="primary" disabled={saving}>
            {saving ? 'Salvando…' : editing ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </div>

      {/* Lista */}
      {status === 'loading' && <LoadingState className="py-16" />}
      {items.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-graphite-light text-xs uppercase tracking-eyebrow text-mist">
                <th className="py-3 pr-4">Nome</th>
                <th className="py-3 pr-4">Tipo</th>
                <th className="py-3 pr-4">E-mail</th>
                <th className="py-3 pr-4">WhatsApp</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-light">
              {items.map((row) => (
                <tr key={row.id} className="hover:bg-graphite-light/30">
                  <td className="py-3 pr-4 font-medium text-paper">
                    {row.full_name}
                    <span className="block text-xs text-mist">{row.city ?? row.office_name ?? ''}</span>
                  </td>
                  <td className="py-3 pr-4 text-mist">{row.client_type === 'architect' ? '✏️ Arquiteto' : '🏠 Final'}</td>
                  <td className="py-3 pr-4 text-mist">{row.email ?? '—'}</td>
                  <td className="py-3 pr-4 text-mist">{row.whatsapp ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => toggleStatus(row)}
                      className={cn(
                        'badge transition-colors',
                        row.status === 'active' ? 'border-success/50 text-success' : 'border-yellow-700/50 text-yellow-500',
                      )}
                      title="Clique para alternar"
                    >
                      {row.status === 'active' ? 'Ativo' : 'Lead'}
                    </button>
                  </td>
                  <td className="py-3 pr-4">
                    <button onClick={() => startEdit(row)} className="text-xs text-brass link-underline">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
