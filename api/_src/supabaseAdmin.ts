import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente com service-role: bypassa RLS. USAR APENAS NO SERVIDOR (api).
 * A chave NUNCA deve chegar ao frontend.
 */
let cached: SupabaseClient | null = null

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error(
      'SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY ausentes. Defina as variáveis de ambiente do api.',
    )
  }
  cached = createClient(url, key, { auth: { persistSession: false } })
  return cached
}

/** Flag de configuração — false permite responder health sem quebrar. */
export function supabaseConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}
