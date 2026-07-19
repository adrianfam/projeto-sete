import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Seo } from '@/components/seo/Seo'
import { request, ApiError } from '@/lib/apiClient'

interface LoginResponse {
  employee: { id: string; fullName: string; matricula: number }
}

export function PontoLogin() {
  const navigate = useNavigate()
  const [matricula, setMatricula] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const matNum = Number(matricula)
    if (!matricula || isNaN(matNum)) {
      setError('Digite o número da sua matrícula.')
      return
    }
    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError('Digite o PIN de 4 dígitos.')
      return
    }

    setLoading(true)
    try {
      const res = await request<LoginResponse>('/ponto/login', {
        method: 'POST',
        body: { matricula: matNum, pin },
      })
      // Salva dados do colaborador no sessionStorage
      sessionStorage.setItem('ponto_employee', JSON.stringify(res.employee))
      sessionStorage.setItem('ponto_employee_id', res.employee.id)
      navigate('/colaborador/ponto', { replace: true })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Erro ao entrar. Tente novamente.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Seo title="Ponto Eletrônico — Projeto Sete" noindex path="/ponto/login" />
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-green-50 to-white px-6">
        <div className="w-full max-w-sm text-center">
          {/* Logo / Identidade */}
          <h1 className="font-serif text-3xl text-ink">
            Projeto <span className="text-brass">Sete</span>
          </h1>
          <p className="mt-2 text-lg text-smoke">Ponto Eletrônico</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="block text-left text-sm font-medium text-ink">Matrícula</label>
              <input
                type="text"
                inputMode="numeric"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value.replace(/\D/g, ''))}
                placeholder="Sua matrícula"
                className="mt-1 block w-full rounded-xl border-2 border-mist/60 bg-white px-5 py-4 text-center text-xl outline-none transition-colors focus:border-brass"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-left text-sm font-medium text-ink">PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="• • • •"
                className="mt-1 block w-full rounded-xl border-2 border-mist/60 bg-white px-5 py-4 text-center text-2xl tracking-[0.5em] outline-none transition-colors focus:border-brass"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-base text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-600 px-6 py-4 text-lg font-bold text-white shadow-lg transition-all hover:bg-green-700 active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? 'Entrando…' : 'Entrar'}
            </button>
          </form>

          <p className="mt-8 text-sm text-smoke">
            Área restrita para colaboradores
          </p>
        </div>
      </div>
    </>
  )
}
