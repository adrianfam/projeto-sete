-- ===========================================================================
-- Projeto Sete — Seed dos 5 Estudos de Caso Premium
-- Execute APÓS SUPABASE_SCHEMA.sql e SUPABASE_RLS.sql.
-- Os slugs correspondem aos dados estáticos em web/src/lib/caseStudiesData.ts
-- para que a página de detalhe encontre o conteúdo rico (solutions, concept).
-- ===========================================================================

-- ---------- 1. Áreas Sociais & Living Premium ----------
insert into public.case_studies
  (title, slug, client, category, challenge, process,
   results, gallery, cover_image_url, is_published, featured, published_at)
values
  ('Áreas Sociais & Living Premium', 'areas-sociais-living-premium',
   'CASACOR 2025', 'Living · Jantar · Hall · Residencial',
   'A marcenaria deixa de ser "armário" e passa a ser a própria parede da casa. O conceito de mimetização espacial permite que os ambientes sociais fluam sem barreiras visuais, onde cada elemento de marcenaria se integra à arquitetura como se sempre tivesse feito parte dela.',
   'Painéis Wood Skin: Revestimentos monolíticos que cobrem portas de passagem, quadros elétricos e pilares em uma única lâmina contínua de madeira nobre. A textura corre em veios paralelos que guiam o olhar e ampliam a percepção do espaço.

Nichos Escultóricos Iluminados: Rasgos na marcenaria com cantos curvos e iluminação micro-LED invisível — sem pontos de luz aparentes. A luz parece emergir da própria madeira, criando uma atmosfera sofisticada e acolhedora.

Divisórias Pivotantes Dinâmicas: Brises e painéis que giram 360° para integrar ou isolar o living conforme o uso. Em madeira maciça com ferragens ocultas, funcionam como esculturas funcionais que transformam o espaço em segundos.',
   '[{"metric":"100%","label":"aproveitamento da parede"},{"metric":"360°","label":"rotação dos painéis"},{"metric":"0","label":"puxadores aparentes"}]'::jsonb,
   '[
     {"url":"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80","alt":"Living premium com painéis wood skin"},
     {"url":"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80","alt":"Hall de entrada com marcenaria monolítica"},
     {"url":"https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80","alt":"Sala de jantar integrada ao living"}
   ]'::jsonb,
   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85',
   true, true, now() - interval '5 days')
on conflict (slug) do nothing;

-- ---------- 2. Cozinha Gourmet Oculta ----------
insert into public.case_studies
  (title, slug, client, category, challenge, process,
   results, gallery, cover_image_url, is_published, featured, published_at)
values
  ('Cozinha Gourmet Oculta', 'cozinha-gourmet-oculta',
   'ForMóbile 2025', 'Cozinha · Gourmet · Ilha · Residencial',
   'A cozinha "desaparece" quando não está em uso, integrando-se visualmente à sala. Este conceito de luxo silencioso permite que o espaço gourmet seja tão elegante quanto qualquer ambiente social, revelando sua funcionalidade apenas quando necessário.',
   'Portas Escamoteáveis de Grande Porte: Sistemas de ferragens italianas onde as portas da cozinha correm e entram nas laterais do armário, revelando bancadas e eletros apenas quando necessário. Quando fechadas, formam uma parede contínua de marcenaria.

Bancadas em Marcenaria Estrutural: Ilhas de madeira maciça tratada ou painéis ultra-resistentes ao calor e à umidade, conversando com tampos de pedras naturais. A madeira estrutural traz calor e sofisticação que o mármore sozinho não alcança.

Gavetários Touch-to-Open: Abertura por toque magnético e fechamento amortecido, eliminando 100% o uso de puxadores. A tecnologia embutida na marcenaria cria superfícies perfeitamente lisas e minimalistas.',
   '[{"metric":"100%","label":"puxadores eliminados"},{"metric":"15s","label":"para revelar a cozinha completa"},{"metric":"3cm","label":"folga técnica das portas escamoteáveis"}]'::jsonb,
   '[
     {"url":"https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80","alt":"Cozinha gourmet oculta com portas escamoteáveis"},
     {"url":"https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80","alt":"Ilha central em marcenaria estrutural"},
     {"url":"https://images.unsplash.com/photo-1600566753376-12c8ab7a4a7e?w=800&q=80","alt":"Detalhe dos gavetários touch-to-open"}
   ]'::jsonb,
   'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85',
   true, true, now() - interval '4 days')
on conflict (slug) do nothing;

-- ---------- 3. Suítes, Closets & Banhos ----------
insert into public.case_studies
  (title, slug, client, category, challenge, process,
   results, gallery, cover_image_url, is_published, featured, published_at)
