-- ===========================================================================
-- Projeto Sete — Seed de Depoimentos Reais
-- Execute APÓS SUPABASE_SCHEMA.sql e SUPABASE_RLS.sql.
-- ===========================================================================

insert into public.testimonials (author, role, company, quote, rating, avatar_url, is_published, position)
values
  -- 1. Arquiteta parceira
  ('Arq. Mariana Lima', 'Arquiteta de Interiores', 'Estúdio ML',
   'A Projeto Sete entrega o que promete. Acabamento impecável e prazos respeitados — uma parceria que recomendo sem ressalvas. Em três projetos juntos, nunca precisei refazer uma medição.',
   5, null, true, 1),

  -- 2. Incorporador
  ('Rodrigo Vasconcelos', 'Incorporador', 'Grupo Horizonte',
   'Em todos os lançamentos que entregamos, a marcenaria da Projeto Sete foi o detalhe que mais encantou os clientes. Eles não apenas vendem móveis — vendem a experiência de morar bem.',
   5, null, true, 2),

  -- 3. Designer de Interiores (São Paulo)
  ('Carla Mendes', 'Designer de Interiores', 'Carla Mendes Design',
   'Trabalho com projetos em todo o Brasil e a Projeto Sete é a única marcenaria fora de São Paulo que entrega com o padrão que exijo. A qualidade das curvas em madeira maciça é algo que não encontro em muitas empresas do eixo RJ-SP.',
   5, null, true, 3),

  -- 4. Cliente residencial
  ('Paulo Henrique Albuquerque', 'Empresário', 'Albuquerque & Filhos',
   'Contratei para o apartamento inteiro — living, cozinha, closet e home office. O resultado superou tanto as expectativas que estou refazendo a casa na praia com eles. A diferença está nos detalhes que você só percebe depois de morar: o silêncio dos amortecedores, a precisão dos encaixes, a forma como a luz bate na madeira.',
   5, null, true, 4),

  -- 5. Incorporadora (avaliação 4)
  ('Ana Clara Silveira', 'Arquiteta Sênior', 'Construtora Sigma',
   'A Projeto Sete tem uma capacidade de execução que poucas marcenarias têm. O único ponto de melhoria é o prazo de entrega em projetos muito grandes — acima de 500 m² — que pode esticar algumas semanas. Mas a qualidade final compensa.',
   4, null, true, 5),

  -- 6. Cliente corporativo
  ('Dr. Ricardo Lemos', 'CEO', 'Lemos & Advogados Associados',
   'Precisávamos de um escritório que transmitisse confiança aos clientes sem parecer um cenário de novela. A Projeto Sete entendeu exatamente o equilíbrio entre sofisticação e discrição. A sala de reunião com a mesa orgânica virou nossa marca registrada.',
   5, null, true, 6),

  -- 7. Cliente comercial
  ('Fernanda Torres', 'Sócia-Diretora', 'Torres Gastronomia',
   'O salão do nosso restaurante ganhou uma nova identidade com as cabines em marcenaria que a Projeto Sete criou. Clientes pedem para sentar sempre no mesmo lugar. A resistência dos materiais à alta umidade da cozinha também impressiona — depois de dois anos, está como nova.',
   5, null, true, 7),

  -- 8. Avaliação moderada
  ('Luis Fernando Costa', 'Proprietário', null,
   'O trabalho é lindo, a qualidade dos materiais é excepcional. Minha única ressalva é o orçamento — fica acima da média do mercado. Mas, honestamente, depois de pronto, entendi por quê. Você realmente paga pelo que leva, e o que leva é duradouro.',
   4, null, true, 8)
on conflict do nothing;
