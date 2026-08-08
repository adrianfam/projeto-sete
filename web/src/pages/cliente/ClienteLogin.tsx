import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { useAuthStore } from '@/store/authStore'

export function ClienteLogin() {
  const navigate = useNavigate()
  const { signIn } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const ok = await signIn(email.trim(), password)
    setLoading(false)
    if (ok) {
      navigate('/cliente', { replace: true })
    } else {
      setError('Não foi possível entrar. Verifique e-mail e senha.')
    }
  }

  return (
    <>
      <Seo title="Área do Cliente — Projeto Sete" noindex path="/cliente/login" />
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-charcoal to-ink px-6">
        <div className="w-full max-w-sm text-center">
          <p className="font-serif text-3xl text-paper">
            Projeto <span className="text-brass">Sete</span>
          </p>
          <p className="mt-2 text-mist">Acesse seu espaço para acompanhar seu projeto.</p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5 text-left">
            <div>
              <label className="block text-xs uppercase tracking-eyebrow text-mist" htmlFor="cliente-email">
                E-mail
              </label>
              <input
                id="cliente-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-lg border border-graphite-light bg-graphite px-4 py-3 text-paper outline-none transition-colors focus:border-brass"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-eyebrow text-mist" htmlFor="cliente-password">
                Senha
              </label>
              <input
                id="cliente-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-lg border border-graphite-light bg-graphite px-4 py-3 text-paper outline-none transition-colors focus:border-brass"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-error" role="alert">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brass px-6 py-3.5 font-semibold text-ink transition-all hover:bg-brass-soft active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="mt-8 text-sm text-mist">
            Ainda não tem conta?{' '}
            <Link to="/cliente/cadastro" className="text-brass-soft hover:underline">
              Cadastre-se sem compromisso
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
