import { useEffect, useRef, useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi, adminRequest } from '@/hooks/useAdminApi'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { ApiError } from '@/lib/apiClient'
import {
  projectStatusOrder,
  projectStatusLabels,
  type ProjectStatus,
} from '@projeto-sete/shared'
import { cn } from '@/lib/utils'

interface ProjectRow {
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

interface ClientOpt {
  id: string
  full_name: string
}

interface FileRow {
  id: string
  name: string
  file_type: string
  mime_type: string | null
  created_at: string
}

interface EventRow {
  id: string
  title: string
  scheduled_at: string
  professional: string
  notes: string | null
}

export function AdminProjects() {
  const { data, status, refetch } = useAdminApi<{ items: ProjectRow[] }>('/admin/projects')
  const items = data?.items ?? []
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  return (
    <>
      <Seo title="Projetos — Projeto Sete Admin" noindex />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-paper">Projetos</h1>
          <p className="mt-2 text-mist">Acompanhamento dos projetos dos clientes.</p>
        </div>
        <Button onClick={() => setShowCreate((v) => !v)} variant="primary">
          {showCreate ? 'Fechar' : '＋ Novo projeto'}
        </Button>
      </div>

      {showCreate && (
        <CreateProject
          onCreated={() => {
            setShowCreate(false)
            refetch()
          }}
        />
      )}

      {selectedId && (
        <ProjectDetail
          projectId={selectedId}
          onClose={() => setSelectedId(null)}
          onChanged={refetch}
        />
      )}

      {status === 'loading' && <LoadingState className="py-16" />}
      {items.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-graphite-light text-xs uppercase tracking-eyebrow text-mist">
                <th className="py-3 pr-4">Projeto</th>
                <th className="py-3 pr-4">Cliente</th>
                <th className="py-3 pr-4">Arquiteto</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-light">
              {items.map((p) => (
                <tr key={p.id} className={cn('hover:bg-graphite-light/30', selectedId === p.id && 'bg-brass/5')}>
                  <td className="py-3 pr-4 font-medium text-paper">{p.title}</td>
                  <td className="py-3 pr-4 text-mist">{p.client_name ?? '—'}</td>
                  <td className="py-3 pr-4 text-mist">{p.architect_name ?? '—'}</td>
                  <td className="py-3 pr-4">
                    <span className="badge border-brass/40 text-brass-soft">{projectStatusLabels[p.status]}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => setSelectedId(selectedId === p.id ? null : p.id)}
                      className="text-xs text-brass link-underline"
                    >
                      {selectedId === p.id ? 'Fechar' : 'Abrir'}
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

// ---------------------------------------------------------------------------
// Criar projeto
// ---------------------------------------------------------------------------
function CreateProject({ onCreated }: { onCreated: () => void }) {
  const clients = useAdminApi<{ items: ClientOpt[] }>('/admin/clients?type=final')
  const architects = useAdminApi<{ items: ClientOpt[] }>('/admin/clients?type=architect')
  const [clientId, setClientId] = useState('')
  const [title, setTitle] = useState('')
  const [architectId, setArchitectId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const save = async () => {
    if (!clientId || !title.trim()) {
      setError('Selecione o cliente e informe o título.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await adminRequest('/admin/projects', {
        method: 'POST',
        body: { clientId, title: title.trim(), architectId: architectId || null },
      })
      setTitle('')
      setArchitectId('')
      onCreated()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao criar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-6 card-line bg-graphite p-6">
      <p className="text-sm font-medium text-paper">Novo projeto</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Cliente *</label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} className="admin-input">
            <option value="">Selecione…</option>
            {(clients.data?.items ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Título *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="admin-input" placeholder="Ex: Closet master" />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Arquiteto (opcional)</label>
          <select value={architectId} onChange={(e) => setArchitectId(e.target.value)} className="admin-input">
            <option value="">Sem arquiteto</option>
            {(architects.data?.items ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.full_name}</option>
            ))}
          </select>
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-error">{error}</p>}
      <Button onClick={save} variant="primary" disabled={saving} className="mt-4">
        {saving ? 'Criando…' : 'Criar projeto'}
      </Button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Detalhe do projeto: timeline, arquiteto, notas, arquivos e eventos
// ---------------------------------------------------------------------------
function ProjectDetail({
  projectId,
  onClose,
  onChanged,
}: {
  projectId: string
  onClose: () => void
  onChanged: () => void
}) {
  const detail = useAdminApi<{ project: ProjectRow & { client_name: string | null; architect_name: string | null }; files: FileRow[]; events: EventRow[] }>(
    `/admin/projects/${projectId}`,
  )
  const architects = useAdminApi<{ items: ClientOpt[] }>('/admin/clients?type=architect')

  const [architectId, setArchitectId] = useState('')
  const [notes, setNotes] = useState('')
  const [savingMeta, setSavingMeta] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [fileType, setFileType] = useState('documento')
  const [uploading, setUploading] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const [evTitle, setEvTitle] = useState('')
  const [evDate, setEvDate] = useState('')
  const [evProf, setEvProf] = useState('')
  const [evNotes, setEvNotes] = useState('')
  const [savingEvent, setSavingEvent] = useState(false)

  useEffect(() => {
    if (detail.data) {
      setArchitectId(detail.data.project.architect_id ?? '')
      setNotes(detail.data.project.notes ?? '')
    }
  }, [detail.data])

  const project = detail.data?.project
  const files = detail.data?.files ?? []
  const events = detail.data?.events ?? []

  const saveMeta = async () => {
    setSavingMeta(true)
    setError(null)
    try {
      await adminRequest(`/admin/projects/${projectId}`, {
        method: 'PATCH',
        body: { architectId: architectId || null, notes: notes || null },
      })
      detail.refetch()
      onChanged()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao salvar.')
    } finally {
      setSavingMeta(false)
    }
  }

  const setStatus = async (status: ProjectStatus) => {
    await adminRequest(`/admin/projects/${projectId}`, { method: 'PATCH', body: { status } })
    detail.refetch()
    onChanged()
  }

  const uploadFile = async (file?: File) => {
    if (!file || !project) return
    setUploading(true)
    setError(null)
    try {
      const sign = await adminRequest<{ signedUrl: string; file: FileRow }>(
        `/admin/projects/${projectId}/files/sign`,
        { method: 'POST', body: { fileName: file.name, contentType: file.type, fileType } },
      )
      const put = await fetch(sign.signedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      })
      if (!put.ok) throw new Error('Falha no upload do arquivo.')
      detail.refetch()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro no upload.')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const deleteFile = async (fileId: string) => {
    await adminRequest(`/admin/projects/${projectId}/files/${fileId}`, { method: 'DELETE' })
    detail.refetch()
  }

  const addEvent = async () => {
    if (!evTitle.trim() || !evDate || !evProf.trim()) {
      setError('Preencha título, data e profissional.')
      return
    }
    setSavingEvent(true)
    setError(null)
    try {
      await adminRequest(`/admin/projects/${projectId}/events`, {
        method: 'POST',
        body: { title: evTitle.trim(), scheduledAt: new Date(evDate).toISOString(), professional: evProf.trim(), notes: evNotes || null },
      })
      setEvTitle('')
      setEvDate('')
      setEvProf('')
      setEvNotes('')
      detail.refetch()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao agendar.')
    } finally {
      setSavingEvent(false)
    }
  }

  const deleteEvent = async (eventId: string) => {
    await adminRequest(`/admin/projects/${projectId}/events/${eventId}`, { method: 'DELETE' })
    detail.refetch()
  }

  if (detail.status === 'loading') return <LoadingState className="py-12" />
  if (!project) return null

  const currentIndex = projectStatusOrder.indexOf(project.status)

  return (
    <div className="mt-6 space-y-6">
      {/* Cabeçalho + timeline */}
      <section className="card-line bg-graphite p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-eyebrow text-mist">Projeto</p>
            <h2 className="mt-1 font-serif text-2xl text-paper">{project.title}</h2>
            <p className="mt-1 text-sm text-mist">
              Cliente: {project.client_name ?? '—'}
              {project.architect_name && <> · Arquiteto: {project.architect_name}</>}
            </p>
          </div>
          <button onClick={onClose} className="text-xs text-mist hover:text-paper">Fechar ✕</button>
        </div>

        {/* Linha do tempo clicável */}
        <p className="mt-6 text-xs uppercase tracking-eyebrow text-mist">Linha do tempo — clique para avançar</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {projectStatusOrder.map((step, i) => (
            <button
              key={step}
              onClick={() => setStatus(step)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs transition-colors',
                i < currentIndex && 'border-green-700/50 bg-green-900/30 text-green-400',
                i === currentIndex && 'border-brass bg-brass text-ink font-semibold',
                i > currentIndex && 'border-graphite-light text-mist/50 hover:border-smoke',
              )}
            >
              {i < currentIndex ? '✓ ' : ''}{projectStatusLabels[step]}
            </button>
          ))}
        </div>
      </section>

      {/* Arquitetos + notas */}
      <section className="card-line bg-graphite p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Vincular arquiteto</label>
            <select value={architectId} onChange={(e) => setArchitectId(e.target.value)} className="admin-input">
              <option value="">Sem arquiteto</option>
              {(architects.data?.items ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Notas</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="admin-input" placeholder="Observações do projeto…" />
          </div>
        </div>
        <Button onClick={saveMeta} variant="primary" size="sm" disabled={savingMeta} className="mt-4">
          {savingMeta ? 'Salvando…' : 'Salvar vínculo e notas'}
        </Button>
      </section>

      {/* Arquivos */}
      <section className="card-line bg-graphite p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-eyebrow text-mist">Central de arquivos</p>
            <h3 className="mt-1 font-serif text-xl text-paper">PDFs, renders, contrato e manuais</h3>
          </div>
          <div className="flex items-center gap-2">
            <select value={fileType} onChange={(e) => setFileType(e.target.value)} className="admin-input w-44">
              <option value="documento">Documento</option>
              <option value="pdf_tecnico">PDF técnico</option>
              <option value="render">Render 3D</option>
              <option value="contrato">Contrato</option>
              <option value="manual">Manual</option>
            </select>
            <input ref={fileInput} type="file" className="hidden" onChange={(e) => uploadFile(e.target.files?.[0])} />
            <Button onClick={() => fileInput.current?.click()} variant="primary" size="sm" disabled={uploading}>
              {uploading ? 'Enviando…' : 'Enviar arquivo'}
            </Button>
          </div>
        </div>

        {files.length === 0 ? (
          <p className="mt-4 text-sm text-mist">Nenhum arquivo ainda.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {files.map((f) => (
              <li key={f.id} className="flex items-center gap-3 rounded-lg border border-graphite-light bg-charcoal px-4 py-3">
                <span className="text-lg">📄</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-paper">{f.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-mist/60">{f.file_type.replace('_', ' ')}</p>
                </div>
                <button onClick={() => deleteFile(f.id)} className="shrink-0 text-xs text-error hover:underline">
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Eventos */}
      <section className="card-line bg-graphite p-6">
        <p className="text-xs uppercase tracking-eyebrow text-mist">Visitas técnicas</p>
        <h3 className="mt-1 font-serif text-xl text-paper">Agendar evento</h3>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Título</label>
            <input value={evTitle} onChange={(e) => setEvTitle(e.target.value)} className="admin-input" placeholder="Medição técnica" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Data e hora</label>
            <input type="datetime-local" value={evDate} onChange={(e) => setEvDate(e.target.value)} className="admin-input" />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Profissional</label>
            <input value={evProf} onChange={(e) => setEvProf(e.target.value)} className="admin-input" placeholder="Marcos" />
          </div>
          <div className="flex items-end">
            <Button onClick={addEvent} variant="primary" size="sm" disabled={savingEvent} className="w-full">
              {savingEvent ? '…' : 'Agendar'}
            </Button>
          </div>
        </div>

        {events.length === 0 ? (
          <p className="mt-4 text-sm text-mist">Nenhuma visita agendada.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {events.map((ev) => (
              <li key={ev.id} className="flex items-center gap-3 rounded-lg border border-brass/30 bg-brass/5 px-4 py-3">
                <span>📅</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brass-soft">{ev.title}</p>
                  <p className="text-xs text-mist">
                    {new Date(ev.scheduled_at).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })} · {ev.professional}
                    {ev.notes ? ` · ${ev.notes}` : ''}
                  </p>
                </div>
                <button onClick={() => deleteEvent(ev.id)} className="shrink-0 text-xs text-error hover:underline">
                  Remover
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  )
}
