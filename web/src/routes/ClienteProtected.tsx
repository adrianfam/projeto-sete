import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoadingState } from '@/components/ui/LoadingState'

/** Guarda rotas do portal do cliente — redireciona para login se não autenticado. */
export function ClienteProtected({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore()

  if (loading) return <LoadingState />
  if (!session) return <Navigate to="/cliente/login" replace />
  return <>{children}</>
}
