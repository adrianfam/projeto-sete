-- ===========================================================================
-- Projeto Sete — Row Level Security (RLS)
-- Execute APÓS SUPABASE_SCHEMA.sql no SQL Editor do Supabase.
-- ===========================================================================

-- Habilita RLS em todas as tabelas de conteúdo.
alter table public.portfolio_categories enable row level security;
alter table public.portfolio_items     enable row level security;
alter table public.case_studies        enable row level security;
alter table public.testimonials        enable row level security;
alter table public.instagram_posts     enable row level security;
alter table public.blog_posts          enable row level security;
alter table public.comments            enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.admin_profiles      enable row level security;
alter table public.media_assets        enable row level security;

-- ---------------------------------------------------------------------------
-- Helper: é admin? (auth.uid existe em admin_profiles)
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.admin_profiles
    where user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- PORTFOLIO CATEGORIES
-- ---------------------------------------------------------------------------
drop policy if exists "pub_read_categories" on public.portfolio_categories;
create policy "pub_read_categories" on public.portfolio_categories
  for select using (true);

drop policy if exists "admin_write_categories" on public.portfolio_categories;
create policy "admin_write_categories" on public.portfolio_categories
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- PORTFOLIO ITEMS
-- ---------------------------------------------------------------------------
drop policy if exists "pub_read_portfolio" on public.portfolio_items;
create policy "pub_read_portfolio" on public.portfolio_items
  for select using (is_published = true and deleted_at is null);

drop policy if exists "admin_all_portfolio" on public.portfolio_items;
create policy "admin_all_portfolio" on public.portfolio_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- CASE STUDIES
-- ---------------------------------------------------------------------------
drop policy if exists "pub_read_cases" on public.case_studies;
create policy "pub_read_cases" on public.case_studies
  for select using (is_published = true and deleted_at is null);

drop policy if exists "admin_all_cases" on public.case_studies;
create policy "admin_all_cases" on public.case_studies
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- TESTIMONIALS
-- ---------------------------------------------------------------------------
drop policy if exists "pub_read_testimonials" on public.testimonials;
create policy "pub_read_testimonials" on public.testimonials
  for select using (is_published = true);

drop policy if exists "admin_all_testimonials" on public.testimonials;
create policy "admin_all_testimonials" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- INSTAGRAM POSTS
-- ---------------------------------------------------------------------------
drop policy if exists "pub_read_instagram" on public.instagram_posts;
create policy "pub_read_instagram" on public.instagram_posts
  for select using (is_published = true);

drop policy if exists "admin_all_instagram" on public.instagram_posts;
create policy "admin_all_instagram" on public.instagram_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- BLOG POSTS
-- ---------------------------------------------------------------------------
drop policy if exists "pub_read_blog" on public.blog_posts;
create policy "pub_read_blog" on public.blog_posts
  for select using (is_published = true and deleted_at is null);

drop policy if exists "admin_all_blog" on public.blog_posts;
create policy "admin_all_blog" on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- COMMENTS
--   - anônimo pode INSERIR (sempre pending)
--   - anônimo pode LER apenas approved (de um post publicado)
--   - admin faz tudo
-- ---------------------------------------------------------------------------
drop policy if exists "pub_insert_comments" on public.comments;
create policy "pub_insert_comments" on public.comments
  for insert with check (true); -- validação de status/parent feita na API

drop policy if exists "pub_read_approved_comments" on public.comments;
create policy "pub_read_approved_comments" on public.comments
  for select
  using (
    (status = 'approved' and deleted_at is null)
    or public.is_admin()
  );

drop policy if exists "admin_all_comments" on public.comments;
create policy "admin_all_comments" on public.comments
  for all
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- CONTACT SUBMISSIONS  (anônimo só INSERT; nenhum SELECT público)
-- ---------------------------------------------------------------------------
drop policy if exists "pub_insert_contact" on public.contact_submissions;
create policy "pub_insert_contact" on public.contact_submissions
  for insert with check (true);

drop policy if exists "admin_all_contact" on public.contact_submissions;
create policy "admin_all_contact" on public.contact_submissions
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- ADMIN PROFILES  (cada usuário vê/edita a si; admin vê todos)
-- ---------------------------------------------------------------------------
drop policy if exists "owner_read_profile" on public.admin_profiles;
create policy "owner_read_profile" on public.admin_profiles
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "owner_update_profile" on public.admin_profiles;
create policy "owner_update_profile" on public.admin_profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Permite que um admin insira perfis para novos usuários.
drop policy if exists "admin_insert_profile" on public.admin_profiles;
create policy "admin_insert_profile" on public.admin_profiles
  for insert with check (public.is_admin() or user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- MEDIA ASSETS  (admin tudo; público leitura dos metadados)
-- ---------------------------------------------------------------------------
drop policy if exists "pub_read_media" on public.media_assets;
create policy "pub_read_media" on public.media_assets
  for select using (true);

drop policy if exists "admin_all_media" on public.media_assets;
create policy "admin_all_media" on public.media_assets
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- STORAGE  (bucket "media": leitura pública, escrita só admin)
-- ---------------------------------------------------------------------------
drop policy if exists "pub_read_media_bucket" on storage.objects;
create policy "pub_read_media_bucket" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "admin_write_media_bucket" on storage.objects;
create policy "admin_write_media_bucket" on storage.objects
  for insert with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "admin_update_media_bucket" on storage.objects;
create policy "admin_update_media_bucket" on storage.objects
  for update using (bucket_id = 'media' and public.is_admin());

drop policy if exists "admin_delete_media_bucket" on storage.objects;
create policy "admin_delete_media_bucket" on storage.objects
  for delete using (bucket_id = 'media' and public.is_admin());

-- Fim. Para criar o primeiro admin, veja SUPABASE_SEED.sql.
