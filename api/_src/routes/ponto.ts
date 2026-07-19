import { createHash } from 'node:crypto'
import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { pontoLoginSchema, timeRecordInputSchema } from '@projeto-sete/shared'

// ---------------------------------------------------------------------------
// Rate limiter simples para /ponto/login (em memória)
// ---------------------------------------------------------------------------
interface LoginAttempt {
  count: number
  lastAttempt: number
  blockedUntil: number | null
}

const loginAttempts = new Map<string, LoginAttempt>()

const MAX_FAILED = 5            // bloqueia após N tentativas falhas
const WINDOW_MS = 15 * 60_000   // janela de contagem (15 min)
const BLOCK_MS = 30 * 60_000    // duração do bloqueio (30 min)
const DELAY_BASE_MS = 500       // delay progressivo por tentativa

function checkLoginRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = loginAttempts.get(ip)

  if (entry) {
    // Se está bloqueado, verifica se o bloqueio expirou
    if (entry.blockedUntil && now < entry.blockedUntil) {
      const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000)
      return { allowed: false, retryAfter }
    }

    // Se a janela expirou, reseta o contador
    if (now - entry.lastAttempt > WINDOW_MS) {
      loginAttempts.set(ip, { count: 0, lastAttempt: now, blockedUntil: null })
    }
  }
  return { allowed: true }
}

function recordFailedLogin(ip: string) {
  const now = Date.now()
  const entry = loginAttempts.get(ip)

  if (entry && now - entry.lastAttempt <= WINDOW_MS) {
    entry.count += 1
    entry.lastAttempt = now

    if (entry.count >= MAX_FAILED) {
      entry.blockedUntil = now + BLOCK_MS
    }
  } else {
    loginAttempts.set(ip, { count: 1, lastAttempt: now, blockedUntil: null })
  }
}

function resetLoginRateLimit(ip: string) {
  loginAttempts.delete(ip)
}

function getFailedCount(ip: string): number {
  return loginAttempts.get(ip)?.count ?? 0
}

// Delay progressivo: a cada tentativa falha, aumenta o tempo de resposta
function progressiveDelay(failedCount: number): Promise<void> {
  if (failedCount < 3) return Promise.resolve()
  const delay = Math.min(DELAY_BASE_MS * (failedCount - 2), 3000)
  return new Promise((r) => setTimeout(r, delay))
}

// ---------------------------------------------------------------------------
// Idempotência para /ponto/register
// ---------------------------------------------------------------------------
type RecordType = 'entrada' | 'almoco_ida' | 'almoco_volta' | 'saida'

/** Valida o registro — apenas evita duplicatas rápidas (30s). 
 *  NÃO bloqueia a ordem do fluxo.
 *  O colaborador pode registrar qualquer tipo a qualquer momento. */
async function checkIdempotency(
  sb: ReturnType<typeof getSupabaseAdmin>,
  employeeId: string,
  recordType: RecordType,
): Promise<{ ok: boolean; message?: string }> {
  const today = new Date().toISOString().slice(0, 10)
  const { data: records, error } = await sb
    .from('time_records')
    .select('record_type, recorded_at')
    .eq('employee_id', employeeId)
    .gte('recorded_at', today)
    .order('recorded_at', { ascending: false })
    .limit(1)

  if (error) return { ok: false, message: 'Erro ao verificar registro anterior.' }

  // O primeiro registro do dia deve ser 'entrada' (lógico)
  if (!records || records.length === 0) {
    if (recordType === 'entrada') return { ok: true }
    return { ok: false, message: 'O primeiro registro do dia deve ser Entrada.' }
  }

  // Proteção anti-duplicata: mesmo tipo nos últimos 30 segundos
  const lastRecord = records[0]
  const lastTime = new Date(lastRecord.recorded_at).getTime()
  const now = Date.now()
  if (now - lastTime < 30_000 && lastRecord.record_type === recordType) {
    return { ok: false, message: 'Este registro já foi realizado. Aguarde 30 segundos.' }
  }

  return { ok: true }
}

function hashPin(pin: string): string {
  return createHash('sha256').update(pin).digest('hex')
}

/** Status atual do colaborador com base nos registros do dia. */
function inferStatus(records: { record_type: string }[]): {
  status: 'not_started' | 'working' | 'lunch' | 'back_from_lunch' | 'finished' | 'overtime'
  label: string
  color: 'green' | 'yellow' | 'red'
} {
  if (records.length === 0) {
    return { status: 'not_started', label: 'Registrar Entrada', color: 'green' }
  }

  const last = records[records.length - 1].record_type
  const secondLast = records.length > 1 ? records[records.length - 2].record_type : null

  // Modo hora extra: último foi 'entrada' e penúltimo foi 'saida'
  if (last === 'entrada' && secondLast === 'saida') {
    return { status: 'overtime', label: 'Hora Extra - Registrar Saída', color: 'yellow' }
  }

  switch (last) {
    case 'entrada':
      return { status: 'working', label: 'Iniciar Almoço', color: 'yellow' }
    case 'almoco_ida':
      return { status: 'lunch', label: 'Voltar do Almoço', color: 'green' }
    case 'almoco_volta':
      return { status: 'back_from_lunch', label: 'Registrar Saída', color: 'red' }
    case 'saida':
      return { status: 'finished', label: 'Hora Extra? Registrar Entrada', color: 'yellow' }
    default:
      return { status: 'not_started', label: 'Registrar Entrada', color: 'green' }
  }
}

