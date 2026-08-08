import { z } from 'zod'

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const clientTypeEnum = z.enum(['final', 'architect'])
export type ClientType = z.infer<typeof clientTypeEnum>

export const clientStatusEnum = z.enum(['lead', 'active'])
export type ClientStatus = z.infer<typeof clientStatusEnum>

export const projectStatusEnum = z.enum([
  'analise',
  'orcamento_enviado',
  'medicao',
  'fabricacao',
  'transporte',
  'montagem',
  'finalizado',
])
export type ProjectStatus = z.infer<typeof projectStatusEnum>

export const projectFileTypeEnum = z.enum(['documento', 'pdf_tecnico', 'render', 'contrato', 'manual'])
export type ProjectFileType = z.infer<typeof projectFileTypeEnum>

/** Ordem da linha do tempo do projeto (do início ao fim). */
export const projectStatusOrder: ProjectStatus[] = [
  'analise',
  'orcamento_enviado',
  'medicao',
  'fabricacao',
  'transporte',
  'montagem',
  'finalizado',
]

export const projectStatusLabels: Record<ProjectStatus, string> = {
  analise: 'Em Análise',
  orcamento_enviado: 'Orçamento Enviado',
  medicao: 'Medição Agendada',
  fabricacao: 'Em Fabricação',
  transporte: 'Em Transporte',
  montagem: 'Montagem Iniciada',
  finalizado: 'Finalizado',
}

export const propertyPhaseOptions = [
  { value: 'na_planta', label: 'Na planta' },
  { value: 'em_obras', label: 'Em obras' },
  { value: 'pronto_mobiliar', label: 'Pronto para mobiliar' },
  { value: 'quero_reformar', label: 'Quero reformar' },
] as const

export const roomOptions = [
  'Cozinha',
  'Closet',
  'Sala',
  'Banheiro',
  'Home Office',
  'Outros',
] as const

export const annualVolumeOptions = [
  { value: '1-5', label: '1 a 5 projetos/ano' },
  { value: '6-10', label: '6 a 10 projetos/ano' },
  { value: '11-20', label: '11 a 20 projetos/ano' },
  { value: '20+', label: 'Mais de 20 projetos/ano' },
] as const

// ---------------------------------------------------------------------------
// Perfil do cliente (cadastro no /cliente e criação pelo admin)
// ---------------------------------------------------------------------------
export const clientProfileSchema = z.object({
  clientType: clientTypeEnum,
  fullName: z.string().trim().min(2).max(120),
  whatsapp: z
    .string()
    .trim()
    .max(20)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  preferMessages: z.boolean().optional().default(false),
  // Cliente final
  city: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  neighborhood: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  propertyPhase: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  deliveryDate: z
    .string()
    .trim()
    .max(20)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  rooms: z.array(z.string().trim().max(40)).max(12).optional().default([]),
  // Arquiteto
  professionalReg: z
    .string()
    .trim()
    .max(60)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  officeName: z
    .string()
    .trim()
    .max(120)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  portfolioUrl: z
    .string()
    .trim()
    .max(300)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  annualVolume: z
    .string()
    .trim()
    .max(20)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
})
export type ClientProfile = z.infer<typeof clientProfileSchema>

/** Criação de cliente pelo admin (perfil + e-mail opcional). */
export const clientAdminInputSchema = clientProfileSchema.extend({
  email: z
    .string()
    .trim()
    .email()
    .max(160)
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
})
export type ClientAdminInput = z.infer<typeof clientAdminInputSchema>

/** Atualização pelo admin (parcial + status). */
export const clientUpdateSchema = clientProfileSchema.partial().extend({
  status: clientStatusEnum.optional(),
})
export type ClientUpdate = z.infer<typeof clientUpdateSchema>

// ---------------------------------------------------------------------------
// Projetos
// ---------------------------------------------------------------------------
export const projectInputSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().trim().min(2).max(160),
  architectId: z.string().uuid().nullable().optional(),
  notes: z.string().trim().max(2000).optional().nullable(),
})
export type ProjectInput = z.infer<typeof projectInputSchema>

export const projectUpdateSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  status: projectStatusEnum.optional(),
  architectId: z.string().uuid().nullable().optional(),
  notes: z.string().trim().max(2000).nullable().optional(),
})
export type ProjectUpdate = z.infer<typeof projectUpdateSchema>

// ---------------------------------------------------------------------------
// Eventos (visitas técnicas)
// ---------------------------------------------------------------------------
export const projectEventInputSchema = z.object({
  title: z.string().trim().min(2).max(120),
  scheduledAt: z.string().refine((v) => !Number.isNaN(Date.parse(v)), 'Data inválida'),
  professional: z.string().trim().min(2).max(120),
  notes: z.string().trim().max(1000).optional().nullable(),
})
export type ProjectEventInput = z.infer<typeof projectEventInputSchema>
