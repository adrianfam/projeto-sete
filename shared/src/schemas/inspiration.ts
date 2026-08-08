import { z } from 'zod'

/** Fonte da inspiração: item do portfólio ou post do Instagram. */
export const inspirationSourceEnum = z.enum(['portfolio', 'instagram'])
export type InspirationSource = z.infer<typeof inspirationSourceEnum>

/** Entrada para salvar/remover um favorito na Pasta de Inspirações. */
export const clientInspirationSchema = z.object({
  sourceType: inspirationSourceEnum,
  sourceId: z.string().min(1).max(64),
  note: z.string().max(300).optional().nullable(),
})
export type ClientInspirationInput = z.infer<typeof clientInspirationSchema>
