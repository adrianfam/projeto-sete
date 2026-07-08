import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !anonKey) {
  // Modo offline/dev sem Supabase configurado — não quebra o app.
  // eslint-disable-next-line no-console
  console.warn(
    '[supabase] Variáveis VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY ausentes. Auth/admin desabilitado até configurar.',
  )
}

export const supabase =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true } }) : null
