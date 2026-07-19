import { brand } from './brand'

/** Itens do menu de navegação público (âncoras na landing + rotas próprias). */
export const navItems = [
  { label: 'Início', href: '/' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Portfólio', href: '/portfolio' },
  { label: 'Estudos de Caso', href: '/cases' },
  { label: 'Depoimentos', href: '/testimonials' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contato', href: '/contato' },
] as const

/** Itens do menu do admin. */
export const adminNavItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: 'dashboard' },
  { label: 'Blog', href: '/admin/blog', icon: 'blog' },
  { label: 'Portfólio', href: '/admin/portfolio', icon: 'portfolio' },
  { label: 'Estudos de Caso', href: '/admin/cases', icon: 'cases' },
  { label: 'Depoimentos', href: '/admin/testimonials', icon: 'testimonials' },
  { label: 'Instagram', href: '/admin/instagram', icon: 'instagram' },
  { label: 'Comentários', href: '/admin/comments', icon: 'comments' },
  { label: 'Colaboradores', href: '/admin/employees', icon: 'users' },
  { label: 'Pontos', href: '/admin/time-records', icon: 'clock' },
  { label: 'Mídia', href: '/admin/media', icon: 'media' },
  { label: 'Atendimento', href: '/admin/contact', icon: 'contact' },
] as const

/** Itens do menu do colaborador. */
export const colaboradorNavItems = [
  { label: 'Registrar Ponto', href: '/colaborador/ponto', icon: 'clock' },
  { label: 'Meu Extrato', href: '/colaborador/extrato', icon: 'file' },
] as const

export const footerYear = new Date().getFullYear()
export const footerLegal = `© ${footerYear} ${brand.legalName}. Todos os direitos reservados.`
