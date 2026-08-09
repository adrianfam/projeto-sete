import type { User } from '@supabase/supabase-js'

/**
 * Perfil ativo no menu de acesso da navbar.
 * Admin e cliente compartilham a mesma sessão Supabase, então o perfil em uso
 * é marcado localmente no momento de cada login (último perfil acessado).
 * O colaborador tem sessão própria (sessionStorage), independente do Supabase.
 *
 * Usamos sessionStorage: o marcador fica isolado por aba (duas abas podem
 * usar perfis diferentes sem conflito). A sessão Supabase restaurada após
 * reiniciar o navegador perde o marcador — sem problema: o menu apenas deixa
 * de destacar até o próximo login.
 */
export type ActiveProfile = 'cliente' | 'admin' | 'colaborador' | null

/** Perfis persistidos no marcador local (colaborador usa sessionStorage próprio). */
export type StoredProfile = 'cliente' | 'admin'

const KEY = 'active_profile'

export function setActiveProfile(profile: StoredProfile | null) {
  if (profile) sessionStorage.setItem(KEY, profile)
  else sessionStorage.removeItem(KEY)
}

export function getActiveProfile(): StoredProfile | null {
  const raw = sessionStorage.getItem(KEY)
  return raw === 'cliente' || raw === 'admin' ? raw : null
}

/**
 * Resolve qual perfil está logado no momento:
 * 1. Colaborador — sessão própria do ponto eletrônico (sessionStorage).
 * 2. Cliente — usuário marcado como `role: client` no metadata (send-access).
 * 3. Cliente/Admin — marcador local do último login com sessão Supabase ativa.
 */
export function getCurrentProfile(user: User | null): ActiveProfile {
  if (sessionStorage.getItem('ponto_employee_id')) return 'colaborador'
  if (!user) return null
  if (user.user_metadata?.role === 'client') return 'cliente'
  return getActiveProfile()
}
