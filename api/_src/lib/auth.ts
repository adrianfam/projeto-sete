import type { FastifyRequest } from 'fastify'
import { getSupabaseAdmin } from './supabaseAdmin'

export interface AdminSession {
  userId: string
  email: string | null
  role: 'admin' | 'editor' | null
}

/**
 * Vale o token Bearer do header. Retorna null se ausente/inválido.
 * Valida contra a Auth do Supabase (getUser) e checa perfil em admin_profiles.
 *
 * Opcionalmente poderia verificar o JWT com SUPABASE_JWT_SECRET offline,
 * mas chamar getUser garante autoridade do Supabase e status de sessão.
 */
export async function requireAdmin(req: FastifyRequest): Promise<AdminSession | null> {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice(7)

  const admin = getSupabaseAdmin()
  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token)
  if (error || !user) return null

  const { data: profile } = await admin
    .from('admin_profiles')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) return null

  return { userId: user.id, email: user.email ?? null, role: profile.role as AdminSession['role'] }
}

/** Hook Fastify pré-handler: 401 se não for admin. */
export async function adminGuard(req: FastifyRequest, reply: import('fastify').FastifyReply) {
  const session = await requireAdmin(req)
  if (!session) {
    return reply.code(401).send({ message: 'Não autorizado.' })
  }
  ;(req as unknown as { admin: AdminSession }).admin = session
}