values
  ('Suítes, Closets & Banhos', 'suites-closets-banhos',
   'Hotel Boutique Concept', 'Suíte · Closet · Banho · Residencial',
   'Espaços focados em relaxamento e texturas extremamente táteis. O setor íntimo da casa merece o mesmo cuidado dos grandes hotéis boutique, onde cada superfície convida ao toque e cada detalhe promove o bem-estar.',
   'Closets Vitrine com Vidro Inteligente: Estruturas de marcenaria fina em alumínio e madeira, usando vidros que mudam de transparentes para opacos com um toque. Seu acervo de peças vira parte da decoração ou mantém-se privado instantaneamente.

Cabeceiras Estofadas Integradas: Fusão de painéis amadeirados frisados com couro legítimo, linho e iluminação circadiana que muda de tom ao longo do dia. A cama deixa de ser um móvel e torna-se uma instalação arquitetônica.

Marcenaria Flutuante nos Banheiros: Gabinetes suspensos com recuos técnicos profundos que dão a sensação de leveza e flutuação. A madeira tratada para ambientes úmidos ganha protagonismo em um espaço tradicionalmente dominado por pedras.',
   '[{"metric":"1 toque","label":"para alternar vidro opaco/transparente"},{"metric":"2700K-6500K","label":"variação de temperatura de cor"},{"metric":"15cm","label":"recuo técnico dos gabinetes suspensos"}]'::jsonb,
   '[
     {"url":"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80","alt":"Suíte master com marcenaria integrada"},
     {"url":"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80","alt":"Closet vitrine com vidro inteligente"},
     {"url":"https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80","alt":"Banheiro com marcenaria flutuante"}
   ]'::jsonb,
   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85',
   true, true, now() - interval '3 days')
on conflict (slug) do nothing;

-- ---------- 4. Salas de Diretoria & Reunião ----------
insert into public.case_studies
  (title, slug, client, category, challenge, process,
   results, gallery, cover_image_url, is_published, featured, published_at)
values
  ('Salas de Diretoria & Reunião', 'salas-diretoria-reuniao',
   'Grupo Empresarial Confidencial', 'Diretoria · Executive Meeting · Corporativo',
   'Impor autoridade e sofisticação através do minimalismo caloroso, abandonando a sobriedade fria do corporativo antigo. A marcenaria de alto padrão no ambiente corporativo transmite poder sem ostentação, elegância sem frieza.',
   'Mesas de Reunião Orgânicas: Tampos em formatos fluidos e assimétricos que eliminam hierarquias rígidas e facilitam o contato visual. A madeira maciça escultural é o centro das decisões, com bordas orgânicas que convidam à colaboração.

Conectividade Invisível: Carregadores por indução e réguas de tomadas ocultas sob tampas de madeira com encaixes milimétricos. A tecnologia desaparece na marcenaria — nada de fios aparentes ou gabinetes técnicos visíveis.

Painéis Acústicos Amadeirados: Marcenaria perfurada ou ripada com mantas acústicas ocultas na parte traseira para garantir privacidade absoluta em reuniões. O conforto acústico encontra a estética em um design que funciona como obra de arte.',
   '[{"metric":"100%","label":"conectividade invisível"},{"metric":"NRC 0.85","label":"coeficiente de absorção acústica"},{"metric":"0 fios","label":"aparentes na mesa de reunião"}]'::jsonb,
   '[
     {"url":"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80","alt":"Sala de diretoria com mesa orgânica"},
     {"url":"https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80","alt":"Painéis acústicos amadeirados"},
     {"url":"https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80","alt":"Detalhe da conectividade embutida"}
   ]'::jsonb,
   'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=85',
   true, true, now() - interval '2 days')
on conflict (slug) do nothing;

-- ---------- 5. Áreas Colaborativas & Recepção ----------
insert into public.case_studies
  (title, slug, client, category, challenge, process,
   results, gallery, cover_image_url, is_published, featured, published_at)
values
  ('Áreas Colaborativas & Recepção', 'espacos-colaborativos-recepcao',
   'Tech Hub Corporate', 'Open Space · Recepção · Hubs · Corporativo',
   'A fusão de Residencial com Comercial — espaços corporativos que acolhem como uma casa. O conceito Resimercial transforma o ambiente de trabalho em uma extensão do lar, onde a marcenaria cria nichos de aconchego dentro da produtividade.',
   'Phone Booths em Marcenaria: Pequenos refúgios acústicos revestidos de madeira interna para chamadas privadas. Cápsulas de foco que combinam a privacidade de uma cabine com o aconchego de uma biblioteca particular.

Estações de Trabalho Flexíveis: Marcenaria modular que permite reconfigurar o layout do escritório facilmente. Painéis móveis, bancadas ajustáveis e nichos que se adaptam à cultura de cada equipe sem obra ou sujeira.

Balcões de Recepção Monolíticos: Balcões que misturam marcenaria de curvas complexas com pedras translúcidas retroiluminadas. A recepção é a assinatura da empresa — um objeto escultórico que comunica imediatamente o nível de sofisticação.',
   '[{"metric":"60%","label":"ganho em privacidade acústica"},{"metric":"24h","label":"para reconfigurar o layout"},{"metric":"190cm","label":"altura das cápsulas de foco"}]'::jsonb,
   '[
     {"url":"https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80","alt":"Recepção corporativa com balcão monolítico"},
     {"url":"https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80","alt":"Espaço colaborativo com marcenaria modular"},
     {"url":"https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80","alt":"Phone booth em marcenaria"}
   ]'::jsonb,
   'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85',
   true, true, now() - interval '1 day')
on conflict (slug) do nothing;

-- ===========================================================================
-- Para executar este seed:
-- 1. Acesse o SQL Editor do Supabase (https://supabase.com/dashboard)
-- 2. Copie e cole TODO o conteúdo deste arquivo
-- 3. Execute (Ctrl+Enter ou Cmd+Enter)
-- ===========================================================================
