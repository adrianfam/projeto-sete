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

/** Status do atendimento (caixa de entrada do admin). */
export const contactStatusEnum = z.enum(['new', 'read', 'replied', 'archived'])
export type ContactStatus = z.infer<typeof contactStatusEnum>

export const contactStatusLabels: Record<ContactStatus, string> = {
  new: 'Novo',
  read: 'Lido',
  replied: 'Respondido',
  archived: 'Arquivado',
}

/** Linha de contact_submissions exposta ao cliente (sem ip/user_agent). */
export const contactSubmissionSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string(),
  phone: z.string().nullable(),
  subject: z.string().nullable(),
  message: z.string(),
  status: contactStatusEnum,
  created_at: z.string(),
})
export type ContactSubmission = z.infer<typeof contactSubmissionSchema>
