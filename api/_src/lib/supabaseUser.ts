import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente RLS "do usuário": criado sob demanda com o JWT recebido no header
 * Authorization, de modo que as políticas RLS sejam avaliadas como aquele user.
 */
export function getSupabaseUser(token: string): SupabaseClient {
  const url = process.env.SUPABASE_URL
  const anonKey = process.env.SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('SUPABASE_URL/SUPABASE_ANON_KEY ausentes no api.')
  }
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
}
