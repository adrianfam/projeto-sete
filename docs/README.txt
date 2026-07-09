================================================================================
  PROJETO SETE — MÓVEIS PLANEJADOS E MARCENARIA DE ALTO PADRÃO
  Documentação Completa para Manutenção e Upgrade
================================================================================

   Site: https://projeto-sete.vercel.app
   Repo: https://github.com/adrianfam/projeto-sete
  Stack: Vite + React 18 + TypeScript | Fastify + Node | Supabase | Vercel


================================================================================
  1. VISÃO GERAL
================================================================================

  Site institucional premium + CMS administrativo para a Projeto Sete,
  marceneira de alto padrão em Fortaleza/CE (desde 2009).

  O projeto é um monorepo com 3 workspaces npm interligados:

    /web      → Frontend (Vite + React 18 + TailwindCSS)
    /api      → Backend API (Fastify + esbuild bundle)
    /shared   → Pacote compartilhado (schemas Zod, constantes, tipos)

  Hospedagem: Vercel (frontend estático + Serverless Functions)
  Database:   Supabase (PostgreSQL + Auth + Storage)
  Email:      Resend (API)


================================================================================
  2. REQUISITOS DE AMBIENTE
================================================================================

  - Node.js >= 20 (recomendado 22 LTS)
  - npm >= 10
  - Conta no Supabase (gratuita)
  - Chave da API Resend (gratuita, 100 emails/dia)
  - Google Maps Embed API key (opcional)


================================================================================
  3. ESTRUTURA DE ARQUIVOS
================================================================================

  projeto-sete/
  │
  ├── api/                                # Backend Fastify
  │   ├── [[...route]].ts → handler.ts    # Entry point Vercel Serverless
  │   ├── _src/                           # Código-fonte compilado via esbuild
  │   │   ├── server.ts                   # Servidor Fastify (registro de rotas)
  │   │   ├── standalone.ts               # Servidor standalone (desenvolvimento local)
  │   │   ├── lib/                        # Utilitários: auth, mailer, supabase
  │   │   ├── plugins/                    # Plugins Fastify: cors, helmet, rate-limit
  │   │   └── routes/                     # Rotas da API
  │   │       ├── health.ts
  │   │       ├── blog.ts
  │   │       ├── portfolio.ts
  │   │       ├── contact.ts
  │   │       ├── comments.ts
  │   │       ├── testimonials.ts
  │   │       ├── caseStudies.ts
  │   │       ├── instagram.ts
  │   │       ├── upload.ts
  │   │       ├── sitemap.ts
  │   │       └── admin.ts
  │   ├── .env                            # Variáveis de ambiente (NÃO COMMITAR)
  │   ├── package.json
  │   └── tsconfig.json
  │
  ├── web/                                # Frontend React
  │   ├── index.html
  │   ├── src/
  │   │   ├── main.tsx                    # Entry point
  │   │   ├── App.tsx
  │   │   ├── router.tsx                  # Rotas React Router
  │   │   ├── styles/tailwind.css         # Estilos globais + componentes Tailwind (inclui classes do admin)
  │   │   ├── components/                 # Componentes compartilhados
  │   │   │   ├── layout/                 # Navbar, Footer, RootLayout, WhatsAppFloat
  │   │   │   ├── ui/                     # Button, Container, Section, ScrollReveal, etc.
  │   │   │   ├── media/                  # LazyMedia
  │   │   │   └── seo/                    # SEO (meta tags, JSON-LD)
  │   │   ├── features/                   # Seções da landing page
  │   │   │   ├── hero/
  │   │   │   ├── about/
  │   │   │   ├── blog/                   # BlogPreview, BlogCard (COMPARTILHADO)
  │   │   │   ├── caseStudies/
  │   │   │   ├── contact/
  │   │   │   ├── facility/
  │   │   │   ├── instagram/
  │   │   │   ├── portfolio/
  │   │   │   └── testimonials/
  │   │   ├── hooks/                      # Custom hooks (useApi, useParallax, etc.)
  │   │   ├── lib/                        # Utilitários (apiClient, utils, supabaseClient)
  │   │   ├── pages/                      # Páginas
  │   │   │   ├── Landing.tsx
  │   │   │   ├── BlogList.tsx
  │   │   │   ├── BlogPostPage.tsx
  │   │   │   ├── NotFound.tsx
  │   │   │   └── admin/                  # Páginas do painel admin
  │   │   ├── store/                      # Zustand stores (authStore, uiStore)
  │   │   ├── providers/                  # Providers (Auth, Motion)
  │   │   └── routes/                     # Rota protegida (Protected.tsx)
  │   ├── tailwind.config.ts
  │   ├── vite.config.ts
  │   ├── postcss.config.js
  │   └── package.json
  │
  ├── shared/                             # Pacote compartilhado
  │   ├── src/
  │   │   ├── schemas/                    # Schemas Zod (blog, contact, portfolio, etc.)
  │   │   ├── constants/                  # brand.ts (dados da empresa), nav.ts
  │   │   ├── types/                      # Tipos TypeScript (supabase.ts)
  │   │   └── index.ts                    # Barrel export
  │   └── package.json
  │
  ├── scripts/                            # Scripts de build
  │   └── build-api.mjs                   # Bundle do backend com esbuild
  │
  ├── supabase/                           # Configurações do Supabase CLI
  │
  ├── docs/                               # Documentação
  │   ├── SUPABASE_SCHEMA.sql             # DDL do banco
  │   ├── SUPABASE_RLS.sql                # Políticas de segurança
  │   ├── SUPABASE_SEED.sql               # Dados de exemplo
  │   ├── ROUTE_MAP.md                    # Mapa de rotas
  │   ├── INSTALL.md                      # Instruções de instalação
  │   ├── DESENVOLVIMENTO.md              # Documentação de desenvolvimento
  │   ├── DEPLOY.md                       # Instruções de deploy
  │   └── README.txt                      # Este arquivo
  │
  ├── vercel.json                         # Configuração de deploy Vercel
  ├── package.json                        # Monorepo root
  └── .env.example                        # Template de variáveis de ambiente


