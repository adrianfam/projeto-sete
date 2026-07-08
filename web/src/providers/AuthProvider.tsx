import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

/** Inicializa a sessão Supabase na montagem do app. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  return <>{children}</>
}
