# Mapa de Rotas — Projeto Sete

## Frontend (React Router v6 — `web/src/router.tsx`)
Rotas públicas com `lazy()` + `Suspense` (code-splitting). Layout raiz = `RootLayout` (Navbar + Footer + WhatsAppFloat).

| Path | Página | Seção |
|------|--------|-------|
| `/` | `pages/Landing` | Hero, Sobre, Portfólio, Cases, Depoimentos, Estrutura, Instagram, Blog preview, Contato |
| `/portfolio` | `pages/ComingSoon` → lista filtrada (Fase 1) | Portfólio |
| `/portfolio/:slug` | detalhe do projeto | |
| `/cases/:slug` | detalhe do estudo de caso | |
| `/blog` | lista paginada (Fase 2) | |
| `/blog/:slug` | artigo + comentários | |
| `/sobre` | Sobre | |
| `/contato` | Contato | |
| `*` | `pages/NotFound` | |

### Admin (protegido por `<Protected>`)
| Path | Página |
|------|--------|
| `/admin/login` | `AdminLogin` (Supabase Auth) |
| `/admin` → `/admin/dashboard` | `AdminDashboard` (métricas) |
| `/admin/blog[/new/:id]` | CRUD blog |
| `/admin/portfolio[/...]` | CRUD portfólio |
| `/admin/cases[/...]` | CRUD cases |
| `/admin/testimonials` | depoimentos |
| `/admin/instagram` | galeria |
| `/admin/comments` | moderação |
| `/admin/contact` | atendimento |

## API (Fastify, prefixo `/api` — `api/src/server.ts`)
### Públicos (sem auth)
| Método | Path | Notas |
|--------|------|-------|
| GET | `/health` | uptime |
| GET | `/portfolio` | `?category=&projectType=&featured=&limit=&offset=` |
| GET | `/portfolio/:slug` | |
| GET | `/cases` | |
| GET | `/cases/:slug` | |
| GET | `/testimonials` | |
| GET | `/instagram` | galeria manual |
| GET | `/blog` | `?page=&tag=&q=` |
| GET | `/blog/:slug` | + comentários aprovados |
| POST | `/blog/:slug/comments` | honeypot, rate-limit 3/10min |
| GET | `/comments/:postId` | aprovados |
| POST | `/contact` | honeypot, rate-limit 5/10min |
| GET | `/sitemap.xml` | dinâmico |

### Admin (Bearer JWT — `requireAdmin` / `adminGuard`)
| Método | Path |
|--------|------|
| GET | `/auth/me` |
| GET | `/admin/metrics` |
| POST/PATCH/DELETE | `/blog`, `/portfolio`, `/cases`, `/testimonials`, `/instagram` |
| GET/PATCH/DELETE | `/admin/comments/:id` |
| POST | `/upload/sign` |

## Supabase Storage
Bucket público `media`: leitura pública, escrita admin. Uploads passam por `/api/upload/sign` (URL assinada → PUT direto).
