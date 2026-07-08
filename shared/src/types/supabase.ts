/**
 * Tipos derivados do banco Supabase. Placeholder até gerar com
 * `supabase gen types typescript`. Este arquivo garante import mesmo
 * antes da geração — sendo substituído pela saída oficial quando houver.
 */

export interface DbRow {
  id: string
  created_at: string
  updated_at?: string | null
  deleted_at?: string | null
}

export type AdminRole = 'admin' | 'editor'

export interface AdminProfile {
  user_id: string
  full_name: string | null
  role: AdminRole
  created_at: string
}
