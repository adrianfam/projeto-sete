import type { FastifyRequest, FastifyReply } from 'fastify'
import { getSupabaseAdmin } from './supabaseAdmin'

export interface AuthedSession {
  userId: string
  email: string | null
}

export interface ClientSession extends AuthedSession {
  clientId: string
  clientType: 'final' | 'architect'
}

/** Valida o Bearer token e retorna o usuário autenticado (qualquer usuário Supabase). */
export async function requireAuthed(req: FastifyRequest): Promise<AuthedSession | null> {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) return null
  const token = header.slice(7)

  const admin = getSupabaseAdmin()
  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token)
  if (error || !user) return null

  return { userId: user.id, email: user.email ?? null }
}

/** Exige usuário autenticado E perfil cadastrado em clients. */
export async function requireClient(req: FastifyRequest): Promise<ClientSession | null> {
  const authed = await requireAuthed(req)
  if (!authed) return null

  const admin = getSupabaseAdmin()
  const { data: client } = await admin
    .from('clients')
    .select('id,client_type')
    .eq('auth_user_id', authed.userId)
    .maybeSingle()
  if (!client) return null

  return { ...authed, clientId: client.id, clientType: client.client_type as ClientSession['clientType'] }
}

/** Pre-handler: 401 se não houver usuário autenticado. */
export async function authedGuard(req: FastifyRequest, reply: FastifyReply) {
  const session = await requireAuthed(req)
  if (!session) return reply.code(401).send({ message: 'Não autorizado.' })
  ;(req as unknown as { authed: AuthedSession }).authed = session
}

/** Pre-handler: 401 se não houver perfil de cliente. */
export async function clientGuard(req: FastifyRequest, reply: FastifyReply) {
  const session = await requireClient(req)
  if (!session) return reply.code(401).send({ message: 'Não autorizado.' })
  ;(req as unknown as { client: ClientSession }).client = session
}
