import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi, adminRequest } from '@/hooks/useAdminApi'
import { Button } from '@/components/ui/Button'
import { LoadingState } from '@/components/ui/LoadingState'
import { ApiError } from '@/lib/apiClient'

interface Employee {
  id: string
  matricula: number
  full_name: string
  phone: string
  role: string
  birth_date: string
  is_active: boolean
  created_at: string
}

interface CreatedEmployee {
  employee: Employee
  generatedPin: string
}

function phoneMask(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
  }
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3')
}

export function AdminEmployees() {
  const { data, status, refetch } = useAdminApi<{ items: Employee[] }>('/admin/employees')
  const items = data?.items ?? []

  const [draft, setDraft] = useState({ fullName: '', phone: '', role: '', birthDate: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedPin, setGeneratedPin] = useState<string | null>(null)
  const [lastCreatedMatricula, setLastCreatedMatricula] = useState<number | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [resetPinId, setResetPinId] = useState<string | null>(null)

  const save = async () => {
    if (!draft.fullName || !draft.phone || !draft.role || !draft.birthDate) {
      setError('Preencha todos os campos.')
      return
    }
    setSaving(true)
    setError(null)
    setGeneratedPin(null)
    try {
      if (editing) {
        await adminRequest(`/admin/employees/${editing}`, {
          method: 'PATCH',
          body: { fullName: draft.fullName, phone: draft.phone, role: draft.role, birthDate: draft.birthDate },
        })
        setEditing(null)
      } else {
        const res = await adminRequest<CreatedEmployee>('/admin/employees', {
          method: 'POST',
          body: draft,
        })
        setGeneratedPin(res.generatedPin)
        setLastCreatedMatricula(res.employee.matricula)
      }
      setDraft({ fullName: '', phone: '', role: '', birthDate: '' })
      refetch()
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (emp: Employee) => {
    await adminRequest(`/admin/employees/${emp.id}`, {
      method: 'PATCH',
      body: { isActive: !emp.is_active },
    })
    refetch()
  }

  const startEdit = (emp: Employee) => {
    setEditing(emp.id)
    setDraft({
      fullName: emp.full_name,
      phone: emp.phone,
      role: emp.role,
      birthDate: emp.birth_date,
    })
  }

  const resetPin = async (id: string) => {
    setResetPinId(id)
    try {
      const res = await adminRequest<{ employee: Employee; generatedPin: string }>(
        `/admin/employees/${id}`,
        { method: 'PATCH', body: { resetPin: true } },
      )
      setGeneratedPin(`Novo PIN: ${res.generatedPin}. Repasse ao funcionário.`)
    } catch {
      setError('Erro ao redefinir PIN.')
    } finally {
      setResetPinId(null)
    }
  }

  return (
    <>
      <Seo title="Colaboradores — Projeto Sete Admin" noindex />
      <h1 className="font-serif text-3xl text-paper">Colaboradores</h1>
      <p className="mt-2 text-mist">Cadastro de funcionários para o ponto eletrônico.</p>

      {/* Formulário */}
      <div className="mt-6 card-line bg-graphite p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Nome</label>
            <input
              value={draft.fullName}
              onChange={(e) => setDraft({ ...draft, fullName: e.target.value })}
              className="admin-input"
              placeholder="Nome completo"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Telefone</label>
            <input
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: phoneMask(e.target.value) })}
              className="admin-input"
              placeholder="(85) 99999-8888"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Cargo</label>
            <input
              value={draft.role}
              onChange={(e) => setDraft({ ...draft, role: e.target.value })}
              className="admin-input"
              placeholder="Ex: Marceneiro"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs uppercase tracking-eyebrow text-mist">Nascimento</label>
            <input
              type="date"
              value={draft.birthDate}
              onChange={(e) => setDraft({ ...draft, birthDate: e.target.value })}
              className="admin-input"
            />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-error">{error}</p>}
        {generatedPin && (
          <p className="mt-3 rounded border border-success/30 bg-success/10 p-3 text-sm text-green-400">
            {lastCreatedMatricula
              ? `✅ Colaborador criado! Matrícula: ${lastCreatedMatricula} · PIN: ${generatedPin}. Repasse ao funcionário.`
              : generatedPin}
          </p>
        )}

        <div className="mt-4 flex gap-3">
          <Button onClick={save} variant="primary" disabled={saving}>
            {saving ? 'Salvando…' : editing ? 'Atualizar' : 'Adicionar'}
          </Button>
          {editing && (
            <Button onClick={() => { setEditing(null); setDraft({ fullName: '', phone: '', role: '', birthDate: '' }) }} variant="ghost">
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {/* Lista */}
      {status === 'loading' && <LoadingState className="py-16" />}
      {items.length > 0 && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-graphite-light text-xs uppercase tracking-eyebrow text-mist">
                <th className="py-3 pr-4">Matrícula</th>
                <th className="py-3 pr-4">Nome</th>
                <th className="py-3 pr-4">Telefone</th>
                <th className="py-3 pr-4">Cargo</th>
                <th className="py-3 pr-4">Ativo</th>
                <th className="py-3 pr-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-light">
              {items.map((emp) => (
                <tr key={emp.id} className="hover:bg-graphite-light/30">
                  <td className="py-3 pr-4 font-mono text-xs text-mist">{emp.matricula}</td>
                  <td className="py-3 pr-4 font-medium text-paper">{emp.full_name}</td>
                  <td className="py-3 pr-4 text-mist">{emp.phone}</td>
                  <td className="py-3 pr-4 text-mist">{emp.role}</td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => toggleActive(emp)}
                      className={`badge ${emp.is_active ? 'border-success/50 text-success' : 'border-graphite-light text-mist'}`}
                    >
                      {emp.is_active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="flex gap-3">
                      <button onClick={() => startEdit(emp)} className="text-xs text-brass link-underline">Editar</button>
                      <button onClick={() => resetPin(emp.id)} disabled={resetPinId === emp.id} className="text-xs text-brass link-underline">
                        {resetPinId === emp.id ? '…' : 'Resetar PIN'}
                      </button>
                    </div>
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
