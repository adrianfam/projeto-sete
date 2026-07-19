import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { colaboradorNavItems } from '@projeto-sete/shared'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'

const icons: Record<string, JSX.Element> = {
  clock: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  file: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
}

interface Employee {
  id: string
  fullName: string
  matricula: number
}

export function ColaboradorLayout() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [employee, setEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('ponto_employee')
    if (stored) setEmployee(JSON.parse(stored))
  }, [])

  const logout = () => {
    sessionStorage.removeItem('ponto_employee')
    sessionStorage.removeItem('ponto_employee_id')
    navigate('/colaborador/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-charcoal">
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-graphite-light bg-ink transition-transform duration-300 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-6 py-6">
          <div>
            <p className="font-serif text-xl text-paper">
              Projeto <span className="text-brass">Sete</span>
            </p>
            <p className="text-xs uppercase tracking-eyebrow text-green-400 font-medium">
              Colaborador
            </p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-smoke hover:text-paper md:hidden"
            aria-label="Fechar menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Employee info */}
        {employee && (
          <div className="px-6 pb-4 border-b border-graphite-light mb-2">
            <p className="text-sm font-medium text-paper truncate">{employee.fullName}</p>
            <p className="text-xs text-mist">Matrícula {employee.matricula}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3">
          {colaboradorNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/colaborador/ponto'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-green-900/40 text-green-400 font-medium'
                    : 'text-mist hover:bg-graphite hover:text-paper',
                )
              }
            >
              <span className="shrink-0 opacity-60">{icons[item.icon]}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="border-t border-graphite-light px-6 py-4">
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-mist hover:text-red-400 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:pl-64">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-graphite-light bg-ink/80 backdrop-blur-sm px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-mist hover:text-paper"
            aria-label="Abrir menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <p className="font-serif text-base text-paper">
            Projeto <span className="text-brass">Sete</span>
          </p>
          {employee && (
            <span className="ml-auto text-xs text-mist truncate">{employee.fullName}</span>
          )}
        </div>

        <div className="px-5 py-8 md:px-10 md:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
