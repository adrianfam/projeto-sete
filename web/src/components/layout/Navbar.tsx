import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { navItems, brand } from '@projeto-sete/shared'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Logo } from './Logo'
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
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-all duration-700 ease-refined',
          scrolled
            ? 'bg-ink/80 backdrop-blur-xl border-b border-white/[0.06] shadow-glass'
            : 'bg-transparent',
        )}
      >
        {/* Progress bar de scroll */}
        <div className="absolute inset-x-0 bottom-0 h-[1px] bg-white/[0.06]">
          <div
            className="h-full bg-brass transition-all duration-150 ease-out"
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
                    'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300',
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
            <div className="ml-4 pl-4 border-l border-white/10">
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

          {/* Mobile toggle */}
          <button
            className={cn(
              'lg:hidden relative z-50 h-10 w-10 flex items-center justify-center rounded-lg',
              scrolled || !isLanding ? 'text-paper' : 'text-paper',
            )}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <div className="relative w-6 h-5">
              <span
                className={cn(
                  'absolute left-0 top-0 h-[2px] w-full bg-current transition-all duration-300',
                  open && 'top-1/2 -translate-y-1/2 rotate-45',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 top-1/2 -translate-y-1/2 h-[2px] bg-current transition-all duration-300',
                  open ? 'w-0' : 'w-full',
                )}
              />
              <span
                className={cn(
                  'absolute left-0 bottom-0 h-[2px] w-full bg-current transition-all duration-300',
                  open && 'bottom-1/2 translate-y-1/2 -rotate-45',
                )}
              />
            </div>
          </button>
        </Container>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink/95 backdrop-blur-2xl" onClick={() => setOpen(false)} />
          <nav className="relative z-10 flex flex-col items-center justify-center h-full gap-6 px-6" aria-label="Navegação mobile">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="text-3xl font-editorial text-paper hover:text-brass transition-colors duration-300"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-8 pt-8 border-t border-white/10 w-full max-w-xs text-center">
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
