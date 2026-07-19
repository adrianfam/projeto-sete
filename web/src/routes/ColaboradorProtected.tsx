import { Navigate } from 'react-router-dom'

/** Guarda rotas do colaborador — redireciona para login se não autenticado. */
export function ColaboradorProtected({ children }: { children: React.ReactNode }) {
  const empId = sessionStorage.getItem('ponto_employee_id')
  if (!empId) return <Navigate to="/colaborador/login" replace />
  return <>{children}</>
}
