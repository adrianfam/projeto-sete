-- ===========================================================================
-- Projeto Sete — Seed de Portfólio Premium
-- Execute APÓS SUPABASE_SCHEMA.sql e SUPABASE_RLS.sql.
-- Requer que as categorias abaixo existam em portfolio_categories.
-- ===========================================================================

-- ---------- Portfólio Premium ----------
-- 6 projetos: 3 residenciais, 1 comercial, 2 corporativos

insert into public.portfolio_items
  (title, slug, summary, description, project_type, category_id, location, year, area_m2,
   media, cover_image_url, is_published, is_featured, published_at, position)
values
  -- 1. Residencial: Cobertura Dunas
  ('Cobertura Dunas', 'cobertura-dunas',
   'Integração total entre living, gourmet e paisagem marítima em 360 m² de marcenaria planejada.',
   '## Sobre o Projeto\n\nProjetada para um casal que recebe amigos com frequência, a cobertura exigia fluidez total entre os ambientes sociais sem perder a privacidade do setor íntimo.\n\n## Desafio\n\nConciliar a vista de 180° do mar com uma marcenaria que organizasse mais de 40 m² de armazenamento sem bloquear a luz natural.\n\n## Solução\n\nPainéis Wood Skin em freijó com 4 mm de espessura cobrindo 120 m² de paredes, portas camufladas com encaixe oculto e uma ilha gourmet de 6 metros que funciona como elemento escultórico central.\n\n## Resultado\n\nA cobertura ganhou um fluxo contínuo onde a marcenaria é a própria arquitetura — cada armário, painel e porta faz parte de uma superfície monolítica que valoriza a paisagem externa.',
   'residencial', (select id from public.portfolio_categories where slug = 'residencial'),
   'Meireles, Fortaleza', 2024, 360.00,
   '[]'::jsonb,
   'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85',
   true, true, now() - interval '30 days', 1),

  -- 2. Residencial: Casa Jardim América
  ('Casa Jardim América', 'casa-jardim-america',
   'Residência familiar com 450 m² de área construída e integração total com jardins tropicais.',
   '## Sobre o Projeto\n\nUma casa projetada para uma família com três filhos, onde a marcenaria precisava unir funcionalidade familiar com o requinte de um lar de alto padrão.\n\n## Desafio\n\nCriar espaços de convivência que fossem igualmente elegantese resistentes ao dia a dia com crianças, além de integrar visualmente os ambientes internos com o jardim tropical.\n\n## Solução\n\nMarcenaria em carvalho americano com acabamento acetinado de alta resistência, portas pivotantes de 3 metros que se abrem completamente para o jardim, e um closet infantil com módulos ajustáveis que crescem com as crianças.\n\n## Resultado\n\nUma casa que respira sofisticação sem perder a funcionalidade — onde a marcenaria suporta o calor, as crianças e os jantares formais com a mesma excelência.',
   'residencial', (select id from public.portfolio_categories where slug = 'residencial'),
   'Jardim América, Fortaleza', 2024, 450.00,
   '[]'::jsonb,
   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=85',
   true, true, now() - interval '25 days', 2),

  -- 3. Residencial: Apartamento CASACOR
  ('Apartamento CASACOR', 'apartamento-casacor',
   'Ambiente autoral de 120 m² apresentado na edição 2024 da CASACOR Ceará.',
   '## Sobre o Projeto\n\nUm ambiente conceito criado especialmente para a mostra CASACOR Ceará 2024, onde a Projeto Sete foi convidada a apresentar o futuro da marcenaria residencial.\n\n## Desafio\n\nEm apenas 120 m², criar um apartamento que representasse todas as macrotendências de alto padrão — da cozinha oculta ao closet com vidro inteligente — sem que o espaço parecesse uma vitrine de produtos.\n\n## Solução\n\nUm layout fluido que guia o visitante por uma narrativa espacial: ao entrar, a cozinha gourmet se revela através de portas escamoteáveis; o living se expande com painéis pivotantes; e a suíte máster exibe um closet com vidros que se tornam opacos ao toque.\n\n## Resultado\n\nO ambiente mais fotografado da mostra, gerando mais de 50 leads qualificados e 3 contratos fechados durante o evento.',
   'residencial', (select id from public.portfolio_categories where slug = 'residencial'),
   'CASACOR Ceará', 2024, 120.00,
   '[]'::jsonb,
   'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&q=85',
   true, true, now() - interval '20 days', 3),

  -- 4. Comercial: Loja Conceito Joalheria
  ('Loja Conceito Joalheria', 'loja-conceito-joalheria',
   'Experiência de compra premium com vitrines em marcenaria e iluminação cênica integrada.',
   '## Sobre o Projeto\n\nUma joalheria de alto padrão que precisava de um ambiente tão precioso quanto as peças que comercializa — onde a marcenaria funcionasse como moldura para as joias.\n\n## Desafio\n\nCriar vitrines e expositores que protegessem peças de alto valor, integrassem iluminação cênica precisa e transmitissem a herança da marca centenária.\n\n## Solução\n\nBalcões em mogno maciço com tampo de vidro curvo temperado, vitrines embutidas com iluminação LED dimerizável e sistema de segurança oculto na própria marcenaria. Cada detalhe foi projetado para direcionar o olhar do cliente às joias.\n\n## Resultado\n\nA loja faturou 40% acima da meta no primeiro mês de operação, e a marca abriu mais duas unidades com o mesmo conceito.',
   'comercial', (select id from public.portfolio_categories where slug = 'comercial'),
   'Shopping Iguatemi, Fortaleza', 2023, 85.00,
   '[]'::jsonb,
   'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=85',
   true, true, now() - interval '15 days', 4),

  -- 5. Corporativo: Headquarters Tech
  ('Headquarters Tech', 'headquarters-tech',
   'Sede corporativa com 1.200 m² de marcenaria integrada para uma scale-up de tecnologia.',
   '## Sobre o Projeto\n\nUma empresa de tecnologia em rápido crescimento precisava de uma sede que refletisse sua cultura inovadora sem abrir mão da sofisticação — um escritório que funcionasse como ferramenta de trabalho e como展示 para clientes.\n\n## Desafio\n\nCriar um ambiente que acomodasse 150 pessoas em regime híbrido, com salas de reunião acústicas, estações flexíveis e áreas de descompressão — tudo em marcenaria que expressasse a identidade da marca.\n\n## Solução\n\nBalcão de recepção monolítico em curva com pedra translúcida retroiluminada, 12 phone booths revestidas em madeira com isolamento acústico NRC 0.90, mesa de reunião orgânica para 20 pessoas com conectividade invisível embutida, e painéis ripados que funcionam como divisórias acústicas.\n\n## Resultado\n\nA empresa reduziu em 30% o turnover de talentos e registrou aumento de produtividade, atribuídos ao novo ambiente de trabalho — eleito o \"Melhor Escritório do Ano\" pelo ranking local.',
   'corporativo', (select id from public.portfolio_categories where slug = 'corporativo'),
   'Aldeota, Fortaleza', 2024, 1200.00,
   '[]'::jsonb,
   'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&q=85',
   true, true, now() - interval '10 days', 5),

  -- 6. Corporativo: Sala de Diretoria Grupo Financeiro
  ('Sala de Diretoria Grupo Financeiro', 'sala-diretoria-grupo-financeiro',
   'Diretoria executiva com mesa orgânica de 6 metros em madeira maciça e tecnologia invisível.',
   '## Sobre o Projeto\n\nO presidente de um grupo financeiro desejava uma sala de diretoria que impusesse autoridade sem recorrer ao estilo pesado do corporativo tradicional — um espaço que comunicasse inovação e solidez.\n\n## Desafio\n\nCriar uma mesa de reunião que acomodasse 14 pessoas com conforto, integrasse toda a tecnologia necessária (tomadas, carregamento por indução, conectividade AV) sem um único fio aparente, e transmitisse a solidez de uma instituição centenária.\n\n## Solução\n\nMesa em tauari maciço com 6 metros de comprimento em formato orgânico assimétrico, tampos de abertura oculta para acesso à tecnologia, painéis acústicos em madeira perfurada com mantas absorventes, e iluminação circadiana que ajusta o tom de luz ao longo das reuniões.\n\n## Resultado\n\nA diretoria aprovou a expansão do projeto para todas as 12 salas de reunião da holding, gerando o maior contrato da história da Projeto Sete.',
   'corporativo', (select id from public.portfolio_categories where slug = 'corporativo'),
   'Eng. Luciano Cavalcante, Fortaleza', 2023, 200.00,
   '[]'::jsonb,
   'https://images.unsplash.com/photo-1618220179428-22790b461013?w=1200&q=85',
   true, true, now() - interval '5 days', 6)
on conflict (slug) do nothing;
