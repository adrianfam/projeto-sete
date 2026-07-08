import { z } from 'zod'
import { mediaItemSchema } from './portfolio'

export const caseResultSchema = z.object({
  metric: z.string().max(40),
  label: z.string().max(120),
})
export type CaseResult = z.infer<typeof caseResultSchema>

export const caseStudyInputSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z.string().min(2).max(120).regex(/^[a-z0-9-]+$/),
  client: z.string().max(120).optional().nullable(),
  category: z.string().max(80).optional().nullable(),
  challenge: z.string().max(20000).optional().nullable(),
  process: z.string().max(20000).optional().nullable(),
  results: z.array(caseResultSchema).default([]),
  gallery: z.array(mediaItemSchema).default([]),
  coverImageUrl: z.string().url().optional().nullable(),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
})
export type CaseStudyInput = z.infer<typeof caseStudyInputSchema>
