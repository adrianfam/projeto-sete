-- ===========================================================================
-- Projeto Sete — Seed de conteúdo (ÍNDICE)
-- Execute APÓS SUPABASE_SCHEMA.sql e SUPABASE_RLS.sql.
-- ===========================================================================

-- ===========================================================================
-- 1. CATEGORIAS DE PORTFÓLIO
-- ===========================================================================
insert into public.portfolio_categories (slug, name, position) values
  ('residencial',  'Residencial',   1),
  ('comercial',    'Comercial',     2),
  ('corporativo',  'Corporativo',   3),
  ('especial',     'Especialidades',4)
on conflict (slug) do nothing;

-- ===========================================================================
-- 2. ARQUIVOS DE SEED DEDICADOS
--    Execute CADA ARQUIVO individualmente no SQL Editor do Supabase.
--    Eles usam ON CONFLICT, são seguros para re-execução.
-- ===========================================================================
--
--  📄 docs/SUPABASE_SEED_PORTFOLIO.sql     — 6 projetos premium
--  📄 docs/SUPABASE_SEED_CASES.sql          — 5 estudos de caso
--  📄 docs/SUPABASE_SEED_TESTIMONIALS.sql   — 8 depoimentos reais
--  📄 docs/SUPABASE_SEED_BLOG.sql           — 5 posts de blog completos
--
-- ===========================================================================
-- 3. INSTAGRAM (mantido aqui por ser simples)
-- ===========================================================================
insert into public.instagram_posts (caption, image_url, post_url, aspect_ratio, posted_at)
values
  ('Detalhe em marcenaria sob medida.',
   'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80',
   'https://www.instagram.com/_projetosete/', 'square', current_date),
  ('Ambientes que contam histórias.',
   'https://images.unsplash.com/photo-1618220179428-22790b461013?w=600&q=80',
   'https://www.instagram.com/_projetosete/', 'portrait', current_date - 1)
on conflict do nothing;

-- ===========================================================================
-- 4. ADMIN: Como tornar um usuário em ADMIN
-- ===========================================================================
-- 1. Crie o usuário em Authentication > Users (dashboard) ou via:
--      insert into auth.users (...) -> o painel é mais fácil.
-- 2. Pegue o `id` do usuário em auth.users e rode:
--      insert into public.admin_profiles (user_id, full_name, role)
--      values ('<USER_ID>', 'Felipe Amorim', 'admin')
--      on conflict (user_id) do update set role = 'admin';
-- Lembre-se de setar a senha no painel e, se quiser magic-link, ajustar Auth.
