-- ===========================================================================
-- Projeto Sete — Seed de conteúdo (EXEMPLO).
-- Execute APÓS SUPABASE_SCHEMA.sql e SUPABASE_RLS.sql.
-- Substitua os placeholders de imagem por URLs reais do Storage posteriormente.
-- ===========================================================================

-- ---------- Categorias de portfólio ----------
insert into public.portfolio_categories (slug, name, position) values
  ('residencial',  'Residencial',   1),
  ('comercial',    'Comercial',     2),
  ('corporativo',  'Corporativo',   3),
  ('especial',     'Especialidades',4)
on conflict (slug) do nothing;

-- ---------- Portfólio ----------
insert into public.portfolio_items
  (title, slug, summary, project_type, location, year, area_m2, is_published, is_featured, published_at, position)
values
  ('Cobertura Beira-Mar', 'cobertura-beira-mar',
   'Integrando estar, gourmet e mar em um único ambiente planejado.',
   'residencial', 'Praia de Iracema, Fortaleza', 2024, 220.0, true, true, now(), 1),
  ('Escritório de Advocacia', 'escritorio-advocacia',
   'Marcenaria corporativa com estética atemporal e alta durabilidade.',
   'corporativo', 'Aldeota, Fortaleza', 2023, 180.0, true, false, now(), 2),
  ('Apartamento CASACOR', 'apartamento-casacor',
   'Ambiente autoral apresentado em edição da CASACOR Ceará.',
   'residencial', 'Casa Cor Ceará', 2022, 120.0, true, true, now(), 3)
on conflict (slug) do nothing;

-- ---------- Estudos de caso ----------
insert into public.case_studies
  (title, slug, client, category, challenge, process,
   results, is_published, published_at)
values
  ('Cobertura Beira-Mar', 'cobertura-beira-mar',
   'Confidencial', 'Residencial alto padrão',
   'Aproveitar a vista do mar sem sacrificar a organização e o armazenamento.',
   'Estudo de layout, marcenaria sob medida em madeira freijó e lâminas naturais.',
   '[{"metric":"3 ambientes","label":"integrados em um único fluxo"},{"metric":"100%","label":"sob medida"}]'::jsonb,
   true, now()),
  ('Loja Conceito', 'loja-conceito',
   'Confidencial', 'Comercial varejo',
   'Britar visual de marca em móveis que suportam alto fluxo de público.',
   'Estruturas em MDF naval, ferragens premium e iluminação integrada.',
   '[{"metric":"+40%","label":"tempo de exposição otimizado"},{"metric":"15 anos","label":"durabilidade projetada"}]'::jsonb,
   true, now())
on conflict (slug) do nothing;

-- ---------- Depoimentos ----------
insert into public.testimonials (author, role, company, quote, rating, is_published, position)
values
  ('Arq. Mariana Lima', 'Arquiteta de Interiores', 'Estúdio ML',
   'A Projeto Sete entrega o que promete. Acabamento impecável e prazos respeitados — uma parceria que recomendo.',
   5, true, 1),
  ('Rodrigo Vasconcelos', 'Incorporador', 'Grupo Horizonte',
   'Em todos os lançamentos que entregamos, a marcenaria da Projeto Sete foi o detalhe que encantou os clientes.',
   5, true, 2)
on conflict do nothing;

-- ---------- Instagram ----------
insert into public.instagram_posts (caption, image_url, post_url, aspect_ratio, posted_at)
values
  ('Detalhe em marcenaria sob medida.', '/imagens/logo-primary.jpeg',
   'https://www.instagram.com/_projetosete/', 'square', current_date),
  ('Ambientes que contam histórias.', '/imagens/logo-secondary.jpeg',
   'https://www.instagram.com/_projetosete/', 'portrait', current_date - 1)
on conflict do nothing;

-- ---------- Blog ----------
insert into public.blog_posts (title, slug, excerpt, body, reading_minutes, tags, is_published, published_at,
   author, seo)
values
  ('Marcenaria sob medida: o que considerar em 2025', 'marcenaria-sob-medida-2025',
   'Tendências, materiais e ferragens que elevam o resultado final de um projeto planejado.',
   'A marcenaria sob medida deixou de ser apenas funcional para se tornar parte da identidade dos ambientes. Em 2025, três pontos merecem atenção...

## Materiais
Madeiras como freijó e carvalho continuam em alta, agora combinadas a lâminas naturais.

## Ferragens
Ferragens premium — com amortecimento e soft-close — são hoje item obrigatório em projetos de alto padrão.

## Integração
Iluminação embutida e segurança embutida nos móveis ampliam a percepção de cuidado.',
   3, '{marcenaria,tendências,projetos}'::text[], true, now(),
   'Felipe Amorim', '{"title":"Marcenaria sob medida 2025","description":"Tendências em móveis planejados."}'::jsonb)
on conflict (slug) do nothing;

-- ---------- Como tornar um usuário em ADMIN ----------
-- 1. Crie o usuário em Authentication > Users (dashboard) ou via:
--      insert into auth.users (...) -> o painel é mais fácil.
-- 2. Pegue o `id` do usuário em auth.users e rode:
--      insert into public.admin_profiles (user_id, full_name, role)
--      values ('<USER_ID>', 'Felipe Amorim', 'admin')
--      on conflict (user_id) do update set role = 'admin';
-- Lembre-se de setar a senha no painel e, se quiser magic-link, ajustar Auth.
