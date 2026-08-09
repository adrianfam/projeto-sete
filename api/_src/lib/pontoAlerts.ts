import { getSupabaseAdmin } from './supabaseAdmin'

export interface DailyMissing {
  employeeId: string
  name: string
  matricula: number
  issue: 'Sem entrada' | 'Sem saída'
}

/**
 * Lista colaboradores ativos com pendência de ponto no dia atual:
 * - sem nenhum registro → "Sem entrada"
 * - com entrada mas sem saída → "Sem saída"
 */
export async function buildDailyMissingList(): Promise<DailyMissing[]> {
  const sb = getSupabaseAdmin()
  // Dia LOCAL (ex.: Fortaleza/UTC-3) convertido para limites UTC ISO — mesma
  // definição de "Hoje" usada na tela do admin, para o e-mail nunca divergir.
  const now = new Date()
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const dayEnd = new Date(dayStart.getTime() + 86_400_000 - 1)

  const [empsRes, recsRes] = await Promise.all([
    sb.from('employees').select('id,full_name,matricula,is_active').eq('is_active', true),
    sb
      .from('time_records')
      .select('employee_id,record_type')
      .gte('recorded_at', dayStart.toISOString())
      .lte('recorded_at', dayEnd.toISOString()),
  ])

  const employees = empsRes.data ?? []
  const records = recsRes.data ?? []

  const missing: DailyMissing[] = []
  for (const emp of employees) {
    const empRecords = records.filter((r) => r.employee_id === emp.id)
    const hasEntry = empRecords.some((r) => r.record_type === 'entrada')
    const hasExit = empRecords.some((r) => r.record_type === 'saida')
    if (!hasEntry) {
      missing.push({ employeeId: emp.id, name: emp.full_name, matricula: emp.matricula, issue: 'Sem entrada' })
    } else if (!hasExit) {
      missing.push({ employeeId: emp.id, name: emp.full_name, matricula: emp.matricula, issue: 'Sem saída' })
    }
  }
  return missing
}

/** Formata o dia atual em pt-BR (ex.: "domingo, 9 de agosto de 2026"). */
export function todayLabel(): string {
  try {
    return new Date().toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return new Date().toISOString().slice(0, 10)
  }
}
