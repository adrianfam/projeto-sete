import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { supabaseConfigured } from '../lib/supabaseAdmin'

export const sitemapRoutes: FastifyPluginAsync = async (app) => {
  app.get('/sitemap.xml', async (_req, reply) => {
    reply.type('application/xml')
    const base = (process.env.APP_URL ?? 'https://projetosete.com.br').replace(/\/$/, '')

    let urls: { loc: string; lastmod?: string }[] = [
      { loc: `${base}/` },
      { loc: `${base}/sobre` },
      { loc: `${base}/contato` },
      { loc: `${base}/blog` },
      { loc: `${base}/portfolio` },
    ]

    if (supabaseConfigured()) {
      try {
        const sb = getSupabaseAdmin()
        const [blog, port, cases] = await Promise.all([
          sb.from('blog_posts').select('slug,updated_at').eq('is_published', true).is('deleted_at', null),
          sb.from('portfolio_items').select('slug,updated_at').eq('is_published', true).is('deleted_at', null),
          sb.from('case_studies').select('slug,updated_at').eq('is_published', true).is('deleted_at', null),
        ])
        const today = new Date().toISOString()
        urls = [
          ...urls,
          ...(blog.data ?? []).map((r) => ({ loc: `${base}/blog/${r.slug}`, lastmod: r.updated_at ?? today })),
          ...(port.data ?? []).map((r) => ({ loc: `${base}/portfolio/${r.slug}`, lastmod: r.updated_at ?? today })),
          ...(cases.data ?? []).map((r) => ({ loc: `${base}/cases/${r.slug}`, lastmod: r.updated_at ?? today })),
        ]
      } catch {
        // sem Supabase: só URLs estáticas
      }
    }

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls
        .map(
          (u) =>
            `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n` +
            (u.lastmod ? `    <lastmod>${u.lastmod}</lastmod>\n` : '') +
            `    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
        )
        .join('\n') +
      `\n</urlset>\n`

    return xml
  })
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
}
