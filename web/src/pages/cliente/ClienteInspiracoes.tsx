import { useMemo, useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { LoadingState } from '@/components/ui/LoadingState'
import { useClienteApi, clienteRequest } from '@/lib/clienteClient'
import { useApi } from '@/hooks/useApi'
import { brand } from '@projeto-sete/shared'
import { cn } from '@/lib/utils'
import { PORTFOLIO_CARD_IMAGES } from '@/lib/images'

type Tab = 'todos' | 'portfolio' | 'instagram' | 'favoritos'

interface PortfolioItem {
  id: string
  title: string
  slug: string
  cover_image_url: string | null
  project_type: string | null
  location: string | null
}

interface InstagramPost {
  id: string
  caption: string | null
  image_url: string
  post_url: string | null
  aspect_ratio: 'square' | 'portrait' | 'landscape'
}

interface Favorite {
  id: string
  source_type: 'portfolio' | 'instagram'
  source_id: string
  note: string | null
  content: (PortfolioItem & InstagramPost) | null
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'todos', label: 'Tudo' },
  { key: 'portfolio', label: 'Portfólio' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'favoritos', label: '♥ Meus favoritos' },
]

export function ClienteInspiracoes() {
  const [tab, setTab] = useState<Tab>('todos')
  const portfolio = useApi<{ items: PortfolioItem[] }>('/portfolio?limit=100')
  const instagram = useApi<{ items: InstagramPost[] }>('/instagram')
  const favs = useClienteApi<{ items: Favorite[] }>('/cliente/inspirations')

  const portfolioItems = portfolio.data?.items ?? []
  const instagramItems = instagram.data?.items ?? []
  // Ignora favoritos órfãos (fonte removida/despublicada) na contagem e no mapa
  const favorites = useMemo(
    () => (favs.data?.items ?? []).filter((f) => f.content !== null),
    [favs.data],
  )

  // Mapa de favoritos por (source_type:source_id) para alternância otimista
  const favByKey = useMemo(() => {
    const map = new Map<string, Favorite>()
    favorites.forEach((f) => map.set(`${f.source_type}:${f.source_id}`, f))
    return map
  }, [favorites])

  const [busy, setBusy] = useState<Set<string>>(new Set())
  const [actionError, setActionError] = useState<string | null>(null)
  const toggle = async (sourceType: 'portfolio' | 'instagram', sourceId: string) => {
    const key = `${sourceType}:${sourceId}`
    const existing = favByKey.get(key)
    setBusy((s) => new Set(s).add(key))
    setActionError(null)
    try {
      if (existing) {
        await clienteRequest(`/cliente/inspirations/${existing.id}`, { method: 'DELETE' })
      } else {
        await clienteRequest('/cliente/inspirations', {
          method: 'POST',
          body: { sourceType, sourceId },
        })
      }
      favs.refetch()
    } catch {
      setActionError('Não foi possível salvar agora. Tente novamente em instantes.')
    } finally {
      setBusy((s) => {
        const next = new Set(s)
        next.delete(key)
        return next
      })
    }
  }

  // Monta a lista combinada de cards
  const cards = useMemo(() => {
    const list: {
      key: string
      sourceType: 'portfolio' | 'instagram'
      sourceId: string
      image: string
      title: string
      href: string
      meta?: string
    }[] = [
      ...portfolioItems.map((p) => ({
        key: `portfolio:${p.id}`,
        sourceType: 'portfolio' as const,
        sourceId: p.id,
        image: p.cover_image_url ?? PORTFOLIO_CARD_IMAGES[portfolioItems.indexOf(p) % PORTFOLIO_CARD_IMAGES.length],
        title: p.title,
        href: `/portfolio/${p.slug}`,
        meta: [p.project_type, p.location].filter(Boolean).join(' · '),
      })),
      ...instagramItems.map((p) => ({
        key: `instagram:${p.id}`,
        sourceType: 'instagram' as const,
        sourceId: p.id,
        image: p.image_url,
        title: p.caption ?? brand.social.instagram.handle,
        href: p.post_url ?? brand.social.instagram.url,
        meta: brand.social.instagram.handle,
      })),
    ]
    return list
  }, [portfolioItems, instagramItems])

  const visible = useMemo(() => {
    if (tab === 'portfolio') return cards.filter((c) => c.sourceType === 'portfolio')
    if (tab === 'instagram') return cards.filter((c) => c.sourceType === 'instagram')
    if (tab === 'favoritos') return cards.filter((c) => favByKey.has(`${c.sourceType}:${c.sourceId}`))
    return cards
  }, [cards, tab, favByKey])

  const loading = portfolio.status === 'loading' || instagram.status === 'loading' || favs.status === 'loading'

  return (
    <>
      <Seo title="Inspirações — Projeto Sete" noindex path="/cliente/inspiracoes" />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-eyebrow text-brass-soft">Pasta de inspirações</p>
            <h1 className="mt-1 font-serif text-3xl text-paper">Ideias para o seu espaço</h1>
            <p className="mt-2 max-w-xl text-sm text-mist">
              Navegue pelos nossos projetos e posts e salve seus favoritos — assim a gente
              entende melhor o estilo que você sonha. 💡
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                'rounded-full border px-4 py-2 text-sm transition-colors',
                tab === t.key
                  ? 'border-brass bg-brass/15 text-brass-soft font-medium'
                  : 'border-graphite-light text-mist hover:border-smoke hover:text-paper',
              )}
            >
              {t.label}
              {t.key === 'favoritos' && favorites.length > 0 && (
                <span className="ml-1.5 rounded-full bg-brass/20 px-1.5 py-0.5 text-[10px] text-brass-soft">
                  {favorites.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {actionError && (
          <div className="mt-6 rounded-lg border border-red-800/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
            {actionError}
          </div>
        )}

        {loading ? (
          <LoadingState className="py-16" />
        ) : visible.length === 0 ? (
          <div className="mt-12 rounded-xl border border-dashed border-graphite-light p-10 text-center">
            <p className="text-3xl">🖼️</p>
            <p className="mt-3 text-sm text-mist">
              {tab === 'favoritos'
                ? 'Você ainda não salvou nenhuma inspiração. Toque no ♥ de uma imagem para começar.'
                : 'Nenhum item disponível ainda — em breve aqui!'}
            </p>
          </div>
        ) : (
          <div className="mt-8 columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
            {visible.map((c) => {
              const favKey = `${c.sourceType}:${c.sourceId}`
              const isFav = favByKey.has(favKey)
              const isBusy = busy.has(favKey)
              return (
                <article key={c.key} className="group relative break-inside-avoid overflow-hidden rounded-xl glass-card">
                  <a href={c.href} target={c.sourceType === 'instagram' ? '_blank' : undefined} rel="noopener noreferrer" className="block">
                    <img
                      src={c.image}
                      alt={c.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full object-cover transition-all duration-700 ease-refined group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                      <p className="line-clamp-2 text-xs font-medium text-paper">{c.title}</p>
                      {c.meta && <p className="mt-0.5 text-[10px] uppercase tracking-wider text-mist/80">{c.meta}</p>}
                    </div>
                  </a>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toggle(c.sourceType, c.sourceId)
                    }}
                    disabled={isBusy}
                    aria-pressed={isFav}
                    aria-label={isFav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                    className={cn(
                      'absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-all active:scale-90 disabled:opacity-50',
                      isFav ? 'bg-brass text-ink' : 'bg-ink/50 text-paper hover:bg-ink/70',
                    )}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill={isFav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </button>
                </article>
              )
            })}
          </div>
        )}

        {favorites.length > 0 && (
          <div className="mt-6 text-center text-xs text-mist/60">
            Suas inspirações ficam salvas aqui e ajudam nossa equipe a entender o que você procura.
          </div>
        )}
      </div>
    </>
  )
}
