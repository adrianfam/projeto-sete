# Plano — Portal do Cliente (`/cliente`) + CRM interno

> Status: **planejamento aprovado** (Fase 1 não iniciada)
> Última atualização: 2026-08-08

---

## 1. Visão geral

Criar uma **área do cliente** (`/cliente`) com cadastro "sem compromisso" em dois
fluxos (Cliente Final / Arquiteto) e um **hub pós-login** que muda conforme o
estágio de compra, além de um **painel administrativo** para a equipe gerenciar
clientes, projetos (linha do tempo), arquivos e visitas técnicas.

A proposta original (prompt de produto) foi validada e **refinada** para caber
na arquitetura existente e entregar valor em fases.

### Reaproveitamento do que já existe

| Peça | Já existe no projeto |
|---|---|
| "Área de orçamento nativa" | `/contato` (fluxo de orçamento) → `contact_submissions` + inbox no admin |
| Auth | Supabase Auth (e-mail/senha) + JWT verificado no servidor + RLS (padrão do admin) |
| Upload de arquivos | Bucket `media` + `MediaUploader` com URL assinada (`/upload/sign`) |
| E-mail | `mailer.ts` (Resend/SMTP) |
| Precedente de login leve | Ponto eletrônico (matrícula + PIN) — NÃO será usado aqui (ver decisões) |

---

## 2. Decisões fechadas

1. **Auth dos clientes: Supabase Auth (e-mail/senha)** — mesma infra do admin.
   O portal guarda PDFs de contrato e dados pessoais; segurança fraca não combina.
2. **Execução: faseada** — Fase 1 (núcleo) primeiro, resto depois.
3. **Pasta de Inspirações: reusar galerias existentes** (portfolio + instagram),
   sem criar catálogo novo de acabamentos no MVP.

---

## 3. Escopo por fase

### Fase 1 — Núcleo (PRÓXIMA)

**Cadastro `/cliente`** — tela divisora "Quem é você?" com fluxo por tipo:

- **Cliente Final:**
  - Nome completo
  - E-mail
  - WhatsApp (máscara + checkbox "Prefiro contato estritamente por mensagens")
  - Cidade e Bairro/Condomínio (qualificação regional)
  - Fase do imóvel (dropdown: Na planta / Em obras / Pronto para mobiliar / Quero reformar)
  - Previsão de entrega (Mês/Ano)
  - Cômodos de interesse (checkboxes: Cozinha, Closet, Sala, Banheiro, Home Office, Outros)

- **Arquiteto / Designer:**
  - Nome completo
  - Registro profissional (CAU/CREA/ABD — **campo livre**, sem validação externa)
  - Nome do escritório ou link do portfólio
  - Volume médio de projetos por ano (dropdown)
  - WhatsApp direto ou da equipe de especificação

**Hub do cliente (2 estágios):**

- **Lead (sem projeto):** bloco "Meus Orçamentos" (vazio na Fase 1; integra na
  Fase 2) + banner do Kit Experience.
- **Cliente ativo (com projeto criado pelo admin):**
  - Linha do tempo interativa por status (ex.: "Seu closet está em fabricação")
  - Central de downloads (PDFs executivos, renders em alta)
  - Card de próximos eventos (ex.: "Medição Técnica terça 11/08 às 14h com Marcos")

**Painel admin (novas páginas):**

- `AdminClients` — listar/criar/editar clientes finais e arquitetos; status lead/ativo.
- `AdminProjects` — criar projeto; **editar status pela linha do tempo**;
  **vincular arquiteto** ao cliente; **upload de arquivos** por projeto;
  **agendar visitas técnicas** (data + profissional responsável).

### Fase 2 — Orçamento integrado

- Integrar `contact_submissions` ao perfil do cliente (`client_id` na tabela).
- "Meus Orçamentos": histórico de simulações salvas + botão de revisão técnica.
- O cadastro pós-orçamento reaproveita nome/e-mail/telefone do envio.

### Fase 3 — Inspirações + Kit Experience

- Pasta de Inspirações: favoritos (Pinterest-style) sobre **portfolio + instagram**
  existentes (`client_inspirations`).
- Banner Kit Experience (amostras físicas via WhatsApp).

### Fase 4 — Polimento

- E-mails transacionais (status mudou, visita agendada, conta criada).
- Permissões finas, testes, a11y.

---

## 4. Modelo de dados (SQL novo)

Arquivos sugeridos: `docs/SUPABASE_CLIENTE.sql` (+ RLS no mesmo arquivo ou em `SUPABASE_CLIENTE_RLS.sql`).

