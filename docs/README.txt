================================================================================
  PROJETO SETE — MÓVEIS PLANEJADOS E MARCENARIA DE ALTO PADRÃO
  Documentação Técnica Completa
================================================================================

  Site:     https://projeto-sete.vercel.app
  Repo:     https://github.com/adrianfam/projeto-sete
  Stack:    Vite + React 18 + TypeScript | Fastify + Node | Supabase | Vercel
  Database: Supabase PostgreSQL (projeto: twrohdescsfvgrghukkb)

  CONTEXTO:
  Site institucional premium + CMS administrativo para a Projeto Sete,
  marcenaria de alto padrão em Fortaleza/CE (desde 2009), atendendo classes
  A e B com referências em CASACOR e ForMóbile.

  O projeto entrega landing page cinematográfica + CMS interno para gerenciar
  portfólio, estudos de caso, depoimentos, blog, Instagram e comentários.

  Última atualização: Julho/2026 (v3 — admin visual overhaul + documentação)


================================================================================
  1. ARQUITETURA
================================================================================

  ┌────────────────────────────────────────────────────────────────────────┐
  │                           VERECL                                       │
  │  ┌──────────────────────────────────────────────────────────────────┐  │
  │  │  /api/*  →  Serverless Function (Fastify)                       │  │
  │  │  /*       →  Static SPA (Vite build) + rewrites                 │  │
  │  └──────────────────────────────────────────────────────────────────┘  │
  │           │                                                │           │
  │           ▼                                                ▼           │
  │  ┌─────────────────┐                          ┌─────────────────┐     │
  │  │   Supabase DB    │                          │   Supabase Auth  │     │
  │  │   + Storage      │                          │   (JWT tokens)   │     │
  │  └─────────────────┘                          └─────────────────┘     │
  └────────────────────────────────────────────────────────────────────────┘

  MONOREPO (npm workspaces):
    /web      → Frontend (Vite + React 18 + TailwindCSS)
    /api      → Backend (Fastify + esbuild bundle)
    /shared   → Pacote compartilhado (schemas Zod, constantes, tipos, utils)

  FLUXO DE DADOS:
    Frontend (useApi/useAdminApi hooks) → fetch("/api/...") → Fastify →
    Supabase admin client (service-role key) → PostgreSQL

  FLUXO DE AUTENTICAÇÃO:
    Login → Supabase Auth (signInWithPassword) → JWT token →
    Armazenado em memória (adminToken.ts) → Bearer header em chamadas admin →
    Fastify verifica JWT com SUPABASE_JWT_SECRET → requireAdmin guard

  FLUXO DE UPLOAD:
    Admin clica "Enviar imagem" → POST /api/upload/sign (autenticado) →
    Recebe signedUrl + publicUrl → PUT direto no Supabase Storage →
    Salva publicUrl no formulário


================================================================================
  2. ESTRUTURA COMPLETA DE DIRETÓRIOS
================================================================================

  projeto-sete/
  │
  ├── api/                               # Backend Fastify
  │   ├── handler.ts                     # Entry point Vercel (restaura __path)
  │   ├── _src/
  │   │   ├── server.ts                  # Registro de plugins + rotas
  │   │   ├── standalone.ts              # Servidor local (tsx watch)
  │   │   ├── auth.ts                    # requireAdmin / adminGuard
  │   │   ├── lib/
  │   │   │   ├── auth.ts                # Lógica de verificação JWT
  │   │   │   ├── case.ts                # toSnake / toCamel
  │   │   │   ├── mailer.ts              # Resend/SMTP
  │   │   │   ├── supabaseAdmin.ts       # Admin client (service-role)
  │   │   │   └── supabaseUser.ts        # Anon client (public)
  │   │   ├── plugins/
  │   │   │   ├── cors.ts
  │   │   │   ├── errorHandler.ts
  │   │   │   ├── helmet.ts
  │   │   │   └── rateLimit.ts
  │   │   └── routes/
  │   │       ├── health.ts
  │   │       ├── blog.ts                # Público + Admin CRUD
  │   │       ├── portfolio.ts           # Público + Admin CRUD
  │   │       ├── caseStudies.ts
  │   │       ├── testimonials.ts
  │   │       ├── instagram.ts
  │   │       ├── comments.ts            # Público + Admin moderação
  │   │       ├── contact.ts
  │   │       ├── upload.ts              # Signed URL generator
  │   │       ├── sitemap.ts
  │   │       └── admin.ts               # /auth/me + /admin/metrics + /admin/contact
  │   ├── package.json
  │   ├── tsconfig.json
  │   └── .env.example
  │
  ├── web/                               # Frontend React
  │   ├── index.html
  │   ├── vercel.json                    # SPA rewrites + API proxy (dev)
  │   ├── vite.config.ts                 # Alias @/, @projeto-sete/shared
  │   ├── tailwind.config.ts             # Paleta + fontes + keyframes
  │   ├── postcss.config.js
  │   ├── public/
  │   │   ├── manifest.webmanifest
  │   │   └── robots.txt
  │   └── src/
  │       ├── main.tsx                    # Entry point
  │       ├── App.tsx                     # Providers + AppRouter
  │       ├── router.tsx                  # Rotas (lazy + Suspense)
  │       ├── styles/tailwind.css         # Custom components + utilities
  │       │
  │       ├── components/
  │       │   ├── layout/
  │       │   │   ├── Navbar.tsx          # Nav fixa com scroll progress + menu mobile
  │       │   │   ├── Footer.tsx          # Grid 5 colunas + contato + redes
  │       │   │   ├── RootLayout.tsx      # Navbar + Outlet + Footer + WhatsApp
  │       │   │   ├── Logo.tsx            # Logotipo (solid/light variant)
  │       │   │   └── WhatsAppFloat.tsx   # Botão flutuante (canto inferior direito)
  │       │   ├── ui/
  │       │   │   ├── Button.tsx          # Ripple effect, as=Link/button/a
  │       │   │   ├── Container.tsx       # Max-width wrapper com padding
  │       │   │   ├── Section.tsx         # Seção com tom de fundo
  │       │   │   ├── SectionHeading.tsx  # Eyebrow + título + intro
  │       │   │   ├── ScrollReveal.tsx    # Framer Motion fade-up (whileInView)
  │       │   │   ├── LoadingState.tsx    # Spinner + SkeletonCard + SkeletonLine
  │       │   │   └── ParallaxImage.tsx   # Framer Motion parallax (useScroll)
  │       │   ├── media/
  │       │   │   └── LazyMedia.tsx       # Imagem com lazy + skeleton placeholder
  │       │   ├── seo/
  │       │   │   └── Seo.tsx             # Helmet + JSON-LD (LocalBusiness/Article)
  │       │   ├── admin/
  │       │   │   └── MediaUploader.tsx   # Upload de imagem + signAndUpload()
  │       │   └── ui/ (componentes adicionais)
  │       │       ├── Card.tsx
  │       │       └── Badge.tsx
  │       │
  │       ├── features/                   # Seções da landing page
  │       │   ├── hero/Hero.tsx           # Hero com parallax, métricas, CTA
  │       │   ├── about/About.tsx         # Sobre + Bento grid (oficina, CEO, MVV)
  │       │   ├── portfolio/Portfolio.tsx # Grid de projetos com filtro por tipo
  │       │   ├── caseStudies/CaseStudies.tsx # 3 cards de destaque + fallback
  │       │   ├── testimonials/Testimonials.tsx # Depoimentos com rating + avatar
  │       │   ├── facility/Facility.tsx   # Timeline de processo + pilares
  │       │   ├── instagram/InstagramGallery.tsx # Grid 6 fotos + fallback
  │       │   ├── blog/
  │       │   │   ├── BlogPreview.tsx     # Preview na home (3 cards)
  │       │   │   ├── BlogCard.tsx        # Card com parallax + LQIP + skeleton
  │       │   │   └── Comments.tsx        # Formulário + lista de comentários
  │       │   └── contact/Contact.tsx     # Form + info + Google Maps embed
  │       │
  │       ├── pages/                      # Páginas completas
  │       │   ├── Landing.tsx             # Landing page (seções empilhadas)
  │       │   ├── BlogList.tsx            # Blog com filtro de tags
  │       │   ├── BlogPostPage.tsx        # Artigo em Markdown + comentários
  │       │   ├── PortfolioList.tsx       # Portfólio completo com filtros
  │       │   ├── PortfolioDetail.tsx     # Detalhe do projeto
  │       │   ├── CasesList.tsx           # Estudos de caso com filtro por setor
  │       │   ├── CaseDetail.tsx          # Detalhe do estudo de caso
  │       │   ├── ContatoPage.tsx         # Página de contato
  │       │   ├── SobrePage.tsx           # Página sobre
  │       │   ├── TestimonialsPage.tsx    # Depoimentos completos
  │       │   ├── ComingSoon.tsx          # Placeholder para páginas futuras
  │       │   ├── NotFound.tsx            # Página 404
  │       │   └── admin/                  # Painel admin (ver ROUTE_MAP.md)
  │       │       ├── AdminLayout.tsx     # Sidebar + topbar + footer
  │       │       ├── AdminLogin.tsx      # Login form
  │       │       ├── AdminDashboard.tsx  # Métricas
  │       │       ├── AdminBlog.tsx       # Lista de posts
  │       │       ├── BlogEditor.tsx      # Editor de post (Markdown)
  │       │       ├── AdminPortfolio.tsx  # Lista de itens
  │       │       ├── PortfolioEditor.tsx # Editor de item
  │       │       ├── AdminCases.tsx      # Lista de estudos
  │       │       ├── CaseStudyEditor.tsx # Editor de estudo
  │       │       ├── AdminTestimonials.tsx # CRUD inline
  │       │       ├── AdminInstagram.tsx  # Galeria manual
  │       │       ├── AdminComments.tsx   # Moderação
  │       │       └── AdminContact.tsx    # Caixa de entrada
  │       │
  │       ├── hooks/
  │       │   ├── useApi.ts              # Fetch genérico (useEffect + useState)
  │       │   ├── useAdminApi.ts         # Fetch autenticado + adminRequest()
  │       │   └── useParallax.ts         # Parallax com observer compartilhado
  │       │
  │       ├── lib/
  │       │   ├── apiClient.ts           # request() + authRequest() + ApiError
  │       │   ├── adminToken.ts          # Token JWT em memória
  │       │   ├── supabaseClient.ts      # Cliente Supabase (anon)
  │       │   ├── utils.ts              # cn(), formatDate(), readingMinutes()
  │       │   ├── images.ts             # URLs de imagens placeholder (Unsplash)
  │       │   ├── caseStudiesData.ts    # Dados de fallback para estudos de caso
  │       │   ├── markdown.ts           # Renderizador Markdown mínimo
  │       │   └── seo.ts               # buildSeo() — title, OG, JSON-LD
  │       │
  │       ├── store/
  │       │   ├── authStore.ts          # Zustand: session, user, signIn, signOut, hydrate
  │       │   └── uiStore.ts            # Zustand: mobileNavOpen
  │       │
  │       ├── providers/
  │       │   ├── Providers.tsx         # BrowserRouter + AuthProvider + HelmetProvider
  │       │   ├── AuthProvider.tsx      # hydrate() na montagem
  │       │   └── MotionProvider.tsx    # LazyMotion + domAnimation + reduced-motion
  │       │
  │       └── routes/
  │           └── Protected.tsx         # Check de autenticação (redirect /admin/login)
  │
  ├── shared/                            # Pacote compartilhado
  │   ├── src/
  │   │   ├── index.ts                  # Barrel export
  │   │   ├── schemas/                  # Schemas Zod
  │   │   │   ├── index.ts
  │   │   │   ├── blog.ts               # BlogPostInput + BlogQuery
  │   │   │   ├── portfolio.ts          # PortfolioItemInput + PortfolioQuery
  │   │   │   ├── caseStudy.ts          # CaseStudyInput + CaseResult
  │   │   │   ├── testimonial.ts        # TestimonialInput
  │   │   │   ├── contact.ts            # ContactInput + honeypot
  │   │   │   └── comment.ts            # CommentInput + CommentStatus
  │   │   ├── constants/
  │   │   │   ├── brand.ts             # Dados centralizados da empresa
  │   │   │   └── nav.ts               # navItems + adminNavItems + footerLegal
  │   │   ├── types/
  │   │   │   └── supabase.ts          # DbRow, AdminProfile, AdminRole
  │   │   └── lib/
  │   │       └── case.ts              # toCamel() / toSnake() — case conversion
  │   └── package.json
  │
  ├── scripts/
  │   └── build-api.mjs                # esbuild: api/_src/ → server.js
  │
  ├── supabase/                         # Config Supabase CLI
  ├── docs/                             # Documentação
  ├── vercel.json                       # SPA rewrites + API routing
  ├── package.json                      # Monorepo root
  └── .env.example                      # Template de env vars


================================================================================
  3. DESIGN SYSTEM
================================================================================

  3.1 Paleta de Cores (web/tailwind.config.ts)

    ink            #0A0B0D   → Fundo principal (preto absoluto)
    charcoal       #111316   → Fundo de seções alternadas
    graphite       #1C1E22   → Cards, superfícies elevadas
    graphite-light #282B30   → Bordas, hover states
    smoke          #6B7075   → Texto secundário
    mist           #A0A5AA   → Texto terciário
    paper          #F5F2ED   → Texto principal (off-white quente)
    cream          #EFE9DF   → Fundo admin
    brass          #B8863C   → ACENTO PRINCIPAL (links, CTAs, bordas, focus ring)
    brass-soft     #D4A96A   → Variação clara do brass
    brass-dim      #8A6630   → Variação escura do brass
    teal           #1A4A4A   → Secundário (deep teal)
    teal-light     #2A6A6A   → Hover do teal
    error          #8E2A2A   → Mensagens de erro
    success        #2E5D45   → Mensagens de sucesso
    warning        #A67A2E   → Avisos
    clay           #6B3A2A   → Acento terroso
    sage           #4F5D4F   → Acento neutro

  3.2 Tipografia

    Títulos:    "DM Serif Display" (serif, editorial, elegância)
    Corpo:      Inter (sans, máxima legibilidade)
    Eyebrow:    Inter, uppercase, tracking-[0.15em], cor brass
    Display:    display-sm(2.5rem) / display-md(3.5rem) / display-lg(4.5rem) / display-xl(5.5rem)

  3.3 Classes Utilitárias Personalizadas (em tailwind.css)

    ════ Landing ════
    .eyebrow          → Label decorativo uppercase + tracking + brass
    .section-rule     → Linha horizontal decorativa (h-px w-12 bg-brass)
    .glass-card       → Borda sutil + blur + sombra (efeito glassmorphism)
    .glass-card-hover → Hover com glow brass + borda
    .skeleton         → Skeleton shimmer animado (com ::after gradient)
    .img-overlay      → Gradient overlay (de baixo para cima, ink/80 → transparent)
    .badge            → Tag estilizada com borda brass
    .link-underline   → Underline animado com hover (width transition)
    .text-gradient-brass → Gradient linear brass no texto

    ════ Blog ════
    .prose-blog       → Tipografia de artigo (h2, h3, p, a, code, blockquote, etc.)

    ════ Admin ════
    .card-line        → Card com borda + sombra + rounded-lg
    .admin-input      → Input com rounded-lg + ring focus brass
    .admin-row        → Linha de tabela com hover highlight
    .admin-tab        → Aba de filtro (neutral)
    .admin-tab-active → Aba de filtro ativa (brass/charcoal)
    .btn-outline-sm   → Botão outline pequeno (links de ação)

  3.4 Animações (Framer Motion + CSS)

    Nome              | Duração | Timing                  | Uso
    ──────────────────|─────────|─────────────────────────|─────────────────────
    fade-up           | 0.8s    | cubic-bezier(0.22,1,0.36,1) | ScrollReveal
    fade-in           | 0.8s    | cubic-bezier(0.22,1,0.36,1) | Entrada suave
    scale-in          | 0.5s    | cubic-bezier(0.22,1,0.36,1) | Modais/ripple
    shimmer           | 2s      | linear, infinito         | Skeleton loading
    float             | 4s      | ease-in-out, infinito    | Scroll indicator
    pulse-soft        | 3s      | ease-in-out, infinito    | Elementos decorativos
    border-glow       | 2s      | ease-in-out, infinito    | Destaque de borda

  3.5 Efeitos Específicos

    BUTTON RIPPLE:
      Implementado em Button.tsx com useState + setTimeout 600ms.
      Cria um <span> com animação scale-in via animation CSS.

    SCROLL REVEAL:
      ScrollReveal.tsx usa Framer Motion whileInView com viewport={{ once: true }}.
      Reduz para fade-only se prefers-reduced-motion.

    PARALLAX:
      ParallaxImage.tsx usa useScroll + useTransform do Framer Motion.
      Parallax com offset [start end, end start], speed configurável.
      Scale sutil (1.05 → 1 → 1.05) para profundidade.
      Desativa com prefers-reduced-motion.

    LQIP (Low Quality Image Placeholder):
      Implementado em BlogCard.tsx.
      1. Skeleton shimmer enquanto imagem não carrega
      2. Imagem começa com opacity-0 + blur-sm
      3. onLoad → opacity-100 + blur-0 (transição 700ms)
      4. onError → imgLoaded = true (remove skeleton, mostra nada)


================================================================================
  4. COMPONENTES CRÍTICOS
================================================================================

  ┌─ Navbar ─────────────────────────────────────────────────────────────────┐
  │                                                                          │
  │  Arquivo: web/src/components/layout/Navbar.tsx                          │
  │                                                                          │
  │  Funcionalidades:                                                        │
  │  - Transparente no topo → bg-ink/80 + backdrop-blur ao scroll           │
  │  - Progress bar de scroll (largura da página)                           │
  │  - NavLinks com active state (text-brass)                               │
  │  - Menu mobile com overlay fullscreen + trava de body scroll            │
  │  - Botão CTA "Solicitar orçamento" → WhatsApp                          │
  │  - Logo variant: 'solid' (scrolled) ou 'light' (landing top)            │
  │                                                                          │
  │  ⚠ BUG CORRIGIDO: useEffect com 'open' + 'location.pathname' juntos     │
  │    causava fechamento imediato. Separado em dois effects.                │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ BlogCard ───────────────────────────────────────────────────────────────┐
  │                                                                          │
  │  Arquivo: web/src/features/blog/BlogCard.tsx                            │
  │                                                                          │
  │  COMPARTILHADO: Usado por BlogPreview (home) e BlogList (/blog)         │
  │                                                                          │
  │  Props: post (BlogCardItem), index (opcional), aspect ('3/2' | '16/9') │
  │                                                                          │
  │  Funcionalidades:                                                        │
  │  - Parallax suave no hover (useParallax hook com observer compartilhado) │
  │  - LQIP blur-up (skeleton → fade-in com blur transition)               │
  │  - Fallback para BLOG_IMAGES (Unsplash) se cover_image_url ausente      │
  │  - Badge de tempo de leitura (pill estilizado com border brass)         │
  │  - Gradient overlay no hover (gradient-to-t from-black/20)              │
  │  - Card com efeito lift (hover:-translate-y-1)                          │
  │  - Footer com data formatada + link "Ler mais →"                       │
  │                                                                          │
  │  ⚠ Aspect ratio usa style inline (aspectRatio), NÃO classes Tailwind    │
  │    dinâmicas (JIT não compila classes com template literals).           │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ Button ─────────────────────────────────────────────────────────────────┐
  │                                                                          │
  │  Arquivo: web/src/components/ui/Button.tsx                              │
  │                                                                          │
  │  Props: variant (primary/secondary/ghost/link/whatsapp/outline)         │
  │         size (sm/md/lg)                                                 │
  │         Aceita to= (Link React Router) ou href= (anchor) ou onClick=    │
  │                                                                          │
  │  Ripple effect: Cria <span> animado via CSS animation scale-in          │
  │  Link: import { Link } from 'react-router-dom' (para navegação SPA)     │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ Contact ────────────────────────────────────────────────────────────────┐
  │                                                                          │
  │  Arquivo: web/src/features/contact/Contact.tsx                          │
  │                                                                          │
  │  Formulário premium com:                                                 │
  │  - React Hook Form + Zod validation (schema compartilhado via shared)    │
  │  - Honeypot (campo oculto 'website' que bots preenchem)                 │
  │  - Submit → POST /api/contact → salva no Supabase + email Resend       │
  │  - Status de sucesso (mensagem verde) e erro                            │
  │  - Google Maps Embed (se VITE_GOOGLE_MAPS_API_KEY configurada)          │
  │  - Fallback para link do Google Maps se sem API key                     │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘


================================================================================
  5. HOOKS E UTILITÁRIOS
================================================================================

  ┌─ useApi (web/src/hooks/useApi.ts) ──────────────────────────────────────┐
  │                                                                          │
  │  Hook genérico de fetch para API pública.                                │
  │  Retorna { data, status, error, refetch }                                │
  │  Status: 'idle' | 'loading' | 'success' | 'error'                       │
  │  Fetch acontece no mount; refetch() força novo fetch.                    │
  │  Usa request() de apiClient.ts com tratamento de erro.                  │
  │                                                                          │
  │  Uso: const { data, status } = useApi<{ items: Item[] }>('/blog')       │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ useAdminApi (web/src/hooks/useAdminApi.ts) ────────────────────────────┐
  │                                                                          │
  │  Hook de fetch AUTENTICADO para rotas /api/admin*.                      │
  │  Status extra: 'unauth' (token ausente/expirado → redirect login)       │
  │  Usa getAdminToken() de adminToken.ts para Bearer token.                │
  │                                                                          │
  │  Exporta também adminRequest() para mutations (POST/PATCH/DELETE).      │
  │                                                                          │
  │  Uso: const { data, status } = useAdminApi<{ items: Item[] }>('/admin/blog') │
  │       await adminRequest('/blog', { method: 'POST', body: {...} })      │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ useParallax (web/src/hooks/useParallax.ts) ────────────────────────────┐
  │                                                                          │
  │  Efeito parallax suave baseado na posição do elemento na viewport.      │
  │                                                                          │
  │  ARQUITETURA OTIMIZADA:                                                  │
  │  - Um ÚNICO IntersectionObserver e scroll listener COMPARTILHADOS       │
  │    entre todas as instâncias (padrão Set<Entry> em módulo)              │
  │  - Observer com { threshold: 0 } para mínimas chamadas                  │
  │  - Scroll listener com rAF throttling (ticking flag)                    │
  │  - Scroll listener removido automaticamente quando nenhum elemento      │
  │    está visível                                                         │
  │  - Cleanup: entries.delete + observer.unobserve no unmount              │
  │                                                                          │
  │  Performance: Adequado para 20+ cards na página /blog.                  │
  │                                                                          │
  │  Uso: const { ref, offsetY } = useParallax(0.05)                       │
  │       <div ref={ref} style={{ transform: translateY(${offsetY}px) }}> │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ apiClient (web/src/lib/apiClient.ts) ──────────────────────────────────┐
  │                                                                          │
  │  request<T>(path, { method, body, token, signal }): Promise<T>          │
  │                                                                          │
  │  - BASE = import.meta.env.VITE_API_BASE ?? '/api'                      │
  │  - Lança ApiError (classe custom com status + body) em HTTP não-ok      │
  │  - Parse de JSON automático (verifica Content-Type)                     │
  │  - Trata 204 No Content → undefined                                     │
  │                                                                          │
  │  authRequest<T>(path, opts): Usa getAdminToken() internamente.          │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ utils (web/src/lib/utils.ts) ──────────────────────────────────────────┐
  │                                                                          │
  │  cn(...inputs)             → clsx (classnames condicionais)             │
  │  formatDate(iso, options)  → Date.toLocaleDateString('pt-BR')           │
  │  readingMinutes(text)      → max(1, round(words / 200))                 │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ SEO (web/src/lib/seo.ts) ──────────────────────────────────────────────┐
  │                                                                          │
  │  buildSeo({ title, description, path, image, type, noindex, jsonLd })   │
  │                                                                          │
  │  Retorna objeto com: title, description, url, og:*, twitter:*, jsonLd   │
  │  JSON-LD padrão: LocalBusiness (endereço, telefone, horário, geo, IG)   │
  │  Pode sobrescrever jsonLd para Article em posts do blog.                │
  │  SITE_URL = VITE_SITE_URL ?? 'https://projetosete.com.br'              │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘


================================================================================
  6. ROTEAMENTO VERECL — HANDLER E REWRITES
================================================================================

  ┌─ IMPORTANTE PARA MANUTENÇÃO ────────────────────────────────────────────┐
  │                                                                          │
  │  PROBLEMA: Rotas /api/blog/slug retornavam 404 no Vercel.               │
  │  Motivo: Vercel não roteava corretamente paths com 2 segmentos          │
  │          usando [[...route]].ts catch-all.                              │
  │                                                                          │
  │  SOLUÇÃO ATUAL (vercel.json):                                           │
  │    {                                                                    │
  │      "rewrites": [                                                      │
  │        { "source": "/api/:path*", "destination": "/api/handler?__path=:path*" }, │
  │        { "source": "/(.*)", "destination": "/index.html" }              │
  │      ]                                                                  │
  │    }                                                                    │
  │                                                                          │
  │  api/handler.ts:                                                        │
  │    1. Extrai __path da query string                                     │
  │    2. Restaura req.url para /api/<path>                                │
  │    3. Emite para Fastify via app.server.emit('request', req, res)       │
  │    4. Se sem __path, trata como requisição raiz (/api)                  │
  │                                                                          │
  │  ⚠ NÃO REMOVA AS REWRITES EXPLÍCITAS.                                  │
  │  ⚠ NÃO TENTE VOLTAR PARA [[...route]].ts.                               │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  Roteamento SPA (frontend):
    Todas as rotas que não são /api/* são servidas pelo index.html.
    O React Router cuida do roteamento no cliente.
    Isto está configurado em web/vercel.json e no vercel.json raiz.

  Proxy de desenvolvimento:
    web/vite.config.ts → server.proxy: /api → http://localhost:3001
    Não precisa de CORS em desenvolvimento.


================================================================================
  7. SUPABASE — ESQUEMA E SEGURANÇA
================================================================================

  7.1 Tabelas Principais

    portfolio_categories
      id (uuid PK), slug (unique), name, position, created_at

    portfolio_items
      id, title, slug (unique), summary, description, category_id (FK),
      project_type, location, year, area_m2, media (jsonb), cover_image_url,
      is_featured, is_published, position, published_at,
      created_at, updated_at, deleted_at (soft-delete)

    case_studies
      id, title, slug (unique), client, category, challenge, process,
      results (jsonb), gallery (jsonb), cover_image_url,
      is_published, featured, published_at, created_at, updated_at, deleted_at

    testimonials
      id, author, role, company, quote, rating, avatar_url,
      is_published, position, created_at, updated_at

    instagram_posts
      id, caption, image_url, post_url, aspect_ratio, posted_at,
      is_published, created_at

    blog_posts
      id, title, slug (unique), excerpt, body, cover_image_url, cover_alt,
      reading_minutes, tags (text[]), author, author_avatar_url,
      is_published, published_at, seo (jsonb),
      created_at, updated_at, deleted_at

    comments
      id, blog_post_id (FK), parent_id (FK self, 1 nível),
      author_name, author_email, body, status (pending/approved/rejected/spam),
      created_at, deleted_at

    contact_submissions
      id, name, email, phone, subject, message, status (new/read/replied/archived),
      created_at

    admin_profiles
      user_id (PK, FK auth.users), full_name, role (admin/editor), created_at

  7.2 RLS (Row Level Security) — RESUMO

    Tabelas de conteúdo:        SELECT público WHERE is_published = true
                                CRUD admin (auth.uid() IN admin_profiles)
    comments:                   INSERT anônimo (com honeypot)
                                SELECT público WHERE status = 'approved'
                                UPDATE/DELETE admin
    contact_submissions:        INSERT anônimo (com honeypot)
                                SELECT/UPDATE admin
    admin_profiles:             SELECT próprio (auth.uid() = user_id)
    Storage bucket 'media':     SELECT público, INSERT via service-role

    DDL completo: docs/SUPABASE_SCHEMA.sql + docs/SUPABASE_RLS.sql


================================================================================
  8. PADRÕES DE CÓDIGO E CONVENÇÕES
================================================================================

  ┌─ CAMEL CASE vs SNAKE CASE ──────────────────────────────────────────────┐
  │                                                                          │
  │  Frontend (TypeScript): camelCase                                       │
  │    - Schemas Zod: portfolioItemInputSchema (camelCase)                   │
  │    - Componentes: isPublished, coverImageUrl, readingMinutes             │
  │                                                                          │
  │  Banco (Supabase/PostgreSQL): snake_case                                │
  │    - Tabelas: blog_posts, portfolio_items, is_published, cover_image_url │
  │                                                                          │
  │  API:                                                                   │
  │    - Input/Output: camelCase (validação Zod)                            │
  │    - Antes de inserir no banco: toSnake() (shared/src/lib/case.ts)      │
  │    - Depois de ler do banco: toCamel() (mesmo arquivo)                  │
  │                                                                          │
  │  ⚠ Atenção: toSnake/toCamel não fazem recursão profunda em arrays.      │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ IMPORT ALIASES ────────────────────────────────────────────────────────┐
  │                                                                          │
  │  Frontend: @/  → web/src/                                              │
  │            @projeto-sete/shared → shared/src/                          │
  │                                                                          │
  │  Config: web/tsconfig.app.json (paths) + web/vite.config.ts (resolve)   │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ LAZY LOADING ──────────────────────────────────────────────────────────┐
  │                                                                          │
  │  Todas as páginas usam React.lazy() + Suspense com LoadingState.         │
  │  router.tsx: lazy(() => import('@/pages/...').then(m => ({default: m.X}))) │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ ESTADO GLOBAL ─────────────────────────────────────────────────────────┐
  │                                                                          │
  │  Zustand 5:                                                             │
  │  - authStore: session, user, loading, error, signIn, signOut, hydrate   │
  │  - uiStore: mobileNavOpen, setMobileNavOpen, toggleMobileNav            │
  │                                                                          │
  │  Token JWT: armazenado em MEMÓRIA (adminToken.ts), não em localStorage  │
  │            (mais seguro, mas não persiste entre reloads).               │
  │            syncToken() é chamada no signIn e em onAuthStateChange.      │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ FORMS E VALIDAÇÃO ─────────────────────────────────────────────────────┐
  │                                                                          │
  │  Frontend: React Hook Form + zodResolver                               │
  │  Schemas: shared/src/schemas/ (reaproveitados por API e front)          │
  │  Admin: zodResolver(blogPostInputSchema as unknown as Parameters<...>)  │
  │         (cast devido a incompatibilidade de tipos entre libs)           │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ EMAIL ─────────────────────────────────────────────────────────────────┐
  │                                                                          │
  │  Prioridade: Resend (API)                                               │
  │  Fallback: SMTP (se configurado)                                        │
  │  Sem config: loga warning e retorna erro (não quebra o app)             │
  │  Fire-and-forget: erro de envio não é exibido ao usuário                │
  │                                                                          │
  │  Enviado após POST /api/contact salvar no Supabase.                     │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘


================================================================================
  9. COMANDOS ÚTEIS
================================================================================

  npm run dev              → web:5173 + api:3001 (concurrently)
  npm run build            → shared → api → web
  npm run build:web        → Vite build (web/dist/)
  npm run build:api        → esbuild (api/_src/ → server.js)
  npm run build:shared     → tsc (shared/src/ → shared/dist/)
  npm run typecheck        → tsc --noEmit em todos os workspaces
  npm run format           → Prettier (todos os arquivos)
  npm run format:check     → Verificar formatação
  npm run lint             → Lint (pendente ESLint)

  npx vercel deploy --prod → Deploy Vercel
  npx vercel env add       → Adicionar env var na Vercel


================================================================================
  10. VARIÁVEIS DE AMBIENTE
================================================================================

  ┌─ api/.env (raiz) ───────────────────────────────────────────────────────┐
  │                                                                          │
  │  SUPABASE_URL                  → URL do projeto Supabase                 │
  │  SUPABASE_ANON_KEY             → Chave anônima (pública)                 │
  │  SUPABASE_SERVICE_ROLE_KEY     → Chave service-role (admin DB)          │
  │  SUPABASE_JWT_SECRET           → Secret para verificar JWT tokens       │
  │  RESEND_API_KEY                → API key do Resend (email)              │
  │  MAIL_FROM                     → Email de origem (ex: contato@...)      │
  │  ADMIN_NOTIFY_EMAIL            → Email que recebe notificações          │
  │  APP_URL                       → URL do site (ex: https://projetosete...)│
  │  NODE_ENV                      → development / production               │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ web/.env ──────────────────────────────────────────────────────────────┐
  │                                                                          │
  │  VITE_SUPABASE_URL             → URL do projeto Supabase                 │
  │  VITE_SUPABASE_ANON_KEY        → Chave anônima (pública)                 │
  │  VITE_API_BASE                 → /api (proxy Vite ou produção)          │
  │  VITE_SITE_URL                 → URL do site                             │
  │  VITE_GOOGLE_MAPS_API_KEY      → API key do Google Maps Embed           │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘


================================================================================
  11. SOLUÇÃO DE PROBLEMAS COMUNS
================================================================================

  ┌─ Rota /api/blog/slug retorna 404 do Vercel ────────────────────────────┐
  │  Causa: Rewrites removidas ou handler corrompido.                       │
  │  Solução: Verifique vercel.json rewrites + api/handler.ts               │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ Menu mobile não abre / fecha imediatamente ────────────────────────────┐
  │  Causa: useEffect com dependências conflitantes.                        │
  │  Solução: Separe em dois effects (ver Navbar.tsx).                      │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ Inputs do admin com texto invisível (claro sobre claro) ──────────────┐
  │  Causa: Herdam text-paper (claro) do body global.                       │
  │  Solução: Adicionar .admin-input com text-ink. CSS extra para selects:  │
  │    .bg-cream select option { color: #0A0B0D; background: #F5F2ED; }   │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ Build falha com erro de tipo ──────────────────────────────────────────┐
  │  Causa: Shared desatualizado.                                           │
  │  Solução: npm run build:shared primeiro.                                │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ Card-line sem borda/sombra ────────────────────────────────────────────┐
  │  Causa: Classe undefined (não definida como componente CSS).            │
  │  Solução: Definir .card-line em tailwind.css.                           │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ CORB warning no console ───────────────────────────────────────────────┐
  │  Descrição: "Cross-Origin Read Blocking" — warning benigno.             │
  │  Impacto: Baixo/nulo.                                                   │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ Email não enviado (formulário mostra sucesso) ─────────────────────────┐
  │  Causa: RESEND_API_KEY não configurada.                                 │
  │  Solução: Configure env var. Erro é fire-and-forget (não exibido).      │
  └──────────────────────────────────────────────────────────────────────────┘


================================================================================
  12. CHECKLIST PARA FUTUROS DESENVOLVIMENTOS
================================================================================

  ANTES DE COMEÇAR:
  [ ] Leia este README.txt + docs/ROUTE_MAP.md
  [ ] Entenda o padrão camelCase ↔ snake_case (shared/src/lib/case.ts)
  [ ] Verifique se shared precisa de build: npm run build:shared

  NOVAS SEÇÕES NA LANDING:
  [ ] Criar em web/src/features/nova-secao/
  [ ] Adicionar no router.tsx ou diretamente no Landing.tsx
  [ ] Seção deve aceitar tone (dark/charcoal/cream/light)

  NOVAS PÁGINAS:
  [ ] Adicionar lazy import em router.tsx
  [ ] Usar <Seo> para meta tags + JSON-LD
  [ ] Se precisar de API, adicionar hook useApi/useAdminApi

  NOVOS SCHEMAS:
  [ ] Adicionar em shared/src/schemas/
  [ ] Exportar em shared/src/schemas/index.ts
  [ ] Build shared: npm run build:shared
  [ ] Usar toSnake() antes de inserir no banco
  [ ] Usar toCamel() depois de ler do banco

  NOVAS ROTAS NA API:
  [ ] Adicionar em api/_src/routes/
  [ ] Registrar em api/_src/server.ts
  [ ] Se admin: usar preHandler: adminGuard ou requireAdmin
  [ ] Build api: npm run build:api

  MUDANÇAS NO BANCO:
  [ ] Executar scripts SQL no Supabase Dashboard (SQL Editor)
  [ ] Atualizar docs/SUPABASE_SCHEMA.sql (idempotente)
  [ ] Adicionar RLS policies em docs/SUPABASE_RLS.sql
  [ ] Considerar Supabase CLI para migrations: supabase migration new

  DEPLOY:
  [ ] git push → CI roda lint + typecheck + build
  [ ] Vercel deploy automático (ou vercel deploy --prod)
  [ ] Verificar /api/health após deploy
  [ ] Verificar SPA: navegar para /blog e dar refresh
  [ ] Verificar API: curl /api/blog (1 segmento) e /api/blog/slug (2 segmentos)

  TESTES:
  [ ] Testar em viewports: 360px, 768px, 1024px, 1440px
  [ ] Verificar acessibilidade (axe DevTools)
  [ ] Lighthouse ≥ 90
  [ ] npm run typecheck (todos os workspaces)
  [ ] npm run build (completo)


================================================================================
  13. DEPENDÊNCIAS PRINCIPAIS
================================================================================

  Frontend (web):
    react 18.3         → UI
    react-router-dom 6 → Roteamento SPA
    framer-motion 11   → Animações
    zustand 5          → Estado global
    react-hook-form 7  → Formulários
    @hookform/resolvers→ Integração Zod
    zod 3              → Validação
    @supabase/supabase-js 2 → Cliente Supabase
    react-helmet-async → SEO
    clsx               → Classnames condicionais
    tailwindcss 3.4    → CSS utility-first
    vite 5             → Build tool

  Backend (api):
    fastify 4          → Framework HTTP
    @fastify/cors      → CORS
    @fastify/helmet    → Segurança
    @fastify/rate-limit→ Rate limiting
    @supabase/supabase-js 2 → Cliente Supabase
    zod 3              → Validação
    dotenv             → Env vars
    tsx                → TypeScript execution (dev)

  Build:
    esbuild            → Bundle do backend
    typescript 5.7     → Type checking
    prettier 3.4       → Formatação
    concurrently       → Dev servers paralelos
    sharp              → Processamento de imagem (dev)


================================================================================
  FIM DA DOCUMENTAÇÃO
  Última atualização: Julho/2026
================================================================================
