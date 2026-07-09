import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminNavItems } from '@projeto-sete/shared'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const icons: Record<string, JSX.Element> = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" />
    </svg>
  ),
  blog: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  portfolio: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  cases: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  testimonials: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  ),
  comments: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  ),
  contact: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
    </svg>
  ),
}

export function AdminLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-cream">
      {/* Overlay mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-mist/30 bg-paper transition-transform duration-300 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between px-6 py-6">
          <p className="font-serif text-xl">
            Projeto <span className="text-brass">Sete</span>
            <span className="ml-2 text-xs font-sans uppercase tracking-eyebrow text-smoke">
              Admin
            </span>
          </p>
          <button
            onClick={() => setMobileOpen(false)}
            className="text-smoke hover:text-ink md:hidden"
            aria-label="Fechar menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/admin/dashboard'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  isActive
                    ? 'bg-brass/12 text-ink font-medium'
                    : 'text-smoke hover:bg-white/50 hover:text-ink',
                )
              }
            >
              <span className="shrink-0 opacity-60">{icons[item.icon]}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User / Sign out */}
        <div className="border-t border-mist/30 px-6 py-4">
          {user?.email && (
            <p className="mb-2 truncate text-xs text-smoke">{user.email}</p>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await signOut()
              navigate('/admin/login', { replace: true })
            }}
          >
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="md:pl-64">
        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-mist/30 bg-white/50 px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-smoke hover:text-ink"
            aria-label="Abrir menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <p className="font-serif text-base">
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
