import { z } from 'zod'

/** Formulário de contato público (validado no front e na API). */
export const contactInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  subject: z.string().trim().max(160).optional().nullable().transform((v) => (v === '' ? null : v)),
  message: z.string().trim().min(10).max(4000),
  // Honeypot
  website: z.string().max(0).optional().or(z.literal('')).optional(),
})
export type ContactInput = z.infer<typeof contactInputSchema>