export const pontoRoutes: FastifyPluginAsync = async (app) => {
  // Login do colaborador (com rate limit)
  app.post<{ Body: { matricula: number; pin: string } }>(
    '/ponto/login',
    async (req, reply) => {
      // Rate limit por IP
      const ip = req.ip
      const limit = checkLoginRateLimit(ip)
      if (!limit.allowed) {
        const retryAfter = limit.retryAfter ?? 0
        reply.header('Retry-After', String(retryAfter))
        return reply.code(429).send({
          message: `Muitas tentativas. Tente novamente em ${Math.ceil(retryAfter / 60)} minutos.`,
        })
      }

      const parsed = pontoLoginSchema.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({
          message: 'Matrícula ou PIN inválidos. Verifique e tente novamente.',
        })
      }
      const { matricula, pin } = parsed.data

      // Delay progressivo com base no número de tentativas falhas
      const failedCount = getFailedCount(ip)
      await progressiveDelay(failedCount)

      const sb = getSupabaseAdmin()
      const { data, error } = await sb
        .from('employees')
        .select('id,full_name,matricula,pin_hash,is_active')
        .eq('matricula', matricula)
        .maybeSingle()
      if (error || !data) {
        recordFailedLogin(ip)
        return reply.code(401).send({
          message: 'Matrícula não encontrada. Confira o número com o administrador.',
        })
      }
      if (!data.is_active) {
        recordFailedLogin(ip)
        return reply.code(401).send({
          message: 'Seu cadastro está inativo. Procure o administrador.',
        })
      }
      if (data.pin_hash !== hashPin(pin)) {
        recordFailedLogin(ip)
        return reply.code(401).send({
          message: 'PIN incorreto. Tente novamente.',
        })
      }
      // Login bem-sucedido: reseta o contador de tentativas
      resetLoginRateLimit(ip)

      // Retorna dados básicos do colaborador
      return {
        employee: {
          id: data.id,
          fullName: data.full_name,
          matricula: data.matricula,
        },
      }
    },
  )

  // Status atual do colaborador (qual botão mostrar)
  // Auth: envia employee.id no header Authorization como Bearer token
  app.get<{ Headers: { authorization?: string } }>(
    '/ponto/status',
    async (req, reply) => {
      const bearer = req.headers.authorization
      if (!bearer?.startsWith('Bearer ')) {
        return reply.code(401).send({ message: 'Colaborador não informado.' })
      }
      const empId = bearer.slice(7)
      // Verifica se o funcionário existe
      const sb = getSupabaseAdmin()
      const { data: emp } = await sb.from('employees').select('id').eq('id', empId).maybeSingle()
      if (!emp) return reply.code(401).send({ message: 'Colaborador não encontrado.' })

      const today = new Date().toISOString().slice(0, 10)
      const { data: records, error } = await sb
        .from('time_records')
        .select('record_type')
        .eq('employee_id', empId)
        .gte('recorded_at', today)
        .lt('recorded_at', today + 'T23:59:59.999Z')
        .order('recorded_at', { ascending: true })
      if (error) {
        return reply.code(500).send({ message: 'Erro ao buscar registro. Tente novamente.' })
      }
      const status = inferStatus(records ?? [])
      return status
    },
  )

  // Extrato mensal do colaborador (auth via Bearer token)
  app.get<{ Headers: { authorization?: string } }>(
    '/ponto/records',
    async (req, reply) => {
      const bearer = req.headers.authorization
      if (!bearer?.startsWith('Bearer ')) {
        return reply.code(401).send({ message: 'Colaborador não informado.' })
      }
      const empId = bearer.slice(7)
      const query = req.query as { month?: string }
      // Mês no formato YYYY-MM, default = mês atual
      const month = query.month ?? new Date().toISOString().slice(0, 7)
      const [y, m] = month.split('-').map(Number)
      const startDate = month + '-01'
      const nextMonth = new Date(y, m, 1).toISOString() // primeiro dia do próximo mês

      const sb = getSupabaseAdmin()
      const { data: records, error } = await sb
        .from('time_records')
        .select('id,record_type,latitude,longitude,recorded_at')
        .eq('employee_id', empId)
        .gte('recorded_at', startDate)
        .lt('recorded_at', nextMonth)
        .order('recorded_at', { ascending: true })
      if (error) {
        return reply.code(500).send({ message: 'Erro ao buscar registros.' })
      }
      return { items: records ?? [], month }
    },
  )

  // Registrar ponto (auth via employee-id no header, com idempotência)
  app.post<{ Body: TimeRecordInputRequest; Headers: { 'x-employee-id'?: string } }>(
    '/ponto/register',
    async (req, reply) => {
      const empId = req.headers['x-employee-id']
      if (!empId) return reply.code(401).send({ message: 'Colaborador não informado.' })

      const parsed = timeRecordInputSchema.safeParse(req.body)
      if (!parsed.success) {
        return reply.code(400).send({
          message: 'Dados inválidos. Verifique as informações e tente novamente.',
        })
      }

      // Verifica se o employeeId do body corresponde ao header
      if (parsed.data.employeeId !== empId) {
        return reply.code(403).send({ message: 'Colaborador não autorizado.' })
      }

      const { employeeId, recordType, latitude, longitude } = parsed.data

      // Idempotência: verifica fluxo e evita duplicatas rápidas
      const sb = getSupabaseAdmin()
      const idemp = await checkIdempotency(sb, employeeId, recordType)
      if (!idemp.ok) {
        return reply.code(409).send({ message: idemp.message })
      }

      const { error } = await sb.from('time_records').insert({
        employee_id: employeeId,
        record_type: recordType,
        latitude,
        longitude,
      })
      if (error) {
        return reply.code(500).send({
          message: 'Não foi possível registrar o ponto. Tente novamente em instantes.',
        })
      }
      return reply.code(201).send({ success: true })
    },
  )


}

interface TimeRecordInputRequest {
  employeeId: string
  recordType: 'entrada' | 'almoco_ida' | 'almoco_volta' | 'saida'
  latitude: number
  longitude: number
}
