import { z } from 'zod'

export const testimonialInputSchema = z.object({
  author: z.string().min(2).max(120),
  role: z.string().max(120).optional().nullable(),
  company: z.string().max(120).optional().nullable(),
  quote: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5).default(5),
  avatarUrl: z.string().url().optional().nullable(),
  isPublished: z.boolean().default(false),
  position: z.number().int().default(0),
})
export type TestimonialInput = z.infer<typeof testimonialInputSchema>
