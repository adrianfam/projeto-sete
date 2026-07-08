import { z } from 'zod'

export const portfolioCategorySchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, 'slug deve conter apenas letras minúsculas, números e hífens'),
  name: z.string().min(2).max(60),
  position: z.number().int().default(0),
})
export type PortfolioCategory = z.infer<typeof portfolioCategorySchema>

export const projectTypeEnum = z.enum(['residencial', 'comercial', 'corporativo', 'especial'])
export type ProjectType = z.infer<typeof projectTypeEnum>

export const mediaItemSchema = z.object({
  type: z.enum(['image', 'video']),
  url: z.string().url(),
  thumb: z.string().url().optional(),
  alt: z.string().default(''),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
})
export type MediaItem = z.infer<typeof mediaItemSchema>

/** Schema usado no formulário admin e validado pela API. */
export const portfolioItemInputSchema = z.object({
  title: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  summary: z.string().max(300).optional().nullable(),
  description: z.string().max(20000).optional().nullable(),
  categoryId: z.string().uuid().optional().nullable(),
  projectType: projectTypeEnum.optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  year: z.number().int().min(1990).max(2100).optional().nullable(),
  areaM2: z.number().positive().optional().nullable(),
  media: z.array(mediaItemSchema).default([]),
  coverImageUrl: z.string().url().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
  position: z.number().int().default(0),
})
export type PortfolioItemInput = z.infer<typeof portfolioItemInputSchema>

export const portfolioQuerySchema = z.object({
  category: z.string().optional(),
  projectType: projectTypeEnum.optional(),
  featured: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((v) => v === true || v === 'true'),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})
export type PortfolioQuery = z.infer<typeof portfolioQuerySchema>
