/** Converte chaves camelCase para snake_case (compatível com colunas do Postgres). */
export function toSnake<T extends object>(obj: T): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    const key = k.replace(/[A-Z]/g, (m) => '_' + m.toLowerCase())
    if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
      out[key] = toSnake(v as object)
    } else {
      out[key] = v
    }
  }
  return out
}
