/**
 * Dados centralizados daempresa — fonte única de verdade.
 * Consumido por footer, contato, SEO (JSON-LD LocalBusiness), WhatsApp, etc.
 * SAUDÁVEL: nunca duplicar estes valores em componentes; importar daqui.
 */

export const brand = {
  name: 'Projeto Sete',
  legalName: 'Projeto Sete Móveis Planejados e Marcenaria',
  tagline: 'Móveis Planejados e Marcenaria de Alto Padrão',
  description:
    'Especialistas em móveis sob medida de alto padrão em Fortaleza e região. ' +
    'Transformamos sonhos em realidade com excelência e sofisticação, combinando ' +
    'funcionalidade e elegância para espaços residenciais e comerciais.',
  foundedYear: 2009,
  yearsExperience: 15,
  owner: {
    name: 'Felipe Amorim',
    role: 'Proprietário & CEO',
  },

  contact: {
    phone: '(85) 99816-2777',
    phoneRaw: '+5585998162777',
    whatsappIntl: '5585998162777',
    whatsappLink: 'https://wa.me/5585998162777',
    email: 'projetosete.gerencia@gmail.com',
  },

  address: {
    street: 'Rua Capitão Clóvis Maia, 759',
    district: 'Alto da Balança',
    city: 'Fortaleza',
    state: 'CE',
    zip: '60851-000',
    country: 'BR',
    fullAddress: 'Rua Capitão Clóvis Maia, 759 - Alto da Balança, Fortaleza - CE, 60851-000',
    // Coordenadas aproximadas de Alto da Balança, Fortaleza (refinar com Maps)
    geo: { lat: -3.7895, lng: -38.4879 },
    mapsEmbedQuery: 'Rua Capitão Clóvis Maia, 759, Alto da Balança, Fortaleza, CE',
  },

  hours: [
    { days: 'Segunda a Sexta', open: '08:00', close: '17:00' },
    { days: 'Sábado e Domingo', open: null, close: null, label: 'Fechado' },
  ],

  social: {
    instagram: {
      handle: '@_projetosete',
      username: '_projetosete',
      url: 'https://www.instagram.com/_projetosete/',
    },
  },

  credentials: [
    'Mais de 15 anos de experiência no mercado (desde 2009)',
    'Especialistas em móveis sob medida de alto padrão',
    'Atendimento personalizado para residencial e comercial',
    'Uso dos melhores materiais do mercado',
    'Reconhecimento por inventividade e qualidade',
  ],

  references: ['CASACOR', 'ForMóbile'],
} as const

export type Brand = typeof brand
