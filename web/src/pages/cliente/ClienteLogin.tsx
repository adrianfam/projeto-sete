import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { useAuthStore } from '@/store/authStore'
import { setActiveProfile } from '@/lib/activeProfile'

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
      setActiveProfile('cliente')
      navigate('/cliente', { replace: true })
    } else {
      setError('Não foi possível entrar. Verifique e-mail e senha.')
    }
  }

  return (
    <>
      <Seo title="Área do Cliente — Projeto Sete" noindex path="/cliente/login" />
      <div className="from-charcoal to-ink flex min-h-screen flex-col items-center justify-center bg-gradient-to-b px-6">
        <div className="w-full max-w-sm text-center">
          <p className="text-paper font-serif text-3xl">
            Projeto <span className="text-brass">Sete</span>
          </p>
          <p className="text-mist mt-2">Acesse seu espaço para acompanhar seu projeto.</p>

          <form onSubmit={onSubmit} className="mt-10 space-y-5 text-left">
            <div>
              <label
                className="tracking-eyebrow text-mist block text-xs uppercase"
                htmlFor="cliente-email"
              >
                E-mail
              </label>
              <input
                id="cliente-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-graphite-light bg-graphite text-paper focus:border-brass mt-2 w-full rounded-lg border px-4 py-3 outline-none transition-colors"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label
                className="tracking-eyebrow text-mist block text-xs uppercase"
                htmlFor="cliente-password"
              >
                Senha
              </label>
              <input
                id="cliente-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-graphite-light bg-graphite text-paper focus:border-brass mt-2 w-full rounded-lg border px-4 py-3 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-error text-sm" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-brass text-ink hover:bg-brass-soft w-full rounded-lg px-6 py-3.5 font-semibold transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="text-mist mt-8 text-sm">
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
