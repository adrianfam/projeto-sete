import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { navItems } from '@projeto-sete/shared'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Logo } from './Logo'
import { cn } from '@/lib/utils'
import { brand } from '@projeto-sete/shared'

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const isLanding = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setOpen(false), [location.pathname])

  const solid = scrolled || !isLanding

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-refined',
        solid ? 'bg-paper/95 shadow-card backdrop-blur' : 'bg-transparent',
      )}
    >
      <Container className="flex h-20 items-center justify-between">
        <Logo variant={solid ? 'solid' : 'light'} />

        {/* Desktop */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navegação principal">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                cn(
                  'link-underline text-sm font-medium',
                  solid ? 'text-ink' : 'text-paper',
                  isActive && 'text-brass',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href={brand.contact.whatsappLink} target="_blank" rel="noopener" variant="primary" size="sm">
            Solicitar projeto
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className={cn('lg:hidden', solid ? 'text-ink' : 'text-paper')}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <>
                <path d="M3 7h18" strokeLinecap="round" />
                <path d="M3 12h18" strokeLinecap="round" />
                <path d="M3 17h18" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
      </Container>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden bg-paper border-t border-mist/40">
          <Container className="flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="py-3 text-ink border-b border-mist/20 last:border-0"
              >
                {item.label}
              </Link>
            ))}
            <Button href={brand.contact.whatsappLink} target="_blank" rel="noopener" variant="whatsapp" className="mt-4">
              WhatsApp
            </Button>
          </Container>
        </div>
      )}
    </header>
  )
}
