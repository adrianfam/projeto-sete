import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { navItems, accessLinks, brand } from '@projeto-sete/shared'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Logo } from './Logo'
import { ProfileMenu, accessIcons } from './ProfileMenu'
import { cn } from '@/lib/utils'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const location = useLocation()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 48)
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setScrollProgress(docHeight > 0 ? Math.min(window.scrollY / docHeight, 1) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Fecha menu ao navegar
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Trava/libera scroll conforme estado do menu mobile
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header
        className={cn(
          'ease-refined fixed inset-x-0 top-0 z-50 transition-all duration-700',
          scrolled
            ? 'bg-ink/80 shadow-glass border-b border-white/[0.06] backdrop-blur-xl'
            : 'bg-transparent',
        )}
      >
        {/* Progress bar de scroll */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/[0.06]">
          <div
            className="bg-brass h-full transition-all duration-150 ease-out"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>

        <Container className="flex h-20 items-center justify-between">
          <Logo variant={scrolled || !isLanding ? 'solid' : 'light'} />

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.href === '/'}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300',
                    !scrolled && isLanding
                      ? 'text-paper/80 hover:text-paper hover:bg-white/5'
                      : 'text-mist hover:text-paper hover:bg-white/[0.04]',
                    isActive && 'text-brass',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="ml-4 flex items-center gap-3 border-l border-white/10 pl-4">
              <ProfileMenu />
              <Button
                href={brand.contact.whatsappLink}
                target="_blank"
                rel="noopener"
                variant="primary"
                size="sm"
              >
                Solicitar orçamento
              </Button>
            </div>
          </nav>

          {/* Mobile: acesso + toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <ProfileMenu compact />
            <button
              className="text-paper relative z-50 flex h-10 w-10 items-center justify-center rounded-lg"
              aria-label={open ? 'Fechar menu' : 'Abrir menu'}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              <div className="relative h-5 w-6">
                <span
                  className={cn(
                    'absolute left-0 top-0 h-[2px] w-full bg-current transition-all duration-300',
                    open && 'top-1/2 -translate-y-1/2 rotate-45',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-[2px] -translate-y-1/2 bg-current transition-all duration-300',
                    open ? 'w-0' : 'w-full',
                  )}
                />
                <span
                  className={cn(
                    'absolute bottom-0 left-0 h-[2px] w-full bg-current transition-all duration-300',
                    open && 'bottom-1/2 translate-y-1/2 -rotate-45',
                  )}
                />
              </div>
            </button>
          </div>
        </Container>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="bg-ink/95 absolute inset-0 backdrop-blur-2xl"
            onClick={() => setOpen(false)}
          />
          <nav
            className="relative z-10 flex h-full flex-col items-center justify-center gap-6 px-6"
            aria-label="Navegação mobile"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="font-editorial text-paper hover:text-brass text-3xl transition-colors duration-300"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-8 w-full max-w-xs">
              <p className="text-eyebrow tracking-eyebrow text-smoke mb-3 text-center uppercase">
                Áreas de acesso
              </p>
              <div className="grid grid-cols-3 gap-2">
                {accessLinks.map((link) => (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="text-paper/90 hover:border-brass/50 hover:text-brass-soft flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-2 py-3 text-xs font-medium transition-all duration-300 hover:-translate-y-0.5"
                  >
                    {accessIcons[link.icon]}
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-6 w-full max-w-xs border-t border-white/10 pt-8 text-center">
              <Button
                href={brand.contact.whatsappLink}
                target="_blank"
                rel="noopener"
                variant="primary"
                size="lg"
                className="w-full"
              >
                Solicitar orçamento
              </Button>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
