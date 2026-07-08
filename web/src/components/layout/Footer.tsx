import { Link } from 'react-router-dom'
import { brand, footerLegal } from '@projeto-sete/shared'
import { Container } from '@/components/ui/Container'

export function Footer() {
  return (
    <footer className="bg-charcoal text-paper">
      <Container className="grid gap-12 py-20 md:grid-cols-4">
        {/* Marca */}
        <div className="md:col-span-1">
          <p className="font-serif text-2xl">
            Projeto <span className="text-brass">Sete</span>
          </p>
          <p className="mt-4 text-sm text-mist leading-relaxed">{brand.description}</p>
        </div>

        {/* Navegação */}
        <nav className="md:col-span-1" aria-label="Rodapé">
          <p className="eyebrow">Navegação</p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              { label: 'Sobre', href: '/sobre' },
              { label: 'Portfólio', href: '/portfolio' },
              { label: 'Blog', href: '/blog' },
              { label: 'Contato', href: '/contato' },
            ].map((i) => (
              <li key={i.href}>
                <Link to={i.href} className="link-underline text-paper hover:text-brass-soft">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contato */}
        <div className="md:col-span-1">
          <p className="eyebrow">Contato</p>
          <ul className="mt-6 space-y-3 text-sm text-mist">
            <li>{brand.address.fullAddress}</li>
            <li>
              <a href={`tel:${brand.contact.phoneRaw}`} className="link-underline hover:text-brass-soft">
                {brand.contact.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${brand.contact.email}`} className="link-underline hover:text-brass-soft">
                {brand.contact.email}
              </a>
            </li>
            <li>Seg–Sex, 08h–17h</li>
          </ul>
        </div>

        {/* Social */}
        <div className="md:col-span-1">
          <p className="eyebrow">Siga-nos</p>
          <a
            href={brand.social.instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex link-underline text-paper hover:text-brass-soft"
          >
            {brand.social.instagram.handle}
          </a>
        </div>
      </Container>

      <div className="border-t border-graphite">
        <Container className="flex flex-col items-center justify-between gap-2 py-6 text-xs text-smoke md:flex-row">
          <p>{footerLegal}</p>
          <p>
            Desde {brand.foundedYear} · {brand.yearsExperience}+ anos de marcenaria
          </p>
        </Container>
      </div>
    </footer>
  )
}
