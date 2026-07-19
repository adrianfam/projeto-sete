import { z } from 'zod'

export const recordTypeEnum = z.enum(['entrada', 'almoco_ida', 'almoco_volta', 'saida'])
export type RecordType = z.infer<typeof recordTypeEnum>

export const employeeInputSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(10).max(15),
  role: z.string().min(2).max(80),
  birthDate: z.string().min(10).max(10), // YYYY-MM-DD
})
export type EmployeeInput = z.infer<typeof employeeInputSchema>

export const employeeUpdateSchema = employeeInputSchema.partial().extend({
  isActive: z.boolean().optional(),
})
export type EmployeeUpdate = z.infer<typeof employeeUpdateSchema>

export const timeRecordInputSchema = z.object({
  employeeId: z.string().uuid(),
  recordType: recordTypeEnum,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
})
export type TimeRecordInput = z.infer<typeof timeRecordInputSchema>

export const pontoLoginSchema = z.object({
  matricula: z.number().int().positive(),
  pin: z.string().length(4).regex(/^\d{4}$/, 'PIN deve ter exatamente 4 dígitos numéricos'),
})
export type PontoLogin = z.infer<typeof pontoLoginSchema>

