import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { LoadingState } from '@/components/ui/LoadingState'

/** Guarda rotas admin — redireciona para login se não autenticado. */
export function Protected({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthStore()

  if (loading) return <LoadingState />
  if (!session) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}
