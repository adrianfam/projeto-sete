/**
 * Dados completos dos Estudos de Caso — conteúdo premium
 * Baseado nas macrotendências de alto padrão (CASACOR e ForMóbile)
 */

export interface CaseStudy {
  id: string
  title: string
  slug: string
  subtitle: string
  sector: string
  category: string
  concept: string
  image: string
  solutions: { title: string; description: string }[]
  results: { metric: string; label: string }[]
  gallery: string[]
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'areas-sociais',
    title: 'Áreas Sociais & Living Premium',
    slug: 'areas-sociais-living-premium',
    subtitle: 'Mimetização e fluidez espacial',
    sector: 'Residencial',
    category: 'Living · Jantar · Hall',
    concept:
      'A marcenaria deixa de ser "armário" e passa a ser a própria parede da casa. O conceito de mimetização espacial permite que os ambientes sociais fluam sem barreiras visuais, onde cada elemento de marcenaria se integra à arquitetura como se sempre tivesse feito parte dela.',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80',
    ],
    solutions: [
      {
        title: 'Painéis Wood Skin',
        description:
          'Revestimentos monolíticos que cobrem portas de passagem, quadros elétricos e pilares em uma única lâmina contínua de madeira nobre. A textura corre em veios paralelos que guiam o olhar e ampliam a percepção do espaço.',
      },
      {
        title: 'Nichos Escultóricos Iluminados',
        description:
          'Rasgos na marcenaria com cantos curvos e iluminação micro-LED invisível — sem pontos de luz aparentes. A luz parece emergir da própria madeira, criando uma atmosfera sofisticada e acolhedora.',
      },
      {
        title: 'Divisórias Pivotantes Dinâmicas',
        description:
          'Brises e painéis que giram 360° para integrar ou isolar o living conforme o uso. Em madeira maciça com ferragens ocultas, funcionam como esculturas funcionais que transformam o espaço em segundos.',
      },
    ],
    results: [
      { metric: '100%', label: 'aproveitamento da parede' },
      { metric: '360°', label: 'rotação dos painéis' },
      { metric: '0', label: 'puxadores aparentes' },
    ],
  },
  {
    id: 'cozinha-gourmet',
    title: 'Cozinha Gourmet Oculta',
    slug: 'cozinha-gourmet-oculta',
    subtitle: 'O luxo do oculto',
    sector: 'Residencial',
    category: 'Cozinha · Gourmet · Ilha',
    concept:
      'A cozinha "desaparece" quando não está em uso, integrando-se visualmente à sala. Este conceito de luxo silencioso permite que o espaço gourmet seja tão elegante quanto qualquer ambiente social, revelando sua funcionalidade apenas quando necessário.',
    image:
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
    solutions: [
      {
        title: 'Portas Escamoteáveis de Grande Porte',
        description:
          'Sistemas de ferragens italianas onde as portas da cozinha correm e entram nas laterais do armário, revelando bancadas e eletros apenas quando necessário. Quando fechadas, formam uma parede contínua de marcenaria.',
      },
      {
        title: 'Bancadas em Marcenaria Estrutural',
        description:
          'Ilhas de madeira maciça tratada ou painéis ultra-resistentes ao calor e à umidade, conversando com tampos de pedras naturais. A madeira estrutural traz calor e sofisticação que o mármore sozinho não alcança.',
      },
      {
        title: 'Gavetários Touch-to-Open',
        description:
          'Abertura por toque magnético e fechamento amortecido, eliminando 100% o uso de puxadores. A tecnologia embutida na marcenaria cria superfícies perfeitamente lisas e minimalistas.',
      },
    ],
    results: [
      { metric: '100%', label: 'puxadores eliminados' },
      { metric: '15s', label: 'para revelar a cozinha completa' },
      { metric: '3cm', label: 'folga técnica das portas escamoteáveis' },
    ],
  },
  {
    id: 'suites-closets',
    title: 'Suítes, Closets & Banhos',
    slug: 'suites-closets-banhos',
    subtitle: 'Hotelaria de luxo em casa',
    sector: 'Residencial',
    category: 'Suíte · Closet · Banho',
    concept:
      'Espaços focados em relaxamento e texturas extremamente táteis. O setor íntimo da casa merece o mesmo cuidado dos grandes hotéis boutique, onde cada superfície convida ao toque e cada detalhe promove o bem-estar.',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80',
    ],
    solutions: [
      {
        title: 'Closets Vitrine com Vidro Inteligente',
        description:
          'Estruturas de marcenaria fina em alumínio e madeira, usando vidros que mudam de transparentes para opacos com um toque. Seu acervo de peças vira parte da decoração ou mantém-se privado instantaneamente.',
      },
      {
        title: 'Cabeceiras Estofadas Integradas',
        description:
          'Fusão de painéis amadeirados frisados com couro legítimo, linho e iluminação circadiana que muda de tom ao longo do dia. A cama deixa de ser um móvel e torna-se uma instalação arquitetônica.',
      },
      {
        title: 'Marcenaria Flutuante nos Banheiros',
        description:
          'Gabinetes suspensos com recuos técnicos profundos que dão a sensação de leveza e flutuação. A madeira tratada para ambientes úmidos ganha protagonismo em um espaço tradicionalmente dominado por pedras.',
      },
    ],
    results: [
      { metric: '1 toque', label: 'para alternar vidro opaco/transparente' },
      { metric: '2700K-6500K', label: 'variação de temperatura de cor' },
      { metric: '15cm', label: 'recuo técnico dos gabinetes suspensos' },
    ],
  },
  {
    id: 'diretoria-executiva',
    title: 'Salas de Diretoria & Reunião',
    slug: 'salas-diretoria-reuniao',
    subtitle: 'Autoridade com minimalismo caloroso',
    sector: 'Corporativo',
    category: 'Diretoria · Executive Meeting',
    concept:
      'Impor autoridade e sofisticação através do minimalismo caloroso, abandonando a sobriedade fria do corporativo antigo. A marcenaria de alto padrão no ambiente corporativo transmite poder sem ostentação, elegância sem frieza.',
    image:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
      'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80',
    ],
    solutions: [
      {
        title: 'Mesas de Reunião Orgânicas',
        description:
          'Tampos em formatos fluidos e assimétricos que eliminam hierarquias rígidas e facilitam o contato visual. A madeira maciça escultural é o centro das decisões, com bordas orgânicas que convidam à colaboração.',
      },
      {
        title: 'Conectividade Invisível',
        description:
          'Carregadores por indução e réguas de tomadas ocultas sob tampas de madeira com encaixes milimétricos. A tecnologia desaparece na marcenaria — nada de fios aparentes ou gabinetes técnicos visíveis.',
      },
      {
        title: 'Painéis Acústicos Amadeirados',
        description:
          'Marcenaria perfurada ou ripada com mantas acústicas ocultas na parte traseira para garantir privacidade absoluta em reuniões. O conforto acústico encontra a estética em um design que funciona como obra de arte.',
      },
    ],
    results: [
      { metric: '100%', label: 'conectividade invisível' },
      { metric: 'NRC 0.85', label: 'coeficiente de absorção acústica' },
      { metric: '0 fios', label: 'aparentes na mesa de reunião' },
    ],
  },
  {
    id: 'espacos-colaborativos',
    title: 'Áreas Colaborativas & Recepção',
    slug: 'espacos-colaborativos-recepcao',
    subtitle: 'O conceito Resimercial',
    sector: 'Corporativo',
    category: 'Open Space · Recepção · Hubs',
    concept:
      'A fusão de Residencial com Comercial — espaços corporativos que acolhem como uma casa. O conceito Resimercial transforma o ambiente de trabalho em uma extensão do lar, onde a marcenaria cria nichos de aconchego dentro da produtividade.',
    image:
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=85',
    gallery: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      'https://images.unsplash.com/photo-1618220179428-22790b461013?w=800&q=80',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    ],
    solutions: [
      {
        title: 'Phone Booths em Marcenaria',
        description:
          'Pequenos refúgios acústicos revestidos de madeira interna para chamadas privadas. Cápsulas de foco que combinam a privacidade de uma cabine com o aconchego de uma biblioteca particular.',
      },
      {
        title: 'Estações de Trabalho Flexíveis',
        description:
          'Marcenaria modular que permite reconfigurar o layout do escritório facilmente. Painéis móveis, bancadas ajustáveis e nichos que se adaptam à cultura de cada equipe sem obra ou sujeira.',
      },
      {
        title: 'Balcões de Recepção Monolíticos',
        description:
          'Balcões que misturam marcenaria de curvas complexas com pedras translúcidas retroiluminadas. A recepção é a assinatura da empresa — um objeto escultórico que comunica imediatamente o nível de sofisticação.',
      },
    ],
    results: [
      { metric: '60%', label: 'ganho em privacidade acústica' },
      { metric: '24h', label: 'para reconfigurar o layout' },
      { metric: '190cm', label: 'altura das cápsulas de foco' },
    ],
  },
]

export const CASE_SECTORS = [
  { id: 'residencial', label: 'Residencial', description: 'O Novo Morar Premium' },
  { id: 'corporativo', label: 'Corporativo', description: 'Ambientes de Trabalho Humanizados' },
] as const

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.slug === slug)
}

export function getCaseStudiesBySector(sector: string): CaseStudy[] {
  if (sector === 'todos') return CASE_STUDIES
  return CASE_STUDIES.filter((c) => c.sector.toLowerCase() === sector.toLowerCase())
}
