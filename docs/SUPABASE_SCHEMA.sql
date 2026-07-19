-- ===========================================================================
-- Projeto Sete — Schema do banco (PostgreSQL / Supabase)
-- Execute no SQL Editor do Supabase. Idempotente (usa IF NOT EXISTS / DROP TYPE).
-- ===========================================================================

-- Extensão para UUIDv4
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type project_type_enum as enum ('residencial','comercial','corporativo','especial');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comment_status_enum as enum ('pending','approved','rejected','spam');
exception when duplicate_object then null; end $$;

do $$ begin
  create type admin_role_enum as enum ('admin','editor');
exception when duplicate_object then null; end $$;

do $$ begin
  create type aspect_ratio_enum as enum ('square','portrait','landscape');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- portfolio_categories
-- ---------------------------------------------------------------------------
create table if not exists public.portfolio_categories (
  id        uuid primary key default gen_random_uuid(),
  slug      text unique not null,
  name      text not null,
  position  int  not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- portfolio_items
-- ---------------------------------------------------------------------------
create table if not exists public.portfolio_items (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text unique not null,
  summary        text,
  description    text,
  category_id    uuid references public.portfolio_categories(id) on delete set null,
  project_type   project_type_enum,
  location       text,
  year           int,
  area_m2        numeric(8,2),
  media          jsonb not null default '[]'::jsonb,
  cover_image_url text,
  is_featured    boolean not null default false,
  is_published   boolean not null default false,
  published_at   timestamptz,
  position       int not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
create index if not exists idx_portfolio_published
  on public.portfolio_items (is_published, position)
  where deleted_at is null;
create index if not exists idx_portfolio_type
  on public.portfolio_items (project_type)
  where deleted_at is null and is_published = true;

-- ---------------------------------------------------------------------------
-- case_studies
-- ---------------------------------------------------------------------------
create table if not exists public.case_studies (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  slug           text unique not null,
  client         text,
  category       text,
  challenge      text,
  process        text,
  results        jsonb not null default '[]'::jsonb,
  gallery        jsonb not null default '[]'::jsonb,
  cover_image_url text,
  is_published   boolean not null default false,
  featured       boolean not null default false,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);
create index if not exists idx_cases_published
  on public.case_studies (is_published, published_at desc)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- testimonials
-- ---------------------------------------------------------------------------
create table if not exists public.testimonials (
  id           uuid primary key default gen_random_uuid(),
  author       text not null,
  role         text,
  company      text,
  quote        text not null,
  rating       smallint not null default 5 check (rating between 1 and 5),
  avatar_url   text,
  is_published boolean not null default false,
  position     int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- instagram_posts  (galeria MANUAL — não usa Graph API)
-- ---------------------------------------------------------------------------
create table if not exists public.instagram_posts (
  id          uuid primary key default gen_random_uuid(),
  caption     text,
  image_url   text not null,
  post_url    text,
  aspect_ratio aspect_ratio_enum not null default 'square',
  is_published boolean not null default true,
  posted_at   date not null default current_date,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- blog_posts
-- ---------------------------------------------------------------------------
create table if not exists public.blog_posts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text unique not null,
  excerpt         text,
  body            text not null,
  cover_image_url text,
  cover_alt       text,
  reading_minutes int,
  tags            text[] not null default '{}',
  author          text not null default 'Felipe Amorim',
  author_avatar_url text,
  is_published    boolean not null default false,
  is_featured     boolean not null default false,
  published_at    timestamptz,
  seo             jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists idx_blog_published
  on public.blog_posts (is_published, published_at desc)
  where deleted_at is null;
create index if not exists idx_blog_tags on public.blog_posts using gin (tags);

-- ---------------------------------------------------------------------------
-- comments  (moderados, 1 nível de aninhamento via parent_id)
-- ---------------------------------------------------------------------------
create table if not exists public.comments (
  id            uuid primary key default gen_random_uuid(),
  blog_post_id  uuid not null references public.blog_posts(id) on delete cascade,
  parent_id     uuid references public.comments(id) on delete cascade,
  author_name   text not null,
  author_email  text not null,
  body          text not null,
  status        comment_status_enum not null default 'pending',
  ip            inet,
  user_agent    text,
  created_at    timestamptz not null default now(),
  moderated_at  timestamptz,
  moderated_by  uuid,
  deleted_at    timestamptz
);
create index if not exists idx_comments_post_status
  on public.comments (blog_post_id, status)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- contact_submissions  (caixa de entrada do formulário)
-- ---------------------------------------------------------------------------
create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text,
  message     text not null,
  ip          inet,
  user_agent  text,
  status      text not null default 'new',  -- new | read | replied | archived
  created_at  timestamptz not null default now()
);
create index if not exists idx_contact_status on public.contact_submissions (status, created_at desc);

-- ---------------------------------------------------------------------------
-- admin_profiles  (1:1 com auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.admin_profiles (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       admin_role_enum not null default 'editor',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- media_assets  (ledger opcional de uploads no Storage)
-- ---------------------------------------------------------------------------
create table if not exists public.media_assets (
  id          uuid primary key default gen_random_uuid(),
  path        text not null,
  bucket      text not null default 'media',
  url         text not null,
  mime_type   text,
  bytes       bigint,
  width       int,
  height      int,
  alt         text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at automático via trigger
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

do $$ begin
  create trigger trg_portfolio_touch before update on public.portfolio_items
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_cases_touch before update on public.case_studies
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_blog_touch before update on public.blog_posts
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

do $$ begin
  create trigger trg_testimonials_touch before update on public.testimonials
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Buckets de Storage (públicos p/ leitura; escrita controlada via RLS de storage)
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media','media', true)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- employees  (colaboradores internos para ponto eletrônico)
-- ---------------------------------------------------------------------------
do $$ begin
  create type time_record_type_enum as enum ('entrada','almoco_ida','almoco_volta','saida');
exception when duplicate_object then null; end $$;

create table if not exists public.employees (
  id          uuid primary key default gen_random_uuid(),
  matricula   int not null unique generated by default as identity (start with 1000 increment by 1),
  pin_hash    text not null,
  full_name   text not null,
  phone       text not null,
  role        text not null,
  birth_date  date not null,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.time_records (
  id            uuid primary key default gen_random_uuid(),
  employee_id   uuid not null references public.employees(id) on delete cascade,
  record_type   time_record_type_enum not null,
  latitude      double precision,
  longitude     double precision,
  recorded_at   timestamptz not null default now()
);
create index if not exists idx_time_records_employee
  on public.time_records (employee_id, recorded_at desc);
create index if not exists idx_time_records_date
  on public.time_records (recorded_at desc);

-- Trigger para updated_at em employees
do $$ begin
  create trigger trg_employees_touch before update on public.employees
    for each row execute function public.touch_updated_at();
exception when duplicate_object then null; end $$;

-- Pronto. Após rodar este arquivo, execute SUPABASE_RLS.sql.
