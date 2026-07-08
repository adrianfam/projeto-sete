import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabaseClient'
import { setAdminToken } from '@/lib/adminToken'

function syncToken(session: Session | null) {
  setAdminToken(session?.access_token ?? null)
}

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  /** Erro bruto da última tentativa de login. */
  error: string | null
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => Promise<void>
  hydrate: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,
  error: null,
  clearError: () => set({ error: null }),

  hydrate: async () => {
    if (!supabase) {
      set({ loading: false })
      return
    }
    const { data } = await supabase.auth.getSession()
    syncToken(data.session)
    set({ session: data.session, user: data.session?.user ?? null, loading: false })

    supabase.auth.onAuthStateChange((_event, session) => {
      syncToken(session)
      set({ session, user: session?.user ?? null, loading: false })
    })
  },

  signIn: async (email, password) => {
    if (!supabase) {
      set({ error: 'Supabase não configurado.' })
      return false
    }
    set({ error: null, loading: true })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ error: error.message, loading: false })
      return false
    }
    syncToken(data.session)
    set({ session: data.session, user: data.user, loading: false })
    return true
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut()
    syncToken(null)
    set({ session: null, user: null, error: null })
  },
}))
