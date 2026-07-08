import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { adminNavItems } from '@projeto-sete/shared'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export function AdminLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-mist/40 bg-paper md:flex">
        <p className="px-6 py-6 font-serif text-xl">
          Projeto <span className="text-brass">Sete</span>
          <span className="ml-2 text-xs font-sans uppercase tracking-eyebrow text-smoke">Admin</span>
        </p>
        <nav className="flex-1 space-y-1 px-3">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'block rounded px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-brass/15 text-ink font-medium' : 'text-smoke hover:text-ink',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-mist/40 px-6 py-4">
          {user?.email && <p className="mb-2 truncate text-xs text-smoke">{user.email}</p>}
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

      <main className="md:pl-64">
        <div className="px-6 py-10 md:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
