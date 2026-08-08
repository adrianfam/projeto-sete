import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { supabase } from '@/lib/supabaseClient'
import { setAdminToken } from '@/lib/adminToken'
import { clienteRequest } from '@/lib/clienteClient'
import {
  propertyPhaseOptions,
  roomOptions,
  annualVolumeOptions,
  type ClientType,
} from '@projeto-sete/shared'
import { cn } from '@/lib/utils'

type Step = 'who' | 'form' | 'sent'

interface Draft {
  clientType: ClientType
  fullName: string
  email: string
  password: string
  confirm: string
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
  password: '',
  confirm: '',
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
  if (digits.length <= 10) {
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3')
  }
  return digits.replace(/^(\d{2})(\d{5})(\d{0,4})$/, '($1) $2-$3')
}

const inputCls =
  'mt-1 w-full rounded-lg border border-graphite-light bg-graphite px-4 py-3 text-paper outline-none transition-colors focus:border-brass placeholder:text-mist/40'
const labelCls = 'block text-xs uppercase tracking-eyebrow text-mist'

export function ClienteSignup() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('who')
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }))

  const toggleRoom = (room: string) =>
    setDraft((d) => ({
      ...d,
      rooms: d.rooms.includes(room) ? d.rooms.filter((r) => r !== room) : [...d.rooms, room],
    }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (draft.fullName.trim().length < 2) return setError('Informe seu nome completo.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) return setError('E-mail inválido.')
    if (draft.password.length < 6) return setError('A senha precisa de pelo menos 6 caracteres.')
    if (draft.password !== draft.confirm) return setError('As senhas não conferem.')
    if (!supabase) return setError('Serviço de cadastro indisponível.')

    setLoading(true)
    try {
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: draft.email.trim(),
        password: draft.password,
      })
      if (signUpErr) {
        setError(signUpErr.message)
        setLoading(false)
        return
      }

      // Cria o perfil imediatamente (com ou sem sessão pós-signup)
      const body = {
        clientType: draft.clientType,
        fullName: draft.fullName,
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
      }

      if (data.session) {
        setAdminToken(data.session.access_token)
        await clienteRequest('/cliente/profile', { method: 'POST', body })
        navigate('/cliente', { replace: true })
        return
      }

      // Confirmação de e-mail habilitada: o perfil é criado após o 1º login
      // (o hub oferece o formulário de cadastro se ainda não existir).
      setStep('sent')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao criar a conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Seo title="Cadastro — Área do Cliente" noindex path="/cliente/cadastro" />
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-charcoal to-ink px-6 py-12">
        <div className="w-full max-w-lg">
          <p className="text-center font-serif text-3xl text-paper">
            Projeto <span className="text-brass">Sete</span>
          </p>
          <p className="mt-2 text-center text-mist">Cadastro sem compromisso</p>

          {step === 'who' && (
            <div className="mt-10 space-y-4">
              <p className="text-center text-sm text-mist">Quem é você?</p>
              <button
                onClick={() => {
                  setDraft((d) => ({ ...d, clientType: 'final' }))
                  setStep('form')
                }}
                className="w-full rounded-xl border border-graphite-light bg-graphite p-6 text-left transition-all hover:border-brass/60 hover:bg-graphite-light/40"
              >
                <p className="text-2xl">🏠</p>
                <p className="mt-2 font-semibold text-paper">Sou Cliente Final</p>
                <p className="mt-1 text-sm text-mist">Quero móveis planejados para minha casa.</p>
              </button>
              <button
                onClick={() => {
                  setDraft((d) => ({ ...d, clientType: 'architect' }))
                  setStep('form')
                }}
                className="w-full rounded-xl border border-graphite-light bg-graphite p-6 text-left transition-all hover:border-brass/60 hover:bg-graphite-light/40"
              >
                <p className="text-2xl">✏️</p>
                <p className="mt-2 font-semibold text-paper">Sou Arquiteto / Designer</p>
                <p className="mt-1 text-sm text-mist">Especifico projetos e acompanho clientes.</p>
              </button>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={submit} className="mt-10 space-y-5 rounded-xl border border-graphite-light bg-ink/60 p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-paper">
                  {draft.clientType === 'final' ? '🏠 Cliente Final' : '✏️ Arquiteto / Designer'}
                </p>
                <button type="button" onClick={() => setStep('who')} className="text-xs text-mist hover:text-paper">
                  ← Voltar
                </button>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Nome completo *</label>
                  <input className={inputCls} value={draft.fullName} onChange={(e) => set('fullName', e.target.value)} placeholder="Seu nome" />
                </div>
                <div>
                  <label className={labelCls}>E-mail *</label>
                  <input type="email" className={inputCls} value={draft.email} onChange={(e) => set('email', e.target.value)} placeholder="seu@email.com" />
                </div>
                <div>
                  <label className={labelCls}>WhatsApp</label>
                  <input inputMode="tel" className={inputCls} value={draft.whatsapp} onChange={(e) => set('whatsapp', phoneMask(e.target.value))} placeholder="(85) 99999-9999" />
                </div>
              </div>

              {draft.clientType === 'final' ? (
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Cidade</label>
                      <input className={inputCls} value={draft.city} onChange={(e) => set('city', e.target.value)} placeholder="Fortaleza" />
                    </div>
                    <div>
                      <label className={labelCls}>Bairro / Condomínio</label>
                      <input className={inputCls} value={draft.neighborhood} onChange={(e) => set('neighborhood', e.target.value)} placeholder="Alto da Balança" />
                    </div>
                    <div>
                      <label className={labelCls}>Fase do imóvel</label>
                      <select className={inputCls} value={draft.propertyPhase} onChange={(e) => set('propertyPhase', e.target.value)}>
                        <option value="">Selecione…</option>
                        {propertyPhaseOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelCls}>Previsão de entrega</label>
                      <input type="month" className={inputCls} value={draft.deliveryDate} onChange={(e) => set('deliveryDate', e.target.value)} />
                    </div>
                  </div>
                  <div>
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
                  <label className="flex items-center gap-2 text-sm text-mist">
                    <input
                      type="checkbox"
                      checked={draft.preferMessages}
                      onChange={(e) => set('preferMessages', e.target.checked)}
                      className="h-4 w-4 accent-brass"
                    />
                    Prefiro contato estritamente por mensagens
                  </label>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className={labelCls}>Registro profissional (CAU/CREA/ABD)</label>
                      <input className={inputCls} value={draft.professionalReg} onChange={(e) => set('professionalReg', e.target.value)} placeholder="CAU-000000" />
                    </div>
                    <div>
                      <label className={labelCls}>Volume médio de projetos/ano</label>
                      <select className={inputCls} value={draft.annualVolume} onChange={(e) => set('annualVolume', e.target.value)}>
                        <option value="">Selecione…</option>
                        {annualVolumeOptions.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Escritório ou link do portfólio</label>
                    <input className={inputCls} value={draft.officeName} onChange={(e) => set('officeName', e.target.value)} placeholder="Nome do escritório ou Instagram/Site" />
                  </div>
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Senha *</label>
                  <input type="password" autoComplete="new-password" className={inputCls} value={draft.password} onChange={(e) => set('password', e.target.value)} placeholder="••••••" />
                </div>
                <div>
                  <label className={labelCls}>Confirmar senha *</label>
                  <input type="password" autoComplete="new-password" className={inputCls} value={draft.confirm} onChange={(e) => set('confirm', e.target.value)} placeholder="••••••" />
                </div>
              </div>

              {error && <p className="text-sm text-error" role="alert">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-brass px-6 py-3.5 font-semibold text-ink transition-all hover:bg-brass-soft active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Criando conta…' : 'Criar minha conta'}
              </button>
              <p className="text-center text-xs text-mist">
                Sem compromisso: você só acompanha seus orçamentos e projetos.
              </p>
            </form>
          )}

          {step === 'sent' && (
            <div className="mt-10 rounded-xl border border-brass/40 bg-brass/10 p-8 text-center">
              <p className="text-3xl">📬</p>
              <p className="mt-3 font-serif text-2xl text-paper">Confirme seu e-mail</p>
              <p className="mt-2 text-sm text-mist">
                Enviamos um link de confirmação para <strong className="text-paper">{draft.email}</strong>.
                Depois de confirmar, é só entrar na área do cliente.
              </p>
              <Link to="/cliente/login" className="mt-6 inline-block text-sm text-brass-soft hover:underline">
                Ir para o login →
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
