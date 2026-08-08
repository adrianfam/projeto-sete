import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { authedGuard, clientGuard, type AuthedSession, type ClientSession } from '../lib/clientAuth'
import { clientProfileSchema, clientInspirationSchema } from '@projeto-sete/shared'

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
  // Pasta de Inspirações (favoritos sobre portfolio + instagram)
  // -------------------------------------------------------------------------
  app.get('/cliente/inspirations', { preHandler: clientGuard }, async (req, reply) => {
    const session = (req as unknown as { client: ClientSession }).client
    const sb = getSupabaseAdmin()

    const { data: favs, error } = await sb
      .from('client_inspirations')
      .select('id,source_type,source_id,note,created_at')
      .eq('client_id', session.clientId)
      .order('created_at', { ascending: false })
    if (error) return reply.code(500).send({ message: error.message })

    const rows = favs ?? []
    const portfolioIds = rows.filter((r) => r.source_type === 'portfolio').map((r) => r.source_id)
    const instagramIds = rows.filter((r) => r.source_type === 'instagram').map((r) => r.source_id)

    const byId = (list: { id: string }[]) => new Map(list.map((x) => [x.id, x]))
    let portfolio = new Map<string, unknown>()
    let instagram = new Map<string, unknown>()

    if (portfolioIds.length > 0) {
      const { data } = await sb
        .from('portfolio_items')
        .select('id,title,slug,cover_image_url,project_type,location')
        .in('id', portfolioIds)
        .eq('is_published', true)
        .is('deleted_at', null)
      portfolio = byId(data ?? [])
    }
    if (instagramIds.length > 0) {
      const { data } = await sb
        .from('instagram_posts')
        .select('id,caption,image_url,post_url,aspect_ratio')
        .in('id', instagramIds)
        .eq('is_published', true)
      instagram = byId(data ?? [])
    }

    return {
      items: rows.map((r) => ({
        id: r.id,
        source_type: r.source_type,
        source_id: r.source_id,
        note: r.note,
        created_at: r.created_at,
        content:
          r.source_type === 'portfolio' ? (portfolio.get(r.source_id) ?? null) : (instagram.get(r.source_id) ?? null),
      })),
    }
  })

  app.post('/cliente/inspirations', { preHandler: clientGuard }, async (req, reply) => {
    const session = (req as unknown as { client: ClientSession }).client
    const parsed = clientInspirationSchema.safeParse(req.body)
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Dados inválidos. Verifique os campos.' })
    }
    const { sourceType, sourceId, note } = parsed.data
    const sb = getSupabaseAdmin()

    // Valida que a fonte existe E está publicada (não permite favoritar rascunho)
    const table = sourceType === 'portfolio' ? 'portfolio_items' : 'instagram_posts'
    let sourceQuery = sb.from(table).select('id').eq('id', sourceId).eq('is_published', true)
    if (sourceType === 'portfolio') sourceQuery = sourceQuery.is('deleted_at', null)
    const { data: source } = await sourceQuery.maybeSingle()
    if (!source) return reply.code(404).send({ message: 'Inspiração não encontrada.' })

    const { data, error } = await sb
      .from('client_inspirations')
      .upsert(
        {
          client_id: session.clientId,
          source_type: sourceType,
          source_id: sourceId,
          note: note ?? null,
        },
        { onConflict: 'client_id,source_type,source_id' },
      )
      .select('id,source_type,source_id,note,created_at')
      .single()
    if (error) return reply.code(500).send({ message: error.message })
    return reply.code(201).send({ item: data })
  })

  app.delete('/cliente/inspirations/:id', { preHandler: clientGuard }, async (req, reply) => {
    const session = (req as unknown as { client: ClientSession }).client
    const { id } = req.params as { id: string }
    const sb = getSupabaseAdmin()
    const { error } = await sb
      .from('client_inspirations')
      .delete()
      .eq('id', id)
      .eq('client_id', session.clientId)
    if (error) return reply.code(500).send({ message: error.message })
    return reply.code(204).send()
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
