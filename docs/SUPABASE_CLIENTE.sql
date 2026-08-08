-- ===========================================================================
-- Projeto Sete — Portal do Cliente (Fase 1)
-- Tabelas: clients, projects, project_files, project_events
-- Execute no SQL Editor do Supabase. Idempotente (IF NOT EXISTS / DROP TYPE).
-- Rode DEPOIS de SUPABASE_SCHEMA.sql e SUPABASE_RLS.sql (reusa is_admin()).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type client_type_enum as enum ('final', 'architect');
exception when duplicate_object then null; end $$;

do $$ begin
  create type client_status_enum as enum ('lead', 'active');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status_enum as enum (
    'analise', 'orcamento_enviado', 'medicao', 'fabricacao', 'transporte', 'montagem', 'finalizado'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- clients  (clientes finais e arquitetos — "sem compromisso")
-- ---------------------------------------------------------------------------
create table if not exists public.clients (
  id                uuid primary key default gen_random_uuid(),
  auth_user_id      uuid unique references auth.users(id) on delete cascade,
  client_type       client_type_enum not null default 'final',
  full_name         text not null,
  email             text,
  whatsapp          text,
  prefer_messages   boolean not null default false,
  -- Qualificação (cliente final)
  city              text,
  neighborhood      text,
  property_phase    text,               -- na_planta | em_obras | pronto_mobiliar | quero_reformar
  delivery_date     text,               -- mês/ano
  rooms             text[] not null default '{}',
  -- Arquiteto / Designer
  professional_reg  text,               -- CAU/CREA/ABD (campo livre)
  office_name       text,
  portfolio_url     text,
  annual_volume     text,
  -- CRM
  status            client_status_enum not null default 'lead',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_clients_auth_user on public.clients (auth_user_id);
create index if not exists idx_clients_type on public.clients (client_type, status);
create index if not exists idx_clients_email on public.clients (email);

-- ---------------------------------------------------------------------------
-- projects  (projetos do cliente, com arquiteto vinculado opcional)
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id            uuid primary key default gen_random_uuid(),
  client_id     uuid not null references public.clients(id) on delete cascade,
  architect_id  uuid references public.clients(id) on delete set null,
  title         text not null,
  status        project_status_enum not null default 'analise',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists idx_projects_client on public.projects (client_id);
create index if not exists idx_projects_architect on public.projects (architect_id);
create index if not exists idx_projects_status on public.projects (status);

-- ---------------------------------------------------------------------------
-- project_files  (PDFs técnicos, renders, contrato, manuais — bucket privado)
-- ---------------------------------------------------------------------------
create table if not exists public.project_files (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  name        text not null,
  path        text not null,
  file_type   text not null default 'documento',  -- documento|pdf_tecnico|render|contrato|manual
  mime_type   text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);
create index if not exists idx_project_files_project on public.project_files (project_id);

-- ---------------------------------------------------------------------------
-- project_events  (visitas técnicas: medição, montagem…)
-- ---------------------------------------------------------------------------
create table if not exists public.project_events (
  id            uuid primary key default gen_random_uuid(),
  project_id    uuid not null references public.projects(id) on delete cascade,
  title         text not null,
  scheduled_at  timestamptz not null,
  professional  text not null,
  notes         text,
  created_at    timestamptz not null default now()
);
create index if not exists idx_project_events_project on public.project_events (project_id, scheduled_at);

-- ---------------------------------------------------------------------------
-- contact_submissions: vínculo com o cliente (Fase 2 usa no histórico)
-- ---------------------------------------------------------------------------
alter table public.contact_submissions
  add column if not exists client_id uuid references public.clients(id) on delete set null;

-- ---------------------------------------------------------------------------
-- updated_at automático (reusa touch_updated_at do SUPABASE_SCHEMA.sql)
-- ---------------------------------------------------------------------------
do $$ begin
  create trigger trg_clients_touch before update on public.clients
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_projects_touch before update on public.projects
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Bucket privado client-files (acesso apenas via URL assinada pela API)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do nothing;

-- ===========================================================================
-- RLS (defesa em profundidade — a API usa service-role com checagem manual)
-- ===========================================================================
alter table public.clients        enable row level security;
alter table public.projects       enable row level security;
alter table public.project_files  enable row level security;
alter table public.project_events enable row level security;

-- clients: dono lê/edita o próprio; admin tudo
drop policy if exists "clients_owner_select" on public.clients;
create policy "clients_owner_select" on public.clients
  for select using (auth.uid() = auth_user_id or public.is_admin());

drop policy if exists "clients_owner_insert" on public.clients;
create policy "clients_owner_insert" on public.clients
  for insert with check (auth.uid() = auth_user_id or public.is_admin());

-- O dono edita o perfil, mas NÃO pode trocar o próprio status (só admin/CRM).
drop policy if exists "clients_owner_update" on public.clients;
create policy "clients_owner_update" on public.clients
  for update using (auth.uid() = auth_user_id or public.is_admin())
  with check (
    (auth.uid() = auth_user_id or public.is_admin())
    and (
      public.is_admin()
      or status = (select c.status from public.clients c where c.id = clients.id)
    )
  );

-- projects: dono do cliente, arquiteto vinculado ou admin
drop policy if exists "projects_access" on public.projects;
create policy "projects_access" on public.projects
  for all
  using (
    public.is_admin()
    or client_id in (select id from public.clients where auth_user_id = auth.uid())
    or architect_id in (select id from public.clients where auth_user_id = auth.uid())
  )
  with check (public.is_admin());

-- project_files: quem acessa o projeto acessa os arquivos
drop policy if exists "project_files_access" on public.project_files;
create policy "project_files_access" on public.project_files
  for all
  using (
    public.is_admin()
    or project_id in (
      select p.id from public.projects p
      where p.client_id in (select id from public.clients where auth_user_id = auth.uid())
         or p.architect_id in (select id from public.clients where auth_user_id = auth.uid())
    )
  )
  with check (public.is_admin());

-- project_events: idem
drop policy if exists "project_events_access" on public.project_events;
create policy "project_events_access" on public.project_events
  for all
  using (
    public.is_admin()
    or project_id in (
      select p.id from public.projects p
      where p.client_id in (select id from public.clients where auth_user_id = auth.uid())
         or p.architect_id in (select id from public.clients where auth_user_id = auth.uid())
    )
  )
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- client_inspirations  (Fase 3 — Pasta de Inspirações: favoritos do cliente
-- sobre portfolio_items e instagram_posts, estilo Pinterest)
-- ---------------------------------------------------------------------------
create table if not exists public.client_inspirations (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid not null references public.clients(id) on delete cascade,
  source_type text not null check (source_type in ('portfolio', 'instagram')),
  source_id   text not null,   -- id de portfolio_items ou instagram_posts
  note        text,            -- comentário opcional do cliente (ex.: "quero algo assim no closet")
  created_at  timestamptz not null default now()
);
create unique index if not exists uq_client_inspirations
  on public.client_inspirations (client_id, source_type, source_id);
create index if not exists idx_client_inspirations_client
  on public.client_inspirations (client_id, created_at desc);

-- Cliente autenticado lê os próprios orçamentos (defesa em profundidade —
-- a API usa service-role com checagem manual do auth_user_id).
drop policy if exists "client_own_budgets" on public.contact_submissions;
create policy "client_own_budgets" on public.contact_submissions
  for select using (
    client_id in (select id from public.clients where auth_user_id = auth.uid())
  );

-- ===========================================================================
-- Fase 3 — Inspirações (RLS: dono gerencia os próprios favoritos)
-- ===========================================================================
alter table public.client_inspirations enable row level security;

drop policy if exists "inspirations_owner" on public.client_inspirations;
create policy "inspirations_owner" on public.client_inspirations
  for all
  using (
    public.is_admin()
    or client_id in (select id from public.clients where auth_user_id = auth.uid())
  )
  with check (public.is_admin() or client_id in (select id from public.clients where auth_user_id = auth.uid()));

-- Pronto. Após rodar, rode SUPABASE_RLS.sql se ainda não tiver (is_admin()).
