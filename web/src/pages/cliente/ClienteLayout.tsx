import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'

const navItems = [{ label: 'Início', href: '/cliente' }] as const

export function ClienteLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-charcoal">
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-ink/60 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-graphite-light bg-ink transition-transform duration-300 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <div>
            <p className="font-serif text-xl text-paper">
              Projeto <span className="text-brass">Sete</span>
            </p>
            <p className="text-xs uppercase tracking-eyebrow text-brass-soft font-medium">Meu espaço</p>
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

        <nav className="flex-1 space-y-0.5 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-brass/15 text-brass-soft font-medium'
                    : 'text-mist hover:bg-graphite hover:text-paper',
                )
              }
            >
              <span className="shrink-0 opacity-60">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-graphite-light px-6 py-4 space-y-3">
          {user?.email && <p className="truncate text-xs text-smoke">{user.email}</p>}
          <button
            onClick={async () => {
              await signOut()
              navigate('/cliente/login', { replace: true })
            }}
            className="flex items-center gap-2 text-sm text-mist hover:text-red-400 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sair
          </button>
        </div>
      </aside>

      <main className="md:pl-64">
        <div className="flex items-center gap-3 border-b border-graphite-light bg-ink/80 backdrop-blur-sm px-4 pt-[env(safe-area-inset-top)] pb-3 md:hidden">
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
        </div>

        <div className="px-5 py-8 md:px-10 md:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