================================================================================
  4. STACK TECNOLÓGICA DETALHADA
================================================================================

  ┌─ FRONTEND ───────────────────────────────────────────────────────────────┐
  │                                                                          │
  │  Framework:  React 18 + TypeScript (strict mode)                         │
  │  Build:      Vite 5 + esbuild                                            │
  │  Roteamento: React Router DOM v6 (lazy loading + Suspense)               │
  │  Estado:     Zustand 5 (authStore, uiStore)                              │
  │  Forms:      React Hook Form + Zod (validação compartilhada)             │
  │  Estilos:    Tailwind CSS 3.4 (dark mode, custom palette)                │
  │  Animação:   Framer Motion 11 (ScrollReveal, transições)                 │
  │  SEO:        react-helmet-async + JSON-LD estruturado                    │
  │  Ícones:     SVGs inline (sem dependência de biblioteca de ícones)       │
  │                                                                          │
  │  Estrutura:  pages/ → features/ → components/ (atomic design)            │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ BACKEND ───────────────────────────────────────────────────────────────┐
  │                                                                          │
  │  Framework:  Fastify 4 (mais rápido que Express, schema validation       │
  │              nativa com AJV, plugins encapsulados)                       │
  │  Runtime:    Node.js (Vercel Serverless Functions)                       │
  │  Bundle:     esbuild (compila _src/ → server.js)                        │
  │  Validação:  Zod (schemas compartilhados com o frontend)                │
  │  Plugins:    @fastify/cors, @fastify/helmet, @fastify/rate-limit        │
  │  Database:   @supabase/supabase-js (admin client)                       │
  │  Email:      Resend API (fetch direto — sem SDK)                        │
  │                                                                          │
  │  Rotas:  Todas sob prefixo /api    (ver docs/ROUTE_MAP.md)              │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ DATABASE (Supabase PostgreSQL) ─────────────────────────────────────────┐
  │                                                                          │
  │  Tabelas:  (ver docs/SUPABASE_SCHEMA.sql)                               │
  │                                                                          │
  │  portfolio_categories  → Categorias de portfólio                        │
  │  portfolio_items       → Projetos do portfólio                          │
  │  case_studies          → Estudos de caso                                │
  │  testimonials          → Depoimentos de clientes                        │
  │  instagram_posts       → Galeria do Instagram (manual)                  │
  │  blog_posts            → Artigos do blog (com suporte a tags)           │
  │  comments              → Comentários moderados (1 nível de aninhamento)  │
  │  contact_submissions   → Mensagens do formulário de contato             │
  │  admin_profiles        → Perfis de administradores (1:1 auth.users)     │
  │  media_assets          → Ledger de uploads (opcional)                   │
  │                                                                          │
  │  RLS:  Leitura pública onde is_published = true                         │
  │        INSERT anônimo em comments e contact_submissions                 │
  │        CRUD total apenas para admin (auth.uid em admin_profiles)        │
  │        Bucket 'media' com leitura pública, escrita via service-role     │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘


