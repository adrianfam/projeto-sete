import { z } from 'zod'

export const blogPostInputSchema = z.object({
  title: z.string().min(2).max(160),
  slug: z.string().min(2).max(160).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(400).optional().nullable(),
  body: z.string().min(1).max(50000),
  coverImageUrl: z.string().url().optional().nullable(),
  coverAlt: z.string().max(200).optional().nullable(),
  readingMinutes: z.number().int().min(1).max(300).optional(),
  tags: z.array(z.string().max(40)).max(12).default([]),
  author: z.string().max(120).default('Felipe Amorim'),
  authorAvatarUrl: z.string().url().optional().nullable(),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
  seo: z
    .object({
      title: z.string().max(160).optional().nullable(),
      description: z.string().max(300).optional().nullable(),
      ogImage: z.string().url().optional().nullable(),
    })
    .default({}),
})
export type BlogPostInput = z.infer<typeof blogPostInputSchema>

export const blogQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  tag: z.string().optional(),
  q: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(20).default(9),
})
export type BlogQuery = z.infer<typeof blogQuerySchema>
