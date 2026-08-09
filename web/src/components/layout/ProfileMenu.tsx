import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { accessLinks } from '@projeto-sete/shared'
import { useAuthStore } from '@/store/authStore'
import { getCurrentProfile, type ActiveProfile } from '@/lib/activeProfile'
import { cn } from '@/lib/utils'

type AccessIcon = (typeof accessLinks)[number]['icon']

/** Ícones dos perfis de acesso (reutilizados no menu mobile). */
export const accessIcons: Record<AccessIcon, JSX.Element> = {
  cliente: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  admin: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  ),
  colaborador: (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
}

const ACCENTS: Record<
  AccessIcon,
  { tile: string; bar: string; hoverText: string; activeText: string; ring: string; dot: string }
> = {
  cliente: {
    tile: 'bg-brass/15 text-brass-soft',
    bar: 'bg-brass',
    hoverText: 'group-hover:text-brass-soft',
    activeText: 'text-brass-soft',
    ring: 'ring-1 ring-brass/40',
    dot: 'bg-brass',
  },
  admin: {
    tile: 'bg-teal/40 text-paper',
    bar: 'bg-teal-light',
    hoverText: 'group-hover:text-teal-light',
    activeText: 'text-teal-light',
    ring: 'ring-1 ring-teal-light/60',
    dot: 'bg-teal-light',
  },
  colaborador: {
    tile: 'bg-sage/30 text-paper',
    bar: 'bg-sage',
    hoverText: 'group-hover:text-paper',
    activeText: 'text-paper',
    ring: 'ring-1 ring-sage/70',
    dot: 'bg-sage',
  },
}

