import { Link } from 'react-router-dom'
import { brand, footerLegal } from '@projeto-sete/shared'
import { Container } from '@/components/ui/Container'

const footerLinks = {
  Navegação: [
    { label: 'Início', href: '/' },
    { label: 'Portfólio', href: '/portfolio' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contato', href: '/contato' },
  ],
  Serviços: [
    { label: 'Residencial', href: '/portfolio?projectType=residencial' },
    { label: 'Comercial', href: '/portfolio?projectType=comercial' },
    { label: 'Corporativo', href: '/portfolio?projectType=corporativo' },
    { label: 'Especial', href: '/portfolio?projectType=especial' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-ink border-t border-white/[0.06]">
      <Container className="py-20">
        <div className="grid gap-12 md:grid-cols-5">
          {/* Marca */}
          <div className="md:col-span-2">
            <p className="font-editorial text-2xl text-paper">
              Projeto <span className="text-brass">Sete</span>
            </p>
            <p className="mt-2 text-[9px] uppercase tracking-[0.2em] text-mist/50">
              Marcenaria de Alto Padrão
            </p>
            <p className="mt-6 text-sm text-mist/70 leading-relaxed max-w-sm">
              Especialistas em móveis sob medida de alto padrão em Fortaleza e região desde 2009.
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a
                href={brand.social.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-mist/50 hover:text-brass transition-colors duration-300"
                aria-label="Instagram"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a
                href={`mailto:${brand.contact.email}`}
                className="text-mist/50 hover:text-brass transition-colors duration-300"
                aria-label="Email"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <nav key={title} className="md:col-span-1" aria-label={title}>
              <p className="text-xs uppercase tracking-wider text-mist/50 mb-5">{title}</p>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-mist/70 hover:text-brass transition-colors duration-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          {/* Contato */}
          <div className="md:col-span-1">
            <p className="text-xs uppercase tracking-wider text-mist/50 mb-5">Contato</p>
            <ul className="space-y-4 text-sm text-mist/70">
              <li className="leading-relaxed">{brand.address.fullAddress}</li>
              <li>
                <a href={`tel:${brand.contact.phoneRaw}`} className="hover:text-brass transition-colors duration-300">
                  {brand.contact.phone}
                </a>
              </li>
              <li>
                <a href={`mailto:${brand.contact.email}`} className="hover:text-brass transition-colors duration-300">
                  {brand.contact.email}
                </a>
              </li>
              <li className="text-xs text-mist/50">Seg–Sex, 08h–17h</li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.06]">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-mist/40 md:flex-row">
          <p>{footerLegal}</p>
          <p>Desde {brand.foundedYear} · {brand.yearsExperience}+ anos de marcenaria de alto padrão</p>
        </Container>
      </div>
    </footer>
  )
}
