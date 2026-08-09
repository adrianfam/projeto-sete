# Mapa de Rotas — Projeto Sete

> **Última atualização:** Julho/2026
> **Stack:** React Router DOM v6 (lazy + Suspense) | Fastify (/api prefix)

---

## Frontend (web/src/router.tsx)

Rotas públicas com `lazy()` + `Suspense` (code-splitting por página).
Layout raiz: `RootLayout` (Navbar + Footer + WhatsAppFloat).

| Path | Componente | Descrição |
|------|-----------|-----------|
| `/` | `Landing` | Hero → Sobre → Portfólio → Cases → Depoimentos → Estrutura → Instagram → Blog preview → Contato |
| `/portfolio` | `PortfolioList` | Grid com filtros por tipo (residencial/comercial/corporativo/especial) |
| `/portfolio/:slug` | `PortfolioDetail` | Detalhe do projeto |
| `/cases` | `CasesList` | Grid de estudos de caso com filtro por setor |
| `/cases/:slug` | `CaseDetail` | Detalhe do estudo de caso |
| `/blog` | `BlogList` | Grid de posts com filtro por tag |
| `/blog/:slug` | `BlogPostPage` | Artigo + comentários |
| `/sobre` | `SobrePage` | Sobre a empresa |
| `/contato` | `ContatoPage` | Formulário de contato + info |
| `/testimonials` | `TestimonialsPage` | Depoimentos completos |
| `/colaborador/login` | `PontoLogin` | Login do colaborador (matrícula + PIN) |
| `/colaborador/ponto` | `ColaboradorPonto` | Registrar ponto com combo seletor (entrada/almoco/saida) + timeline + GPS |
| `/colaborador/extrato` | `ColaboradorExtrato` | Extrato mensal dos próprios registros |
| `*` | `NotFound` | Página 404 |

> Rotas legadas (redirecionam para `/colaborador/*`): `/ponto/login`, `/ponto/registrar`, `/ponto/extrato`

### Admin (protegido por `<Protected>` — redireciona para /admin/login se não autenticado)

| Path | Componente | Descrição |
|------|-----------|-----------|
| `/admin/login` | `AdminLogin` | Login via Supabase Auth (email + senha) |
| `/admin` → `/admin/dashboard` | `AdminDashboard` | Métricas: posts, comentários, portfólio, mensagens |
| `/admin/blog` | `AdminBlog` | Lista de posts com status |
| `/admin/blog/new` | `BlogEditor` | Criar novo post (Markdown) |
| `/admin/blog/:id` | `BlogEditor` | Editar post existente |
| `/admin/portfolio` | `AdminPortfolio` | Lista de itens do portfólio |
| `/admin/portfolio/new` | `PortfolioEditor` | Novo item de portfólio |
| `/admin/portfolio/:id` | `PortfolioEditor` | Editar item |
| `/admin/cases` | `AdminCases` | Lista de estudos de caso |
| `/admin/cases/new` | `CaseStudyEditor` | Novo estudo de caso |
| `/admin/cases/:id` | `CaseStudyEditor` | Editar estudo de caso |
| `/admin/testimonials` | `AdminTestimonials` | CRUD inline de depoimentos |
| `/admin/instagram` | `AdminInstagram` | Galeria manual do Instagram |
| `/admin/comments` | `AdminComments` | Moderação de comentários (pending/approved/rejected/spam) |
| `/admin/contact` | `AdminContact` | Caixa de entrada do formulário de contato |
| `/admin/media` | `AdminMedia` | Gerenciamento de assets de mídia (upload ledger) |
| `/admin/employees` | `AdminEmployees` | CRUD de colaboradores + resumo "Hoje" (registros do dia) e atalho "Ver pontos" |
| `/admin/time-records` | `AdminTimeRecords` | Centro de controle: timeline visual, lista com GPS, filtro por período, corrigir/excluir registros, relatório mensal de horas, exportação CSV e alertas de pendências do dia |
| `*` | `NotFound` | 404 no admin |

---

## API (Fastify, prefixo `/api`)

### Públicos (sem autenticação)