export function ProfileMenu({ compact = false }: { compact?: boolean }) {
  const { user, signOut } = useAuthStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const location = useLocation()

  // Sem useMemo: a leitura é síncrona e barata, e precisa refletir mudanças no
  // sessionStorage (ex.: logout do colaborador não altera o user do Supabase).
  const activeProfile: ActiveProfile = getCurrentProfile(user)
  const activeAccent = activeProfile ? ACCENTS[activeProfile] : null
  const activeLabel = activeProfile
    ? (accessLinks.find((l) => l.icon === activeProfile)?.label ?? null)
    : null

  // Nome do colaborador (sessão própria do ponto eletrônico)
  const employeeName = useMemo(() => {
    if (activeProfile !== 'colaborador') return null
    const raw = sessionStorage.getItem('ponto_employee')
    if (!raw) return null
    try {
      const emp = JSON.parse(raw) as { fullName?: string }
      return emp.fullName ?? null
    } catch {
      return null
    }
  }, [activeProfile])

  const identity = activeProfile === 'colaborador' ? employeeName : (user?.email ?? null)

  const handleSignOut = async () => {
    setOpen(false)
    if (activeProfile === 'colaborador') {
      sessionStorage.removeItem('ponto_employee')
      sessionStorage.removeItem('ponto_employee_id')
      return
    }
    await signOut()
  }

  // Fecha ao navegar
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Fecha ao clicar fora ou pressionar Esc
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={compact ? 'Acessar área restrita' : undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'text-paper/90 hover:border-brass/50 hover:text-brass-soft group relative flex h-9 items-center gap-2 rounded-full border border-white/15 transition-all duration-300',
          compact ? 'w-9 justify-center px-0' : 'px-3.5',
          open && 'border-brass/60 text-brass-soft bg-white/[0.04]',
        )}
      >
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        {activeAccent && !compact && (
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                'absolute inline-flex h-full w-full animate-ping rounded-full opacity-60',
                activeAccent.dot,
              )}
            />
            <span className={cn('relative inline-flex h-2 w-2 rounded-full', activeAccent.dot)} />
          </span>
        )}
        {!compact && (
          <span className="hidden text-sm font-medium xl:inline">{activeLabel ?? 'Acessar'}</span>
        )}
        {compact && activeAccent && (
          <span
            className={cn(
              'border-ink absolute right-0.5 top-0.5 h-2 w-2 rounded-full border',
              activeAccent.dot,
            )}
          />
        )}
        <svg
          aria-hidden="true"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('transition-transform duration-300', open && 'rotate-180')}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="animate-scale-in absolute -right-2 top-full mt-3 w-72 max-w-[calc(100vw-1rem)] origin-top-right sm:right-0 sm:w-80">
          {/* Seta do painel */}
          <div className="bg-charcoal absolute -top-1.5 right-5 h-3 w-3 rotate-45 rounded-[2px] border-l border-t border-white/10" />

          <div className="bg-charcoal/95 shadow-modal overflow-hidden rounded-2xl border border-white/10 backdrop-blur-xl">
            {/* Cabeçalho */}
            <div className="border-b border-white/[0.06] px-4 pb-3 pt-4">
              <p className="text-eyebrow tracking-eyebrow text-brass uppercase">
                {activeProfile ? 'Sessão ativa' : 'Áreas de acesso'}
              </p>
              <p className="text-paper mt-1 flex items-center gap-2 font-serif text-lg leading-tight">
                <span
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    activeAccent?.dot ?? 'bg-brass/40',
                  )}
                />
                {activeProfile ? `Você está em ${activeLabel}` : 'Qual perfil você quer acessar?'}
              </p>
              {identity && <p className="text-smoke mt-1.5 truncate text-xs">{identity}</p>}
            </div>

            {/* Perfis */}
            <div className="p-2">
              {accessLinks.map((link, i) => {
                const accent = ACCENTS[link.icon]
                const isActive = activeProfile === link.icon
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'animate-fade-up group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300 hover:bg-white/[0.05]',
                      isActive && 'bg-white/[0.05]',
                      isActive && accent.ring,
                    )}
                    style={{ animationDelay: `${60 + i * 50}ms` }}
                    aria-current={isActive ? 'true' : undefined}
                  >
                    {/* Barra de acento (hover ou perfil ativo) */}
                    <span
                      className={cn(
                        'absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-full transition-transform duration-300',
                        accent.bar,
                        isActive ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-100',
                      )}
                    />
                    <span
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110',
                        accent.tile,
                        isActive && 'scale-110',
                      )}
                    >
                      {accessIcons[link.icon]}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={cn(
                          'text-paper block text-sm font-semibold transition-colors duration-300',
                          accent.hoverText,
                          isActive && accent.activeText,
                        )}
                      >
                        {link.label}
                      </span>
                      <span className="text-smoke mt-0.5 block truncate text-xs leading-snug">
                        {isActive ? 'Você está conectado neste perfil' : link.description}
                      </span>
                    </span>
                    {isActive ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Ativo
                      </span>
                    ) : (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-smoke group-hover:text-brass-soft shrink-0 transition-all duration-300 group-hover:translate-x-0.5"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </Link>
                )
              })}
            </div>

            {/* Rodapé — sair da sessão ou novo cliente */}
            <div className="border-t border-white/[0.06] p-2">
              {activeProfile ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="group flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors duration-300 hover:bg-red-500/10"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-red-400/30 text-red-300/90 transition-colors group-hover:border-red-400/60 group-hover:text-red-300">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span className="text-paper block text-xs font-medium">Sair</span>
                    <span className="text-smoke block text-[11px]">
                      Encerrar sessão de {activeLabel}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-red-300/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Sair →
                  </span>
                </button>
              ) : (
                <Link
                  to="/cliente/cadastro"
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-colors duration-300 hover:bg-white/[0.05]"
                >
                  <span className="border-brass/40 text-brass-soft flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-dashed">
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-paper block text-xs font-medium">Novo cliente?</span>
                    <span className="text-smoke block text-[11px]">
                      Crie sua conta e acesse seu espaço
                    </span>
                  </span>
                  <span className="text-brass-soft shrink-0 text-xs opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Criar →
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