================================================================================
  5. FLUXO DE BUILD E DEPLOY
================================================================================

  5.1 Build Local

    npm run build:shared   → tsc compila shared/src/ → shared/dist/
    npm run build:api      → scripts/build-api.mjs (esbuild) →
                             api/_src/server.ts → api/_src/server.js
    npm run build:web      → tsc typecheck + vite build → web/dist/

    Ou tudo de uma vez:
    npm run build           → shared → api → web (sequencial)

  5.2 Build do Backend (esbuild)

    O script scripts/build-api.mjs:
    - Entrada: api/_src/server.ts (+ standalone.ts opcional)
    - Saída:   api/_src/server.js (bundle único)
    - External: fastify, @fastify/*, @supabase/supabase-js, zod
    - Resolve: @projeto-sete/shared → shared/dist/index.js (inlineia no bundle)

    USAR PATHS ABSOLUTOS via import.meta.url (independe de CWD).

  5.3 Deploy Vercel

    O deploy é feito via Vercel CLI ou integração GitHub:
    vercel deploy --prod

    O vercel.json configura:
    - Rewrite: /api/:path*  →  /api/handler?__path=:path*
    - Rewrite: /(.*)        →  /index.html  (SPA fallback)
    - Function: api/handler.ts com maxDuration: 20s

    IMPORTANTE: O handler.ts restaura a URL original a partir de __path
    antes de passar para o Fastify. Isso é necessário porque o Vercel
    não roteia corretamente paths com 2 segmentos para catch-all
    [[...route]].ts (motivo pelo qual trocamos para rewrites explícitas).

  5.4 Variáveis de Ambiente na Vercel

    Obrigatórias:
      SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
      SUPABASE_JWT_SECRET, APP_URL, NODE_ENV=production
      VITE_API_BASE=/api, VITE_SITE_URL

    Email:
      RESEND_API_KEY, MAIL_FROM, ADMIN_NOTIFY_EMAIL

    Opcionais:
      WHATSAPP_NUMBER, VITE_GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_API_KEY


================================================================================
  6. ARQUITETURA DO ROTEAMENTO (VERCEL + FASTIFY)
================================================================================

  ┌─ IMPORTANTE PARA MANUTENÇÃO ────────────────────────────────────────────┐
  │                                                                          │
  │  O roteamento passou por várias iterações para corrigir um bug onde      │
  │  paths com 2 segmentos (/api/blog/slug) retornavam 404 do Vercel.       │
  │                                                                          │
  │  SOLUÇÃO ATUAL:                                                         │
  │                                                                          │
  │  1. vercel.json                                                         │
  │     { "source": "/api/:path*", "destination": "/api/handler?__path=:path*" } │
  │                                                                          │
  │  2. api/handler.ts                                                      │
  │     - Recebe a requisição em /api/handler?__path=blog/slug              │
  │     - Extrai __path e restaura req.url = /api/blog/slug                 │
  │     - Passa para Fastify via app.server.emit('request', req, res)      │
  │                                                                          │
  │  NÃO TENTE VOLTAR PARA [[...route]].ts — não funciona com 2 segmentos   │
  │  no Vercel. Mantenha as rewrites explícitas.                            │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘


================================================================================
  7. COMPONENTES E HOOKS IMPORTANTES
================================================================================

  ┌─ BlogCard (COMPARTILHADO) ──────────────────────────────────────────────┐
  │                                                                          │
  │  Arquivo: web/src/features/blog/BlogCard.tsx                            │
  │                                                                          │
  │  Usado por: BlogPreview.tsx (homepage) e BlogList.tsx (/blog)           │
  │                                                                          │
  │  Funcionalidades:                                                        │
  │  - Imagem com parallax suave ao scroll (useParallax hook               │
  │    com observer compartilhado)                                          │
  │  - LQIP blur-up: skeleton shimmer → fade-in com blur (onLoad/onError) │
  │  - Fallback para BLOG_IMAGES (Unsplash) quando não há cover_image_url  │
  │  - Badge de tempo de leitura (pill estilizado)                         │
  │  - Gradient overlay na imagem ao hover                                 │
  │  - Card com efeito lift (hover:-translate-y-1)                         │
  │  - Footer com data + link "Ler mais →"                                │
  │  - Props: post (BlogCardItem), index (opcional), aspect ('3/2' ou '16/9') │
  │                                                                          │
  │  IMPORTANTE: O aspect ratio usa style inline (aspectRatio), NÃO classes │
  │  Tailwind dinâmicas, porque o JIT não compila classes com template      │
  │  literals (ex: aspect-[${aspect}]).                                    │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ useParallax (HOOK) ────────────────────────────────────────────────────┐
  │                                                                          │
  │  Arquivo: web/src/hooks/useParallax.ts                                  │
  │                                                                          │
  │  Cria um efeito parallax suave baseado na posição do elemento na        │
  │  viewport. Usa IntersectionObserver + requestAnimationFrame.            │
  │                                                                          │
  │  Uso: const { ref, offsetY } = useParallax(0.05)                       │
  │       <div ref={ref} style={{ transform: translateY(${offsetY}px) }} />│
  │                                                                          │
  │  ARQUITETURA: Um ÚNICO IntersectionObserver e scroll listener são      │
  │  compartilhados entre TODAS as instâncias do hook (padrão Set<Entry>    │
  │  em nível de módulo). Evita N observers + N listeners.                 │
  │  - Observer com { threshold: 0 } para mínimas chamadas                 │
  │  - scroll listener com rAF throttling (ticking flag)                   │
  │  - Scroll listener removido automaticamente quando nenhum elemento      │
  │    está visível                                                        │
  │  - Cleanup: entries.delete + observer.unobserve no unmount             │
  │                                                                          │
  │  Performance: Adequado para 20+ cards na página /blog.                 │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ LQIP (Low Quality Image Placeholder) ─────────────────────────────────┐
  │                                                                          │
  │  Implementado no BlogCard.tsx para todas as imagens dos cards.          │
  │                                                                          │
  │  Como funciona:                                                         │
  │  1. Enquanto a imagem não carrega, um div com classe 'skeleton'        │
  │     (shimmer animado) cobre a área da imagem                           │
  │  2. A imagem começa com opacity-0 blur-sm                              │
  │  3. Ao carregar (onLoad), a classe muda para opacity-100 blur-0        │
  │     com transição CSS de 700ms                                         │
  │  4. Em caso de erro (onError), o placeholder é removido para não       │
  │     ficar travado para sempre                                          │
  │                                                                          │
  │  Estado: imgLoaded (useState) controlado por onLoad/onError            │
  │  (useCallback com deps vazias para referência estável)                 │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ ScrollReveal ──────────────────────────────────────────────────────────┐
  │                                                                          │
  │  Componente que anima a entrada de elementos ao scroll (fade-up)        │
  │  usando Framer Motion whileInView.                                      │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ Navbar ────────────────────────────────────────────────────────────────┐
  │                                                                          │
  │  Arquivo: web/src/components/layout/Navbar.tsx                          │
  │                                                                          │
  │  IMPORTANTE: O menu mobile teve um bug onde o useEffect tinha 'open'    │
  │  como dependência junto com 'location.pathname', causando fechamento    │
  │  imediato do menu ao abrir. A correção separou em dois effects:         │
  │  - Um para fechar na navegação                                          │
  │  - Outro para travar/liberar o body scroll                             │
  │                                                                          │
  │  NÃO JUNTE OS DOIS EFFECTS NOVAMENTE.                                   │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ Mailer ────────────────────────────────────────────────────────────────┐
  │                                                                          │
  │  Arquivo: api/_src/lib/mailer.ts                                        │
  │                                                                          │
  │  Prioriza Resend (API). Se RESEND_API_KEY não setada, tenta SMTP.       │
  │  Se nenhum configurado, loga warning e retorna erro (não quebra).       │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘


================================================================================
  8. DESIGN SYSTEM
================================================================================

  8.1 Paleta de Cores

    ink            #0A0B0D  (preto absoluto)
    charcoal       #111316  (fundo de seções alternadas)
    graphite       #1C1E22  (cards, superfícies elevadas)
    graphite-light #282B30  (bordas, hover)
    smoke          #6B7075  (texto secundário)
    mist           #A0A5AA  (texto terciário)
    paper          #F5F2ED  (texto principal, off-white quente)
    brass          #B8863C  (acento principal — bordas, links, CTAs)
    brass-soft     #D4A96A  (variação mais clara do brass)
    teal           #1A4A4A  (secundário, deep teal)

    Tailwind config em web/tailwind.config.ts

  8.2 Tipografia

    Títulos:  DM Serif Display (serif, editorial)
    Corpo:    Inter (sans, máxima legibilidade)
    Eyebrow:  Inter, uppercase, tracking-[0.15em], text-brass

  8.3 Classes Utilitárias (componentes Tailwind customizados)

    .skeleton         → Loading shimmer animado (com ::after highlight)
    .glass-card       → Efeito glassmorphism (blur + borda sutil)
    .glass-card-hover → Hover com glow brass
    .eyebrow          → Label uppercase tracking-wider
    .prose-blog       → Tipografia para posts do blog
    .link-underline   → Underline animado em links

    ┌─ ADMIN ───────────────────────────────────────────────────────────────┐
    │                                                                          │
    │  Classes exclusivas para o painel administrativo:                       │
    │                                                                          │
    │  .card-line       → Card com borda, sombra sutil e rounded-lg           │
    │  .admin-input     → Input com rounded-lg, ring focus, transição         │
    │  .admin-row       → Linha de tabela com hover highlight                 │
    │  .admin-tab       → Aba de filtro (neutral)                            │
    │  .admin-tab-active→ Aba de filtro ativa (brass)                        │
    │  .btn-outline-sm  → Link com estilo de botão outline pequeno           │
    │                                                                          │
    │  NOTA: .card-line estava undefined — não renderizava borda/sombra.      │
    │  Foi definido em tailwind.css para corrigir todos os cards do admin.    │
    │                                                                          │
    └──────────────────────────────────────────────────────────────────────────┘

  8.4 Animações

    shimmer:   2s, linear, infinito  (skeleton loading)
    fade-up:   0.8s, cubic-bezier(0.22,1,0.36,1)  (ScrollReveal)
    float:     4s, ease-in-out, infinito  (elementos decorativos)
    scale-in:  0.5s  (modais)


================================================================================
  9. FLUXO DE EMAIL (FORMULÁRIO DE CONTATO)
================================================================================

  1. Usuário preenche formulário em /#contato
  2. POST /api/contact com { name, email, phone?, subject?, message }
     + honeypot (campo oculto 'website')
  3. API salva no Supabase (contact_submissions)
  4. API envia email via Resend para ADMIN_NOTIFY_EMAIL
  5. Resposta: { ok: true, message: "Mensagem recebida..." }

  Rate limit: 5 requisições por 10 minutos (por IP)


================================================================================
  10. MANUTENÇÃO — CHECKLIST PARA UPGRADES
================================================================================

  [ ] Antes de qualquer upgrade, leia este README.txt e o docs/DESENVOLVIMENTO.md

  [ ── DEPENDÊNCIAS ── ]

  [ ] npm outdated  → verificar versões disponíveis
  [ ] Atualizar com cuidado: npm update (ou npm install packagename@latest)
  [ ] Testar build completo: npm run build
  [ ] Verificar breaking changes nas libs principais:
        - React 18 → 19 (cuidado com hydration, concurrent features)
        - Vite 5 → 6
        - Tailwind CSS 3 → 4 (grandes mudanças no JIT)
        - Fastify 4 → 5
        - Supabase JS SDK v2 → v3

  [ ── ROTEAMENTO ── ]

  [ ] Se mexer no vercel.json, TESTE:
        - /api/health (1 segmento)
        - /api/blog (1 segmento com query)
        - /api/blog/slug (2 segmentos)
        - /portfolio (SPA rewrite)
  [ ] Se trocar o handler.ts, mantenha a lógica de restauração do __path
  [ ] Se migrar para outro provider (Render, Railway), o roteamento muda

  [ ── BANCO DE DADOS ── ]

  [ ] Alterações no schema: execute SUPABASE_SCHEMA.sql (idempotente)
  [ ] Novas tabelas: criar RLS policies em SUPABASE_RLS.sql
  [ ] Migrations: considere usar o Supabase CLI (supabase migration new)
  [ ] Backup antes de alterar dados em produção

  [ ── FRONTEND ── ]

  [ ] Novas seções na landing: criar em web/src/features/
  [ ] Novas páginas: adicionar rota em web/src/router.tsx (lazy import)
  [ ] Novos schemas: adicionar em shared/src/schemas/ + exportar
  [ ] Testar em todos os viewports: 360px, 768px, 1024px, 1440px
  [ ] Verificar acessibilidade (axe DevTools)
  [ ] Verificar Lighthouse > 90

  [ ── DEPLOY ── ]

  [ ] git push → deploy automático no Vercel (ou vercel deploy --prod)
  [ ] Verificar variáveis de ambiente na Vercel (Settings → Environment Variables)
  [ ] Testar /api/health após deploy
  [ ] Testar formulário de contato (envio de email)


================================================================================
  11. SOLUÇÃO DE PROBLEMAS COMUNS
================================================================================

  ┌─ PROBLEMA: Rota /api/blog/slug retorna 404 do Vercel ──────────────────┐
  │                                                                          │
  │  Causa: As rewrites explícitas podem ter sido removidas ou alteradas.   │
  │  Solução: Verifique vercel.json — deve ter:                            │
  │    { "source": "/api/:path*", "destination": "/api/handler?__path=:path*" } │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ PROBLEMA: Menu mobile não abre ────────────────────────────────────────┐
  │                                                                          │
  │  Causa: useEffect com 'open' e 'location.pathname' juntos no array      │
  │         de dependências.                                                │
  │  Solução: Separe em dois useEffect. Veja Navbar.tsx.                   │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ PROBLEMA: Email não é enviado (mas formulário mostra sucesso) ────────┐
  │                                                                          │
  │  Causa: RESEND_API_KEY não configurada ou inválida.                    │
  │  Solução: Verifique api/.env ou Vercel env vars.                       │
  │  O sendMail() usa void (fire-and-forget) — erros não são mostrados     │
  │  ao usuário. Verifique os logs da Vercel.                              │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ PROBLEMA: Build falha com erro de tipo ────────────────────────────────┐
  │                                                                          │
  │  Causa: Shared package desatualizado ou incompatível.                   │
  │  Solução: npm run build:shared primeiro, depois build:api e build:web.  │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ PROBLEMA: Função Vercel retorna 500 ───────────────────────────────────┐
  │                                                                          │
  │  Causa: Pacote @projeto-sete/shared não resolvido em runtime.          │
  │  Solução: O esbuild inlineia o shared no bundle (via resolve plugin    │
  │           em scripts/build-api.mjs). Se mudar a estrutura do shared,   │
  │           atualize o plugin.                                           │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ PROBLEMA: Inputs/selects do admin com texto invisível ───────────────┐
  │                                                                          │
  │  Sintoma: No painel admin (/admin/*), o texto de inputs, textareas e    │
  │  selects não aparece — só fica visível ao passar o mouse.              │
  │                                                                          │
  │  Causa: O body global tem `text-paper` (claro). Os form elements do     │
  │  admin usam `bg-paper` (claro) mas herdam `text-paper`, criando texto  │
  │  claro sobre fundo claro. O dropdown nativo dos `<select>` também      │
  │  herda cores escuras do tema do sistema.                               │
  │                                                                          │
  │  Solução: Adicionar `text-ink` em todos os `<input>`, `<textarea>` e    │
  │  `<select>` do admin. Para os dropdowns nativos, CSS rule:             │
  │    .bg-cream select option { color: #0A0B0D; background: #F5F2ED; }    │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘

  ┌─ PROBLEMA: CORB warning no console do navegador ───────────────────────┐
  │                                                                          │
  │  Descrição: "Cross-Origin Read Blocking (CORB)"                         │
  │  Causa: Resposta de API cross-origin bloqueada pelo navegador.         │
  │  Impacto: Baixo — não afeta funcionalidade. Apenas um warning.         │
  │  Solução: Ajustar cabeçalhos CORS no plugin se necessário.             │
  │                                                                          │
  └──────────────────────────────────────────────────────────────────────────┘


================================================================================
  12. COMANDOS ÚTEIS
================================================================================

  npm run dev              → Desenvolvimento (web:5173 + api:3001)
  npm run build            → Build completo (shared → api → web)
  npm run build:web        → Build apenas frontend
  npm run build:api        → Build apenas backend (esbuild)
  npm run build:shared     → Build apenas shared (tsc)
  npm run format           → Prettier em todos os arquivos
  npm run format:check     → Verificar formatação
  npm run typecheck        → Verificar tipos (todos os workspaces)

  npx vercel deploy --prod → Deploy para produção
  npx vercel env add       → Adicionar variável de ambiente na Vercel
  npx vercel env ls prod   → Listar variáveis de ambiente

  curl https://projeto-sete.vercel.app/api/health  → Verificar API


================================================================================
  13. CONTATOS E REFERÊNCIAS
================================================================================

  Supabase Dashboard:    https://supabase.com/dashboard/project/twrohdescsfvgrghukkb
  Vercel Dashboard:     https://vercel.com/saudemodernas-projects/projeto-sete
  Resend Dashboard:     https://resend.com
  GitHub Repo:          https://github.com/adrianfam/projeto-sete

  Documentação:
    Fastify:     https://fastify.dev/docs/latest/
    Supabase JS: https://supabase.com/docs/reference/javascript
    Vercel:      https://vercel.com/docs
    Tailwind:    https://tailwindcss.com/docs

================================================================================
  FIM DA DOCUMENTAÇÃO
  Última atualização: Julho 2026 (v3 — admin visual overhaul + sidebar icons + mobile nav)
================================================================================
