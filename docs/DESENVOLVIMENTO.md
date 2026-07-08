# Projeto Sete — Documento de Desenvolvimento

> Site institucional premium + CMS administrativo para **Projeto Sete — Móveis Planejados e Marcenaria**.
> Stack: Vite + React 18, Fastify (Node), Supabase (Postgres + Auth + Storage), GitHub, Vercel.

---

## 0. Contexto

A Projeto Sete opera há mais de 15 anos (desde 2009) no mercado de móveis sob medida de
alto padrão em Fortaleza, atendendo as classes A e B com referências em CASACOR e ForMóbile.
Este projeto entrega uma presença digital à altura do posicionamento da marca: uma landing
page cinematográfica e atemporal que posiciona a marca como referência em marcenaria de luxo,
e um CMS interno para que a equipe gerencie portfólio, estudos de caso, depoimentos, blog,
galeria do Instagram (manual) e moderação de comentários — sem depender de desenvolvedor
para cada alteração de conteúdo.

A pasta do projeto iniciou vazia, contendo apenas `imagens/logodaempresa.jpeg`
(1080×1080) e `imagens/logodaempresa2.jpeg` (184×169), que servem de base para a
identidade visual (logotipo escuro/elegante → paleta de charcoal + madeira/latão).

---

## 1. Dados da Empresa (fonte única de verdade)

