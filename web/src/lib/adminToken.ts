import { z } from 'zod'

/** Mantém os tipos do token de admin em memória (fora do Zustand por simplicidade). */
const tokenStore = { token: null as string | null }

export function setAdminToken(t: string | null) {
  tokenStore.token = t
}
export function getAdminToken(): string | null {
  return tokenStore.token
}

/** Helper de Zod para payloads de erro padrão da API. */
export const apiErrorSchema = z.object({ message: z.string() })
