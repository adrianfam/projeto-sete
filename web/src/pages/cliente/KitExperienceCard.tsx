import { brand } from '@projeto-sete/shared'

/**
 * Banner Kit Experience — amostras físicas de acabamentos via WhatsApp.
 * Reutilizado nos estágios lead e cliente ativo do hub.
 */
export function KitExperienceCard({ compact = false }: { compact?: boolean }) {
  const message = encodeURIComponent(
    'Olá! Gostaria de solicitar o Kit Experience do Projeto Sete (amostras físicas de acabamentos).',
  )

  return (
    <div className="card-line border-brass/30 bg-gradient-to-br from-graphite to-ink p-6">
      <p className="text-2xl">🎁</p>
      <h2 className="mt-3 font-serif text-xl text-paper">Kit Experience</h2>
      <p className="mt-2 text-sm text-mist">
        {compact
          ? 'Quer ver nossos acabamentos de perto? Peça as amostras físicas.'
          : 'Gostaria de testar nossos acabamentos sob a luz da sua casa? Solicite pelo WhatsApp nosso kit com amostras físicas.'}
      </p>
      <a
        href={`${brand.contact.whatsappLink}?text=${message}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-lg border border-brass/50 px-4 py-2.5 text-sm font-semibold text-brass-soft transition-colors hover:bg-brass/15"
      >
        Pedir pelo WhatsApp
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <polyline points="15 3 21 3 21 9" />
          <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
      </a>
    </div>
  )
}
