import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Seo } from '@/components/seo/Seo'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
type FormData = z.infer<typeof schema>

export function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, error, loading } = useAuthStore()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    const ok = await signIn(data.email, data.password)
    if (ok) {
      const dest = (location.state as { from?: string } | null)?.from ?? '/admin/dashboard'
      navigate(dest, { replace: true })
    } else {
      setSubmitError('Não foi possível entrar. Verifique suas credenciais.')
    }
  }

  return (
    <>
      <Seo title="Painel administrativo — Projeto Sete" noindex path="/admin/login" />
      <div className="flex min-h-screen items-center justify-center bg-charcoal px-6">
        <div className="w-full max-w-sm">
          <p className="font-serif text-2xl text-paper">
            Projeto <span className="text-brass">Sete</span>
          </p>
          <p className="mt-2 text-sm text-smoke">Acesso ao painel administrativo</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
            <div>
              <label className="block text-xs uppercase tracking-eyebrow text-mist" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                className="mt-2 w-full border border-graphite bg-graphite/40 px-4 py-3 text-paper outline-none focus:border-brass"
              />
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs uppercase tracking-eyebrow text-mist" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="mt-2 w-full border border-graphite bg-graphite/40 px-4 py-3 text-paper outline-none focus:border-brass"
              />
              {errors.password && <p className="mt-1 text-xs text-error">{errors.password.message}</p>}
            </div>

            {(error || submitError) && (
              <p className="text-sm text-error" role="alert">
                {error || submitError}
              </p>
            )}

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