| Método | Path | Query params | Descrição |
|--------|------|-------------|-----------|
| `GET` | `/health` | — | Health check + uptime |
| `GET` | `/portfolio` | `?category=&projectType=&featured=&limit=&offset=` | Lista pública de portfólio |
| `GET` | `/portfolio/:slug` | — | Detalhe do projeto |
| `GET` | `/cases` | `?limit=&offset=` | Lista pública de estudos de caso |
| `GET` | `/cases/:slug` | — | Detalhe do estudo de caso |
| `GET` | `/testimonials` | `?limit=` | Depoimentos publicados |
| `GET` | `/instagram` | `?limit=` | Galeria do Instagram |
| `GET` | `/blog` | `?page=&tag=&q=` | Blog paginado com filtro por tag e busca |
| `GET` | `/blog/:slug` | — | Artigo + comentários aprovados |
| `POST` | `/blog/:slug/comments` | — | Enviar comentário (honeypot, rate-limit 3/10min) |
| `POST` | `/contact` | — | Formulário de contato (honeypot, rate-limit 5/10min) |
| `GET` | `/sitemap.xml` | — | Sitemap dinâmico |
| `POST` | `/ponto/login` | — | Login do colaborador (matrícula + PIN, rate-limit 5/15min) |
| `GET` | `/ponto/status` | `Authorization: Bearer {employeeId}` | Status atual do colaborador (badge + label) |
| `GET` | `/ponto/records` | `?month=2026-07` | Extrato mensal de registros do colaborador |
| `POST` | `/ponto/register` | `x-employee-id` header | Registrar ponto (GPS obrigatório, anti-duplicata 30s) |

### Admin (Bearer JWT — `requireAdmin`)

| Método | Path | Descrição |
|--------|------|-----------|
| `GET` | `/auth/me` | Dados do admin logado |
| `GET` | `/admin/metrics` | Métricas do dashboard |
| `GET` | `/admin/contact?status=` | Mensagens de contato por status |
| `PATCH` | `/admin/contact/:id` | Atualizar status da mensagem |
| `GET/POST` | `/admin/blog` | CRUD blog |
| `GET/PATCH/DELETE` | `/admin/blog/:id` | CRUD blog |
| `GET/POST` | `/admin/portfolio` | CRUD portfólio |
| `GET/PATCH/DELETE` | `/admin/portfolio/:id` | CRUD portfólio |
| `GET/POST` | `/admin/cases` | CRUD estudos de caso |
| `GET/PATCH/DELETE` | `/admin/cases/:id` | CRUD estudos de caso |
| `POST/PATCH/DELETE` | `/testimonials/:id` | CRUD depoimentos |
| `POST/PATCH/DELETE` | `/instagram/:id` | CRUD posts do Instagram |
| `GET/PATCH/DELETE` | `/admin/comments/:id` | Moderação de comentários |
| `POST` | `/upload/sign` | URL assinada para upload de imagem (registra em media_assets) |
| `GET` | `/admin/metrics` | Métricas do dashboard (KPIs) |
| `GET/POST` | `/admin/employees` | CRUD de colaboradores (gera PIN) |
| `GET/PATCH` | `/admin/employees/:id` | Atualizar/resetar PIN de colaborador |
| `GET` | `/admin/time-records` | `?employee_id=&date_from=&date_to=&limit=` | Histórico de registros de ponto |
| `GET` | `/admin/time-records/daily` | Registros do dia atual (dashboard) |
| `PATCH` | `/admin/time-records/:id` | Corrigir registro (recordType e/ou recordedAt) |
| `DELETE` | `/admin/time-records/:id` | Excluir registro (batida errada/duplicada) |
| `GET/POST` | `/cron/daily-points` | Cron diário (18h BRT): verifica pendências de ponto e envia e-mail para `ADMIN_NOTIFY_EMAIL` (protegido por `CRON_SECRET` quando setada) |
| `GET` | `/admin/media` | Lista de assets de mídia (ledger) |
| `DELETE` | `/admin/media/:id` | Deletar asset (storage + ledger) |

---

### Schema do banco (Supabase)

| Tabela | Descrição |
|--------|-----------|
| `portfolio_categories` | Categorias de portfólio |
| `portfolio_items` | Projetos do portfólio |
| `case_studies` | Estudos de caso |
| `testimonials` | Depoimentos |
| `instagram_posts` | Galeria do Instagram (manual) |
| `blog_posts` | Artigos do blog (Markdown, tags, SEO) |
| `comments` | Comentários moderados (1 nível de aninhamento) |
| `contact_submissions` | Mensagens do formulário de contato |
| `admin_profiles` | Perfis de administradores (1:1 com auth.users) |
| `media_assets` | Ledger de uploads (opcional) |
| `employees` | Colaboradores internos (ponto eletrônico) |
| `time_records` | Registros de ponto (entrada, almoço, saída com GPS) |

DDL completa em: `docs/SUPABASE_SCHEMA.sql` + `docs/SUPABASE_RLS.sql`

---

### Upload de imagens (Supabase Storage)

Bucket público `media`: leitura pública, escrita via service-role.

Fluxo:
1. Frontend → `POST /api/upload/sign` (autenticado) → recebe `signedUrl` + `publicUrl`
2. Frontend → `PUT signedUrl` com o arquivo (upload direto no Storage)
3. Backend registra automaticamente o asset na tabela `media_assets` (path, bucket, url, mime_type, uploaded_by)
4. Frontend salva `publicUrl` no formulário

Implementado em: `web/src/components/admin/MediaUploader.tsx`
API: `api/_src/routes/upload.ts` / `api/_src/routes/admin.ts` (GET/DELETE media)
