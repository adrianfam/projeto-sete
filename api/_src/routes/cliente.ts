import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { authedGuard, clientGuard, type AuthedSession, type ClientSession } from '../lib/clientAuth'
import { clientProfileSchema } from '@projeto-sete/shared'

type Sb = ReturnType<typeof getSupabaseAdmin>

/** Verifica se o cliente (dono ou arquiteto vinculado) acessa o projeto. */
async function canAccessProject(sb: Sb, clientId: string, projectId: string): Promise<boolean> {
  const { data } = await sb
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .or(`client_id.eq.${clientId},architect_id.eq.${clientId}`)
    .maybeSingle()
  return Boolean(data)
}

export const clienteRoutes: FastifyPluginAsync = async (app) => {
  // -------------------------------------------------------------------------
  // Perfil (cadastro "sem compromisso" — cria ou atualiza a partir do JWT)
  // -------------------------------------------------------------------------
  app.post('/cliente/profile', { preHandler: authedGuard }, async (req, reply) => {
    const session = (req as unknown as { authed: AuthedSession }).authed
    const parsed = clientProfileSchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Dados inválidos. Verifique os campos.' })
    }
    const d = parsed.data
    const payload = {
      auth_user_id: session.userId,
      email: session.email,
      client_type: d.clientType,
      full_name: d.fullName,
      whatsapp: d.whatsapp,
      prefer_messages: d.preferMessages,
      city: d.city,
      neighborhood: d.neighborhood,
      property_phase: d.propertyPhase,
      delivery_date: d.deliveryDate,
      rooms: d.rooms,
      professional_reg: d.professionalReg,
      office_name: d.officeName,
      portfolio_url: d.portfolioUrl,
      annual_volume: d.annualVolume,
    }

    const sb = getSupabaseAdmin()
    const existing = await sb.from('clients').select('id').eq('auth_user_id', session.userId).maybeSingle()

    let profile
    if (existing?.data) {
      const { data, error } = await sb
        .from('clients')
        .update(payload)
        .eq('id', existing.data.id)
        .select()
        .single()
      if (error) return reply.code(500).send({ message: error.message })
      profile = data
    } else {
      const { data, error } = await sb.from('clients').insert(payload).select().single()
      if (error) return reply.code(500).send({ message: error.message })
      profile = data
    }
    return { profile }
  })

  app.get('/cliente/me', { preHandler: authedGuard }, async (req, reply) => {
    const session = (req as unknown as { authed: AuthedSession }).authed
    const sb = getSupabaseAdmin()
    const { data } = await sb.from('clients').select('*').eq('auth_user_id', session.userId).maybeSingle()
    return { profile: data ?? null }
  })

  // -------------------------------------------------------------------------
  // Meus Orçamentos (histórico de contact_submissions vinculados)
  // -------------------------------------------------------------------------
  app.get('/cliente/budgets', { preHandler: clientGuard }, async (req, reply) => {
    const session = (req as unknown as { client: ClientSession }).client
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('contact_submissions')
      .select('id,name,email,phone,subject,message,status,created_at')
      .eq('client_id', session.clientId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  // -------------------------------------------------------------------------
  // Projetos (dono ou arquiteto vinculado)
  // -------------------------------------------------------------------------
  app.get('/cliente/projects', { preHandler: clientGuard }, async (req, reply) => {
    const session = (req as unknown as { client: ClientSession }).client
    const sb = getSupabaseAdmin()

    const { data: projects, error } = await sb
      .from('projects')
      .select('id,client_id,architect_id,title,status,notes,created_at,updated_at')
      .or(`client_id.eq.${session.clientId},architect_id.eq.${session.clientId}`)
      .order('created_at', { ascending: false })
    if (error) return reply.code(500).send({ message: error.message })

    // Nomes de cliente/arquiteto
    const ids = new Set<string>()
    projects?.forEach((p) => {
      ids.add(p.client_id)
      if (p.architect_id) ids.add(p.architect_id)
    })
    const { data: clients } = await sb
      .from('clients')
      .select('id,full_name')
      .in('id', [...ids])
    const nameById = new Map((clients ?? []).map((c) => [c.id, c.full_name]))

    return {
      items: (projects ?? []).map((p) => ({
        ...p,
        client_name: nameById.get(p.client_id) ?? null,
        architect_name: p.architect_id ? (nameById.get(p.architect_id) ?? null) : null,
      })),
    }
  })

  // -------------------------------------------------------------------------
  // Arquivos (central de downloads — com checagem de acesso)
  // -------------------------------------------------------------------------
  app.get('/cliente/projects/:id/files', { preHandler: clientGuard }, async (req, reply) => {
    const session = (req as unknown as { client: ClientSession }).client
    const { id } = req.params as { id: string }
    const sb = getSupabaseAdmin()

    if (!(await canAccessProject(sb, session.clientId, id))) {
      return reply.code(403).send({ message: 'Acesso negado.' })
    }
    const { data, error } = await sb
      .from('project_files')
      .select('id,name,file_type,mime_type,created_at')
      .eq('project_id', id)
      .order('created_at', { ascending: true })
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  app.get('/cliente/files/:id/sign', { preHandler: clientGuard }, async (req, reply) => {
    const session = (req as unknown as { client: ClientSession }).client
    const { id } = req.params as { id: string }
    const sb = getSupabaseAdmin()

    const { data: file } = await sb
      .from('project_files')
      .select('id,project_id,path,name')
      .eq('id', id)
      .maybeSingle()
    if (!file) return reply.code(404).send({ message: 'Arquivo não encontrado.' })

    if (!(await canAccessProject(sb, session.clientId, file.project_id))) {
      return reply.code(403).send({ message: 'Acesso negado.' })
    }
    const { data: signed } = await sb.storage
      .from('client-files')
      .createSignedUrl(file.path, 60 * 15) // 15 min
    if (!signed) return reply.code(500).send({ message: 'Erro ao gerar link de download.' })
    return { url: signed.signedUrl, name: file.name }
  })

  // -------------------------------------------------------------------------
  // Eventos (próximos compromissos do usuário)
  // -------------------------------------------------------------------------
  app.get('/cliente/events', { preHandler: clientGuard }, async (req, reply) => {
    const session = (req as unknown as { client: ClientSession }).client
    const sb = getSupabaseAdmin()

    const { data: projects } = await sb
      .from('projects')
      .select('id')
      .or(`client_id.eq.${session.clientId},architect_id.eq.${session.clientId}`)
    const projectIds = (projects ?? []).map((p) => p.id)
    if (projectIds.length === 0) return { items: [] }

    const now = new Date().toISOString()
    const { data, error } = await sb
      .from('project_events')
      .select('id,project_id,title,scheduled_at,professional,notes')
      .in('project_id', projectIds)
      .gte('scheduled_at', now)
      .order('scheduled_at', { ascending: true })
      .limit(20)
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })
}
