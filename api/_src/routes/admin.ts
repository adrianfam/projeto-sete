import { createHash } from 'node:crypto'
import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { requireAdmin } from '../lib/auth'

/** /api/auth/me + /api/admin/metrics */
export const adminRoutes: FastifyPluginAsync = async (app) => {
  app.get('/auth/me', async (req, reply) => {
    const session = await requireAdmin(req)
    if (!session) return reply.code(401).send({ message: 'Não autorizado.' })
    return { user: { id: session.userId, email: session.email, role: session.role } }
  })

  app.get('/admin/metrics', { preHandler: requireAdminAndGuard }, async (_req, reply) => {
    const sb = getSupabaseAdmin()
    const today = new Date().toISOString().slice(0, 10)
    const [posts, comments, portfolio, contact, activeEmployees, todayRecords] = await Promise.all([
      sb.from('blog_posts').select('id', { count: 'exact', head: true }).eq('is_published', true).is('deleted_at', null),
      sb.from('comments').select('id', { count: 'exact', head: true }).eq('status', 'pending').is('deleted_at', null),
      sb.from('portfolio_items').select('id', { count: 'exact', head: true }).eq('is_published', true).is('deleted_at', null),
      sb.from('contact_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
      sb.from('employees').select('id', { count: 'exact', head: true }).eq('is_active', true),
      sb.from('time_records').select('id', { count: 'exact', head: true }).gte('recorded_at', today).lt('recorded_at', today + 'T23:59:59.999Z'),
    ])
    return {
      publishedPosts: posts.count ?? 0,
      pendingComments: comments.count ?? 0,
      portfolioItems: portfolio.count ?? 0,
      newMessages: contact.count ?? 0,
      activeEmployees: activeEmployees.count ?? 0,
      todayRecords: todayRecords.count ?? 0,
    }
  })

  // Caixa de entrada do formulário de contato.
  app.get('/admin/contact', { preHandler: requireAdminAndGuard }, async (req, reply) => {
    const status = (req.query as { status?: string }).status ?? 'new'
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('contact_submissions')
      .select('id,name,email,phone,subject,message,status,created_at')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(100)
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  // --- Employees (colaboradores) ---
  app.get('/admin/employees', { preHandler: requireAdminAndGuard }, async (_req, reply) => {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('employees')
      .select('id,matricula,full_name,phone,role,birth_date,is_active,created_at')
      .order('full_name', { ascending: true })
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  app.post('/admin/employees', { preHandler: requireAdminAndGuard }, async (req, reply) => {
    const { fullName, phone, role, birthDate } = req.body as {
      fullName: string
      phone: string
      role: string
      birthDate: string
    }
    if (!fullName || !phone || !role || !birthDate) {
      return reply.code(400).send({ message: 'Preencha todos os campos obrigatórios.' })
    }
    const sb = getSupabaseAdmin()
    // Gera PIN aleatório de 4 dígitos
    const pin = String(Math.floor(1000 + Math.random() * 9000))
    const pinHash = createHash('sha256').update(pin).digest('hex')
    const { data, error } = await sb
      .from('employees')
      .insert({
        full_name: fullName,
        phone,
        role,
        birth_date: birthDate,
        pin_hash: pinHash,
      })
      .select('id,matricula,full_name,phone,role,birth_date')
      .single()
    if (error) return reply.code(400).send({ message: error.message })
    // Retorna o PIN gerado (única vez que fica visível)
    return reply.code(201).send({ employee: data, generatedPin: pin })
  })

  app.patch('/admin/employees/:id', { preHandler: requireAdminAndGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = req.body as Record<string, unknown>
    const sb = getSupabaseAdmin()
    const payload: Record<string, unknown> = {}
    if (typeof body.fullName === 'string') payload.full_name = body.fullName
    if (typeof body.phone === 'string') payload.phone = body.phone
    if (typeof body.role === 'string') payload.role = body.role
    if (typeof body.birthDate === 'string') payload.birth_date = body.birthDate
    if (typeof body.isActive === 'boolean') payload.is_active = body.isActive
    let newPin: string | null = null
    if (body.resetPin === true) {
      newPin = String(Math.floor(1000 + Math.random() * 9000))
      payload.pin_hash = createHash('sha256').update(newPin).digest('hex')
    }
    const { data, error } = await sb
      .from('employees')
      .update(payload)
      .eq('id', id)
      .select('id,matricula,full_name,phone,role,birth_date,is_active')
      .maybeSingle()
    if (error) return reply.code(400).send({ message: error.message })
    if (!data) return reply.code(404).send({ message: 'Colaborador não encontrado.' })
    const result: Record<string, unknown> = { employee: data }
    if (newPin) {
      result.generatedPin = newPin
    }
    return result
  })

  // Histórico de pontos
  app.get('/admin/time-records', { preHandler: requireAdminAndGuard }, async (req, reply) => {
    const sb = getSupabaseAdmin()
    const query = req.query as { employee_id?: string; date_from?: string; date_to?: string; limit?: string }
    let q = sb
      .from('time_records')
      .select('id,employee_id,record_type,latitude,longitude,recorded_at')
      .order('recorded_at', { ascending: false })
      .limit(Number(query.limit) || 500)
    if (query.employee_id) q = q.eq('employee_id', query.employee_id)
    if (query.date_from) q = q.gte('recorded_at', query.date_from)
    if (query.date_to) q = q.lte('recorded_at', query.date_to + 'T23:59:59.999Z')
    const { data, error } = await q
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  // Relatório diário consolidado (admin dashboard)
  app.get('/admin/time-records/daily', { preHandler: requireAdminAndGuard }, async (_req, reply) => {
    const sb = getSupabaseAdmin()
    const today = new Date().toISOString().slice(0, 10)
    const { data, error } = await sb
      .from('time_records')
      .select('id,employee_id,record_type,latitude,longitude,recorded_at')
      .gte('recorded_at', today)
      .lt('recorded_at', today + 'T23:59:59.999Z')
      .order('recorded_at', { ascending: false })
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  // Lista todos os assets de mídia (upload ledger).
  app.get('/admin/media', { preHandler: requireAdminAndGuard }, async (_req, reply) => {
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('media_assets')
      .select('id,path,bucket,url,mime_type,bytes,width,height,alt,uploaded_by,created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) return reply.code(500).send({ message: error.message })
    return { items: data ?? [] }
  })

  // Deleta um asset de mídia (storage + ledger).
  app.delete('/admin/media/:id', { preHandler: requireAdminAndGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const sb = getSupabaseAdmin()

    // Busca o registro para saber o path no storage
    const { data: asset, error: fetchErr } = await sb
      .from('media_assets')
      .select('bucket,path')
      .eq('id', id)
      .maybeSingle()
    if (fetchErr) return reply.code(500).send({ message: fetchErr.message })
    if (!asset) return reply.code(404).send({ message: 'Asset não encontrado.' })

    // Remove do storage (ignora erro se o arquivo já não existir)
    await sb.storage.from(asset.bucket).remove([asset.path]).catch(() => {})

    // Remove o registro
    const { error } = await sb.from('media_assets').delete().eq('id', id)
    if (error) return reply.code(400).send({ message: error.message })
    return reply.code(204).send()
  })

  // Marca mensagem (lida/respondida/arquivada).
  app.patch('/admin/contact/:id', { preHandler: requireAdminAndGuard }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const body = req.body as { status?: string }
    if (!body?.status) return reply.code(400).send({ message: 'status obrigatório.' })
    const sb = getSupabaseAdmin()
    const { data, error } = await sb
      .from('contact_submissions')
      .update({ status: body.status })
      .eq('id', id)
      .select()
      .maybeSingle()
    if (error) return reply.code(400).send({ message: error.message })
    if (!data) return reply.code(404).send({ message: 'Mensagem não encontrada.' })
    return { submission: data }
  })
}

async function requireAdminAndGuard(req: import('fastify').FastifyRequest, reply: import('fastify').FastifyReply) {
  const session = await requireAdmin(req)
  if (!session) return reply.code(401).send({ message: 'Não autorizado.' })
}
