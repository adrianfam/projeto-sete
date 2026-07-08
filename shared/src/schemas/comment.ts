import { z } from 'zod'

/** Envio público de comentário (anônimo, moderado). */
export const commentInputSchema = z.object({
  authorName: z.string().trim().min(2).max(80),
  authorEmail: z.string().trim().email().max(160),
  body: z.string().trim().min(2).max(2000),
  parentId: z.string().uuid().optional().nullable(),
  // Honeypot: campo que bots preenchem — deve chegar vazio.
  website: z.string().max(0).optional().or(z.literal('')).optional(),
})
export type CommentInput = z.infer<typeof commentInputSchema>

export const commentStatusSchema = z.enum(['pending', 'approved', 'rejected', 'spam'])
export type CommentStatus = z.infer<typeof commentStatusSchema>

export const commentModerationSchema = z.object({
  status: commentStatusSchema,
})
