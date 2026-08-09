import type { FastifyPluginAsync } from 'fastify'
import { z } from 'zod'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { adminGuard } from '../lib/auth'
import {
  clientAdminInputSchema,
  clientProfileSchema,
  projectInputSchema,
  projectUpdateSchema,
  projectEventInputSchema,
  projectFileTypeEnum,
  projectStatusLabels,
  type ClientProfile,
} from '@projeto-sete/shared'
import {
  sendProjectStatusEmail,
  sendVisitScheduledEmail,
  sendAccountAccessEmail,
  sendAccountRecoveryEmail,
} from '../lib/clientEmails'

type Sb = ReturnType<typeof getSupabaseAdmin>

/**
 * Mapeia o perfil (camelCase) para as colunas da tabela clients.
 * Campos ausentes (undefined) são ignorados — útil em PATCHs parciais.
 */
function toClientColumns(d: Partial<ClientProfile>): Partial<Record<string, unknown>> {
  const cols: Record<string, unknown> = {
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
  const out: Partial<Record<string, unknown>> = {}
  for (const [key, value] of Object.entries(cols)) {
    if (value !== undefined) out[key] = value
  }
  return out
}

function safeFileName(name: string): string {
  return name.replace(/[^a-z0-9.\-_]/gi, '-').slice(0, 120)
}

export const adminClientRoutes: FastifyPluginAsync = async (app) => {
  // =========================================================================
  // Clients
  // =========================================================================
  app.get('/admin/clients', { preHandler: adminGuard }, async (req, reply) => {
    const { type, status, q } = req.query as { type?: string; status?: string; q?: string }
    const sb = getSupabaseAdmin()
    let query = sb
      .from('clients')
      .select(
        'id,client_type,full_name,email,whatsapp,prefer_messages,status,city,neighborhood,property_phase,delivery_date,rooms,professional_reg,office_name,portfolio_url,annual_volume,created_at,auth_user_id',
      )
      .order('created_at', { ascending: false })
      .limit(300)
    if (type) query = query.eq('client_type', type)
    if (status) query = query.eq('status', status)
    if (q) query = query.ilike('full_name', `%${q}%`)
    const { data, error } = await query
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  app.post('/admin/clients', { preHandler: adminGuard }, async (req, reply) => {
    const parsed = clientAdminInputSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ message: 'Dados inválidos. Verifique os campos.' })
    const d = parsed.data
    const sb = getSupabaseAdmin()

    // E-mail único (case-insensitive) — evita clientes duplicados
    if (d.email) {
      const { data: existing } = await sb
        .from('clients')
        .select('id,full_name')
        .ilike('email', d.email)
        .maybeSingle()
      if (existing) {
        return reply.code(409).send({
          message: `E-mail já cadastrado para ${existing.full_name}. Use outro e-mail ou edite o registro existente.`,
        })
      }
    }

    const { data, error } = await sb
      .from('clients')
      .insert({ ...toClientColumns(d), email: d.email ?? null })
      .select()
      .single()
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(201).send({ client: data })
  })

  app.patch('/admin/clients/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = req.body as Record<string, unknown>
    const sb = getSupabaseAdmin()

    // Status e e-mail têm tratamento próprio (fora do schema de perfil)
    const payload: Record<string, unknown> = {}
    if (body.status === 'lead' || body.status === 'active') payload.status = body.status
    if (body.email !== undefined) {
      const emailParsed = z
        .string()
        .trim()
        .email()
        .max(160)
        .nullable()
        .safeParse(body.email === '' ? null : body.email)
      if (!emailParsed.success) return reply.code(400).send({ message: 'E-mail inválido.' })
      payload.email = emailParsed.data
    }

    // Campos do perfil (parcial — apenas os presentes são aplicados)
    const parsed = clientProfileSchema.partial().safeParse(body)
    if (!parsed.success) {
      return reply.code(400).send({ message: 'Dados inválidos. Verifique os campos.' })
    }
    Object.assign(payload, toClientColumns(parsed.data))

    // E-mail único (case-insensitive) — não permite colidir com outro cliente
    if (payload.email) {
      const { data: existing } = await sb
        .from('clients')
        .select('id,full_name')
        .ilike('email', payload.email as string)
        .neq('id', id)
        .maybeSingle()
      if (existing) {
        return reply.code(409).send({
          message: `E-mail já cadastrado para ${existing.full_name}. Use outro e-mail.`,
        })
      }
    }

    const { data, error } = await sb
      .from('clients')
      .update(payload)
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) return reply.code(400).send({ message: error.message })
    if (!data) return reply.code(404).send({ message: 'Cliente não encontrado.' })
    return { client: data }
  })

  // =========================================================================
  // Projects
  // =========================================================================
  app.get('/admin/projects', { preHandler: adminGuard }, async (req, reply) => {
    const { status } = req.query as { status?: string }
    const sb = getSupabaseAdmin()
    let query = sb
      .from('projects')
      .select('id,client_id,architect_id,title,status,notes,created_at,updated_at')
      .order('created_at', { ascending: false })
      .limit(300)
    if (status) query = query.eq('status', status)
    const { data, error } = await query
    if (error) return reply.code(500).send({ message: error.message })

    const rows = data ?? []
    const ids = new Set<string>()
    rows.forEach((p) => {
      ids.add(p.client_id)
      if (p.architect_id) ids.add(p.architect_id)
    })

    const nameById = new Map<string, string>()
    if (ids.size > 0) {
      const { data: clients } = await sb.from('clients').select('id,full_name').in('id', [...ids])
      clients?.forEach((c) => nameById.set(c.id, c.full_name))
    }

    return {
      items: rows.map((p) => ({
        ...p,
        client_name: nameById.get(p.client_id) ?? null,
        architect_name: p.architect_id ? (nameById.get(p.architect_id) ?? null) : null,
      })),
    }
  })

  app.post('/admin/projects', { preHandler: adminGuard }, async (req, reply) => {
    const parsed = projectInputSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ message: 'Dados inválidos.' })
    const d = parsed.data
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('projects')
      .insert({
        client_id: d.clientId,
        architect_id: d.architectId ?? null,
        title: d.title,
        notes: d.notes ?? null,
      })
      .select()
      .single()
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(201).send({ project: data })
  })

  app.get('/admin/projects/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const sb = getSupabaseAdmin()
    const { data: project, error } = await sb.from('projects').select('*').eq('id', id).maybeSingle()
    if (error) return reply.code(500).send({ message: error.message })
    if (!project) return reply.code(404).send({ message: 'Projeto não encontrado.' })

    const ids = new Set<string>([project.client_id])
    if (project.architect_id) ids.add(project.architect_id)
    const nameById = new Map<string, string>()
    if (ids.size > 0) {
      const { data: clients } = await sb.from('clients').select('id,full_name').in('id', [...ids])
      clients?.forEach((c) => nameById.set(c.id, c.full_name))
    }

    const [files, events] = await Promise.all([
      sb.from('project_files').select('id,name,file_type,mime_type,created_at').eq('project_id', id).order('created_at', { ascending: true }),
      sb.from('project_events').select('id,title,scheduled_at,professional,notes').eq('project_id', id).order('scheduled_at', { ascending: true }),
    ])

    return {
      project: {
        ...project,
        client_name: nameById.get(project.client_id) ?? null,
        architect_name: project.architect_id ? (nameById.get(project.architect_id) ?? null) : null,
      },
      files: files.data ?? [],
      events: events.data ?? [],
    }
  })

  app.patch('/admin/projects/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const parsed = projectUpdateSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ message: 'Dados inválidos.' })
    const d = parsed.data
    const sb = getSupabaseAdmin()

    const payload: Record<string, unknown> = {}
    if (d.title !== undefined) payload.title = d.title
    if (d.status !== undefined) payload.status = d.status
    if (d.notes !== undefined) payload.notes = d.notes
    if (d.architectId !== undefined) payload.architect_id = d.architectId

    // Lê o estado atual antes do update (para só notificar quando o status mudar de fato)
    const { data: before } = await sb
      .from('projects')
      .select('status,client_id,title')
      .eq('id', id)
      .maybeSingle()
    if (!before) return reply.code(404).send({ message: 'Projeto não encontrado.' })

    const { data, error } = await sb.from('projects').update(payload).eq('id', id).select().maybeSingle()
    if (error) return reply.code(400).send({ message: error.message })
    if (!data) return reply.code(404).send({ message: 'Projeto não encontrado.' })

    // E-mail transacional: apenas quando o status MUDOU de fato → notifica o cliente dono
    if (d.status !== undefined && payload.status !== undefined && d.status !== before.status) {
      const { data: owner } = await sb
        .from('clients')
        .select('email,full_name')
        .eq('id', before.client_id)
        .maybeSingle()
      if (owner?.email) {
        sendProjectStatusEmail(owner, {
          projectTitle: data.title,
          statusLabel: projectStatusLabels[payload.status as keyof typeof projectStatusLabels] ?? String(payload.status),
        })
      }
    }

    return { project: data }
  })

  app.delete('/admin/projects/:id', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const sb = getSupabaseAdmin()
    const { data: files } = await sb.from('project_files').select('path').eq('project_id', id)
    if (files?.length) {
      await sb.storage
        .from('client-files')
        .remove(files.map((f) => f.path))
        .catch(() => {})
    }
    const { error } = await sb.from('projects').delete().eq('id', id)
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(204).send()
  })

  // =========================================================================
  // Arquivos do projeto (bucket privado client-files)
  // =========================================================================
  app.post<{ Body: { fileName: string; contentType?: string; fileType?: string } }>(
    '/admin/projects/:id/files/sign',
    { preHandler: adminGuard },
    async (req, reply) => {
      const { id } = req.params as { id: string }
      const { fileName, contentType = 'application/octet-stream', fileType = 'documento' } = req.body

      if (!fileName) return reply.code(400).send({ message: 'fileName é obrigatório.' })
      const fileTypeParsed = projectFileTypeEnum.safeParse(fileType)
      if (!fileTypeParsed.success) return reply.code(400).send({ message: 'Tipo de arquivo inválido.' })

      const sb = getSupabaseAdmin()

      // Garante que o projeto existe (evita URL assinada órfã + FK 500)
      const { data: project } = await sb.from('projects').select('id').eq('id', id).maybeSingle()
      if (!project) return reply.code(404).send({ message: 'Projeto não encontrado.' })

      const path = `projects/${id}/${Date.now()}-${safeFileName(fileName)}`
      const { data, error } = await sb.storage.from('client-files').createSignedUploadUrl(path)
      if (error || !data) {
        return reply.code(500).send({ message: error?.message ?? 'Erro ao assinar upload.' })
      }

      const { data: file, error: fileErr } = await sb
        .from('project_files')
        .insert({
          project_id: id,
          name: fileName,
          path: data.path,
          file_type: fileTypeParsed.data,
          mime_type: contentType,
          uploaded_by: (req as unknown as { admin?: { userId?: string } }).admin?.userId ?? null,
        })
        .select('id,name,file_type,mime_type,created_at')
        .single()
      if (fileErr) return reply.code(500).send({ message: fileErr.message })

      return { signedUrl: data.signedUrl, file }
    },
  )

  app.delete('/admin/projects/:id/files/:fileId', { preHandler: adminGuard }, async (req, reply) => {
    const { fileId } = req.params as { id: string; fileId: string }
    const sb = getSupabaseAdmin()
    const { data: file } = await sb.from('project_files').select('path').eq('id', fileId).maybeSingle()
    if (file) {
      await sb.storage.from('client-files').remove([file.path]).catch(() => {})
    }
    const { error } = await sb.from('project_files').delete().eq('id', fileId)
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(204).send()
  })

  // =========================================================================
  // Eventos (visitas técnicas)
  // =========================================================================
  app.post('/admin/projects/:id/events', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const parsed = projectEventInputSchema.safeParse(req.body)
    if (!parsed.success) return reply.code(400).send({ message: 'Dados inválidos.' })
    const d = parsed.data
    const sb = getSupabaseAdmin()

    const { data: proj } = await sb
      .from('projects')
      .select('id,title,client_id')
      .eq('id', id)
      .maybeSingle()
    if (!proj) return reply.code(404).send({ message: 'Projeto não encontrado.' })

    const { data, error } = await sb
      .from('project_events')
      .insert({
        project_id: id,
        title: d.title,
        scheduled_at: new Date(d.scheduledAt).toISOString(),
        professional: d.professional,
        notes: d.notes ?? null,
      })
      .select()
      .single()
    if (error) return reply.code(400).send({ message: error.message })

    // E-mail transacional: visita agendada → notifica o cliente dono
    const { data: owner } = await sb
      .from('clients')
      .select('email,full_name')
      .eq('id', proj.client_id)
      .maybeSingle()
    if (owner?.email) {
      sendVisitScheduledEmail(owner, {
        projectTitle: proj.title,
        title: d.title,
        scheduledAt: data.scheduled_at,
        professional: d.professional,
        notes: d.notes ?? null,
      })
    }

    return reply.code(201).send({ event: data })
  })

  app.delete('/admin/projects/:id/events/:eventId', { preHandler: adminGuard }, async (req, reply) => {
    const { eventId } = req.params as { id: string; eventId: string }
    const sb = getSupabaseAdmin()
    const { error } = await sb.from('project_events').delete().eq('id', eventId)
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(204).send()
  })

  // =========================================================================
  // Acesso do cliente (ativação por telefone/WhatsApp — pendência do plano)
  // =========================================================================
  app.post('/admin/clients/:id/send-access', { preHandler: adminGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const sb = getSupabaseAdmin()

    const { data: client, error: clientErr } = await sb
      .from('clients')
      .select('id,auth_user_id,email,full_name')
      .eq('id', id)
      .maybeSingle()
    if (clientErr) return reply.code(500).send({ message: clientErr.message })
    if (!client) return reply.code(400).send({ message: 'Cliente não encontrado.' })
    if (!client.email) return reply.code(400).send({ message: 'Cliente sem e-mail cadastrado.' })

    // 1) Conta já existe → link de recuperação (NUNCA troca a senha escolhida pelo cliente)
    if (client.auth_user_id) {
      const { data: linkData, error: linkErr } = await sb.auth.admin.generateLink({
        type: 'recovery',
        email: client.email,
      })
      if (linkErr || !linkData?.properties?.action_link) {
        return reply.code(500).send({ message: linkErr?.message ?? 'Erro ao gerar link de recuperação.' })
      }
      sendAccountRecoveryEmail(client, { recoveryLink: linkData.properties.action_link })
      return { ok: true, message: 'Conta já existente — link de recuperação de senha enviado por e-mail.' }
    }

    // 2) Sem conta: tenta criar (acesso imediato, sem confirmação manual)
    const { data: user, error: createErr } = await sb.auth.admin.createUser({
      email: client.email,
      email_confirm: true,
      user_metadata: { full_name: client.full_name, role: 'client' },
    })
    if (createErr || !user.user) {
      // E-mail já registrado em Auth sem vínculo em clients → usa recuperação
      const { data: linkData, error: linkErr } = await sb.auth.admin.generateLink({
        type: 'recovery',
        email: client.email,
      })
      if (!linkErr && linkData?.properties?.action_link) {
        sendAccountRecoveryEmail(client, { recoveryLink: linkData.properties.action_link })
        return { ok: true, message: 'E-mail já cadastrado — link de recuperação enviado.' }
      }
      return reply.code(400).send({ message: createErr?.message ?? 'Erro ao criar a conta.' })
    }

    const authUserId = user.user.id
    await sb.from('clients').update({ auth_user_id: authUserId }).eq('id', id)

    // 3) Conta nova: senha temporária forte e envio por e-mail
    const temporaryPassword = `PS-${crypto.randomUUID().slice(0, 10)}!${Date.now().toString(36).slice(-4)}`
    const { error: passErr } = await sb.auth.admin.updateUserById(authUserId, { password: temporaryPassword })
    if (passErr) {
      // Senha não aplicada — não anuncia uma senha que não existe
      return reply.code(500).send({ message: 'Conta criada, mas falha ao definir a senha. Tente novamente.' })
    }
    sendAccountAccessEmail(client, { temporaryPassword })

    return { ok: true, message: 'Acesso criado. O cliente recebeu a senha temporária por e-mail.' }
  })
}