```sql
create type client_type_enum   as enum ('final', 'architect');
create type client_status_enum as enum ('lead', 'active');
create type project_status_enum as enum (
  'analise', 'orcamento_enviado', 'medicao', 'fabricacao', 'transporte', 'montagem', 'finalizado'
);

-- clients
--   id uuid pk, auth_user_id uuid unique → auth.users(id) on delete cascade,
--   client_type client_type_enum not null,
--   full_name, email (unique), whatsapp, prefer_messages bool default false,
--   city, neighborhood, phase (text), delivery_date (text), rooms text[] default '{}',
--   professional_reg, office_name, portfolio_url, annual_volume,   -- arquiteto
--   status client_status_enum default 'lead',
--   created_at, updated_at

-- projects
--   id uuid pk, client_id → clients(id) on delete cascade,
--   architect_id → clients(id) on delete set null,   -- vínculo arq. ↔ cliente
--   title text not null, status project_status_enum default 'analise',
--   notes text, created_at, updated_at

-- project_files
--   id uuid pk, project_id → projects(id) on delete cascade,
--   name, path (storage), file_type text default 'documento',
--   -- tipos: documento | pdf_tecnico | render | contrato | manual
--   uploaded_by → auth.users(id) on delete set null, created_at

-- project_events
--   id uuid pk, project_id → projects(id) on delete cascade,
--   title text not null, scheduled_at timestamptz not null,
--   professional text not null, notes text, created_at

-- contact_submissions: adicionar coluna client_id → clients(id) on delete set null
```

### Storage

- Bucket privado **`client-files`**.
- Acesso **somente via URL assinada** gerada pela API (padrão do bucket `media`),
  com checagem de autorização (dono do projeto / arquiteto vinculado / admin).
- Sem políticas públicas de leitura.

### RLS (resumo)

- `clients`: dono (`auth.uid() = auth_user_id`) lê/edita o próprio; admin lê tudo.
- `projects`, `project_files`, `project_events`: acesso via vínculo —
  cliente dono, **arquiteto vinculado**, ou admin (padrão `is_admin()` já usado).
- Helpers: `public.is_admin()` e `public.can_access_project(project_id)`.

---

## 5. Rotas de API

### `/api/cliente/*` (autenticado com JWT do usuário)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/cliente/signup` | Cria usuário Supabase (e-mail/senha) — via client anon ou admin API |
| POST | `/cliente/profile` | Cria/atualiza o registro em `clients` a partir do JWT |
| GET | `/cliente/me` | Perfil + tipo + estágio (lead/active) |
| GET | `/cliente/projects` | Projetos do usuário (dono ou arquiteto vinculado) + próximo evento |
| GET | `/cliente/projects/:id/files` | Lista de arquivos do projeto |
| GET | `/cliente/files/:id/sign` | URL assinada de download |
| GET | `/cliente/events` | Próximos eventos dos projetos do usuário |

### `/api/admin/*` (extensões)

| Método | Rota | Descrição |
|---|---|---|
| GET/POST/PATCH | `/admin/clients` | Listar/criar/editar clientes (inclui tipo, status, arquiteto) |
| GET/POST/PATCH | `/admin/projects` | CRUD de projetos + status + `architect_id` |
| POST/DELETE | `/admin/projects/:id/files` | Registrar/remover arquivo (upload assinado) |
| POST/DELETE | `/admin/projects/:id/events` | Agendar/remover visitas técnicas |

---

## 6. Frontend

- Rotas novas sob `/cliente`: login, cadastro (fluxo duplo), hub.
  - `ClienteLayout` (padrão do `ColaboradorLayout`) + guarda `ClienteProtected`.
- Páginas admin novas: `AdminClients`, `AdminProjects` (timeline editor, arquivos,
  eventos) — dentro do `AdminLayout` existente.
- Navbar: link "Área do Cliente".
- Reuso: `MediaUploader` (adaptado para `client-files`), `AdminLayout`, `cn`,
  componentes de UI e tema dark.

---

## 7. Ordem de implementação (checklist Fase 1)

1. [ ] Schema SQL + RLS (`docs/SUPABASE_CLIENTE.sql`) + bucket `client-files`
2. [ ] Schemas Zod no `shared` (client, project, event, file)
3. [ ] API: rotas `/cliente/*` (auth JWT) e extensões `/admin/*`
4. [ ] Front: auth do cliente (login/cadastro) + `ClienteProtected` + hub (2 estágios)
5. [ ] Páginas admin: clientes + projetos (timeline/arquivos/eventos)
6. [ ] Navbar + rotas no `router.tsx`
7. [ ] **Validação:** build, typecheck, teste de fluxo completo
   (cadastro → admin cria projeto → cliente vê timeline → admin agenda visita)
8. [ ] Deploy no Vercel + commit/push

---

## 8. Pendências / itens em aberto

- [ ] Confirmar se a **confirmação de e-mail** do Supabase está habilitada —
      afeta o cadastro "sem compromisso" (link de confirmação vs. login imediato).
- [ ] Decidir se o admin também cria contas de cliente (recomendado: sim, para
      ativação por telefone/WhatsApp).
- [ ] Fase 2: reaproveitamento dos dados do `contact_submissions` no cadastro.