| Item | Valor |
|------|-------|
| Marca | Projeto Sete — Móveis Planejados e Marcenaria |
| Proprietário/CEO | Felipe Amorim |
| Instagram | `@_projetosete` (https://www.instagram.com/_projetosete/) |
| Endereço | Rua Capitão Clóvis Maia, 759 — Alto da Balança, Fortaleza — CE, 60851-000 |
| Telefone | (85) 99816-2777 |
| WhatsApp (intl) | `5585998162777` (para `wa.me`) |
| E-mail | projetosete.gerencia@gmail.com |
| Horário | Segunda a Sexta, 08:00 — 17:00 |
| Fundação | 2009 |

Estes valores ficam centralizados em `shared/src/constants/brand.ts` e são consumidos
pelo footer, contato, SEO (JSON-LD `LocalBusiness`) e botões de WhatsApp.

---

## 2. Decisões de Arquitetura

- **Monorepo** com npm workspaces: `web/` (frontend), `api/` (backend), `shared/`
  (schemas Zod + constantes + tipos, reaproveitados pelos dois).
- **Frontend:** Vite + React 18 + TypeScript, Tailwind CSS, Framer Motion,
  React Router DOM v6, Zustand, React Hook Form + Zod.
- **Backend:** **Fastify** (em vez de Express) — validação de schema nativa
  com AJV, cold-start mais rápido (importante em serverless), logger embutido,
  encapsulamento por plugin. Deploy como **Serverless Functions na Vercel**
  (não servidor longo-running): o tráfego é baixo/médio e todo o trabalho é
  request/response (CRUD + envio de e-mail).
- **Dados/Auth/Storage:** Supabase (Postgres + Auth + Storage).
- **Instagram:** galeria **manual** alimentada no Supabase (evita a Graph API,
  que exige conta business do IG + revisão de app no Meta).
- **Deploy:** um único projeto Vercel na raiz do repo, com `web/` como build
  e `/api/*` reescrito para o adaptador Fastify → deploys atômicos.
- **Versionamento:** Git + GitHub (CI no `.github/workflows/ci.yml`).

---

## 3. Estrutura de Pastas

```
projeto-sete/
├─ .github/workflows/ci.yml
├─ .editorconfig  .gitignore  .prettierrc  .prettierignore
├─ .nvmrc                         # 20 (LTS)
├─ package.json                   # raiz: workspaces + scripts
├─ README.md                      # inglês
├─ LEIA-ME.md                     # pt-BR para o cliente
├─ .env.example
├─ docs/                          # esta pasta + SQL + guias
├─ shared/                        # @projeto-sete/shared
│  ├─ package.json
│  └─ src/{schemas,constants,types}/
├─ web/                           # Vite + React → Vercel
│  ├─ package.json vite.config.ts tailwind.config.ts tsconfig*.json
│  ├─ index.html
│  ├─ public/{favicon.svg,robots.txt,manifest.webmanifest,og-default.webp,imagens/}
│  ├─ vercel.json
│  └─ src/{main.tsx,App.tsx,router.tsx,styles,lib,store,providers,hooks,
│        features,components,pages,routes}/
└─ api/                           # Fastify → Vercel Serverless
   ├─ package.json tsconfig.json vercel.json .envrc.example
   └─ src/{server.ts,index.ts,plugins,lib,routes,schemas}/
```

---

## 4. Schema do Supabase

Tabelas: `portfolio_categories`, `portfolio_items`, `case_studies`,
`testimonials`, `instagram_posts`, `blog_posts`, `comments`,
`contact_submissions`, `admin_profiles` (1:1 com `auth.users`),
`media_assets`. UUIDs, `timestamptz`, soft-delete via `deleted_at`.

**RLS (resumo):** leitura pública onde `is_published = true`; `comments`
com `INSERT` anônimo + leitura só das `approved`; `contact_submissions`
com `INSERT` anônimo apenas; admin (`auth.uid()` em `admin_profiles`) tem
CRUD total; buckets de Storage com leitura pública e escrita só via
service-role (chave **nunca** exposta ao frontend — uploads passam por
`/api/upload/sign`, que devolve uma URL assinada para PUT direto).

As DDL completas ficam em `docs/SUPABASE_SCHEMA.sql` e
`docs/SUPABASE_RLS.sql`.

---

## 5. Mapa de Rotas

### Frontend (React Router v6, lazy + code-split)

- `/` Landing (Hero, Sobre, Portfólio, Estudos de Caso, Depoimentos, Estrutura, Instagram, Blog preview, Contato)
- `/portfolio`, `/portfolio/:slug`, `/cases/:slug`
- `/blog`, `/blog/:slug` (artigo + comentários)
- `/contato`, `/sobre` (âncoras na landing + rotas próprias)
- `/admin/login`, `/admin` (layout) → `/admin/dashboard`, `/admin/blog[/new|/:id]`,
  `/admin/portfolio[/new|/:id]`, `/admin/cases[/new|/:id]`, `/admin/testimonials`,
  `/admin/instagram`, `/admin/comments`, `/admin/contact`
- `*` NotFound

### API (Fastify, prefixo `/api`, na Vercel)

- Públicos: `GET /health`, `POST /contact` (rate-limited), `GET /portfolio`,
  `GET /portfolio/:slug`, `GET /cases`, `GET /cases/:slug`, `GET /testimonials`,
  `GET /instagram`, `GET /blog` (`?page=&tag=&q=`), `GET /blog/:slug`,
  `POST /blog/:slug/comments` (rate-limited + honeypot), `GET /sitemap.xml`
- Admin (Bearer JWT verificado com `SUPABASE_JWT_SECRET`): `GET /auth/me`,
  CRUD de `/blog`, `/portfolio`, `/cases`, `/testimonials`, `/instagram`,
  `GET/PATCH/DELETE /admin/comments/:id`, `POST /upload/sign`,
  `GET /admin/metrics`

---

## 6. Design System — "Marcenaria sofisticada, atemporal"

Mood CASACOR: fundos arquitetônicos escuros e muted; acentos quentes de
madeira/latão; tipografia serif editorial nos títulos + sans suíça no corpo;
espaço negativo generoso; animações contidas (nada de bounce).

**Paleta (Tailwind `theme.extend.colors`):**
`ink #0E0F11`, `charcoal #15171A`, `graphite #23262B`, `smoke #6B7075`,
`mist #B6BBBB`, `paper #F6F3EE`, `cream #EFE9DF`, `wood #6B4A2B`,
`brass #B08342` (único acento — régua de eyebrow, underlines de link,
borda de CTA, focus ring), `brass-soft #D9B984`, `clay #8A4A2D`,
`sage #4F5D4F`. Erro `#8E2A2A`, sucesso `#2E5D45`.

**Tipografia:** títulos **Fraunces** (serif variável, óptica) + corpo **Inter**.
Eyebrows em sans uppercase `tracking-[0.2em] text-brass`.

**Movimento (Framer Motion):** `whileInView` `viewport={{once:true, amount:0.3}}`,
duração 0.5–0.8s, easing `[0.22,1,0.36,1]`; `MotionProvider` desativa transforms
sob `prefers-reduced-motion` (mantém só fade).

**Imagens:** WebP, `aspect-ratio` travado para evitar CLS, LQIP blur-up.
Cards separados por linha (não sombra) — superfícies matte.

**A11y/SEO embutidos:** `Seo` emite title/description/canonical/OG/Twitter
+ JSON-LD `LocalBusiness` com endereço/geo/phone/horário e `sameAs` IG; sitemap
dinâmico via API; `robots.txt` libera tudo, bloqueia `/admin`.

---

## 7. Arquivos de Configuração

- Raiz: `package.json` (workspaces `["web","api","shared"]` + scripts
  `dev/dev:web/dev:api/build/lint/format/typecheck/test`), `.prettierrc`
  (semi off, singleQuote, printWidth 100, plugin tailwind), ESLint flat,
  `.editorconfig`, `.nvmrc` = `20`.
- `web/vite.config.ts`: React plugin, aliases `@/` e `@projeto-sete/shared`,
  `manualChunks` para vendor, `assetsInclude: ['**/*.webp']`.
- `web/tailwind.config.ts`: paleta + fontes + container + `screens` mobile-first.
- `web/vercel.json` + `api/vercel.json` (rewrite `/api/*` → adaptador Fastify).
- `.env.example` (Supabase URL/keys, JWT secret, Maps, WhatsApp, SMTP/Resend, MAIL_FROM, ADMIN_NOTIFY_EMAIL) — chaves reais **nunca** commitadas.
- `.github/workflows/ci.yml`: lint, typecheck, test, build.

---

## 8. Ordem de Build

**Fase 0 — Fundações:** git init, monorepo/configs, scaffold Vite+React e
Fastify, criar projeto Supabase + rodar SQL, criar admin em Auth, seed de
conteúdo (3 portfólios, 2 cases, 2 depoimentos, 2 blog posts, alguns IG).

**Fase 1 — Landing MVP:** RootLayout + Navbar (transparente no hero) +
Footer, `Seo`, processar logos p/ WebP em `public/imagens/`, Hero, Sobre,
Portfólio (1º slice ponta-a-ponta: DB → API → UI → SEO valida a stack),
Cases, Depoimentos, Estrutura, Instagram, Blog preview, Contato. Polish:
scroll reveals, focus, LQIP, reduced-motion, Lighthouse >90.

**Fase 2 — Blog + Comentários:** `/blog` (paginado/filtro de tag/busca),
`/blog/:slug` (markdown + JSON-LD Article), `CommentForm` + árvore +
`/api/blog/:slug/comments` com honeypot + rate-limit + validação Zod.

**Fase 3 — Admin CMS:** login Supabase (`signInWithPassword`) + `authStore`
Zustand persistido + `<Protected>`, AdminLayout sidebar, Dashboard de
métricas, editores um recurso por vez (Read→Create→Update→Delete): Blog →
Portfólio → Cases → Depoimentos → Instagram → Comentários → Atendimento.
`MediaUploader` via `/api/upload/sign` (PUT direto no Storage). Validar
RLS: anon lê publicado; editor escreve; anon não escreve.

**Fase 4 — Hardening & Launch:** sitemap dinâmico, OG image por post,
canonicals, Lighthouse + axe, deploy Vercel + envs + domínio, smoke tests
e checklist de go-live.

---

## 9. Riscos / Decisões a Confirmar (com o cliente)

| # | Item | Decisão | Impacto |
|---|------|---------|---------|
| 1 | Projeto Supabase criado + keys (anon, service-role, JWT secret) | Confirmar | Crítico |
| 2 | Domínio `projetosete.com.br` (registradora + DNS) | Confirmar | Alto |
| 3 | Google Maps Embed API key (com referrer restrito + billing) | Confirmar | Alto |
| 4 | E-mail do formulário: **Resend** (recomendado) vs SMTP/Gmail | Definir | Alto |
| 5 | Vídeos no Supabase Storage vs embeds YouTube/Vimeo (limite free tier 1GB/2GB egress) | Recomendo embeds YouTube c/ thumbnail | Alto |
| 6 | Auth email/senha vs magic-link | Confirmar | Médio |
| 7 | i18n pt-BR apenas (sem EN)? | Provavelmente sim | Médio |
| 8 | Consentimento p/ uso de nome/foto do Felipe Amorim | Confirmar | Médio |

---

## 10. Verificação End-to-End (local)

```bash
cp .env.example .env          # preencher Supabase + Maps
npm install                   # raiz — linka workspaces
npm run dev                   # web:5173 + api:3001 em paralelo
```

**Smoke checks:** `curl /api/health` → 200; `curl /api/portfolio` → seed;
hero + scroll reveals no navegador; filtros de portfólio sem reload;
formulário inválido → erro Zod; válido → linha em `contact_submissions` +
e-mail; login admin → dashboard; criar post → aparece em `/blog`;
comentário → `pending` → aprovar no admin → público; `401` ao tentar
escrever como anon; `lint && typecheck && test` verdes; `build:web` +
Lighthouse ≥ 90; scan axe sem violações críticas; `vercel link` + `vercel env pull` + preview.

**Critérios de "pronto":** 8 seções da landing vivas; ≥1 filtro de
portfólio por categoria; 1 post publicado com 1 comentário aprovado + 1
pendente; sessão admin persiste; Lighthouse ≥ 90; a11y limpa; sitemap
acessível; robots permite público e bloqueia `/admin`.

---

## 11. Arquivos Críticos

- `package.json` (raiz) — workspaces + scripts.
- `docs/SUPABASE_SCHEMA.sql` + `docs/SUPABASE_RLS.sql` — modelo de dados.
- `shared/src/schemas/*.ts` — contratos Zod reaproveitados por API e forms.
- `web/src/router.tsx` — árvore de rotas pública + admin + boundaries de code-split.
- `api/src/server.ts` — composição Fastify (cors, rate-limit, supabase-admin,
  errorHandler, registro de rotas) exportada pelo adaptador Vercel.
- `shared/src/constants/brand.ts` — dados da empresa (fonte única).
