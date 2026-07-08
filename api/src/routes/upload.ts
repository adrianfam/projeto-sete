import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { adminGuard } from '../lib/auth'

/**
 * Emite uma URL pública/temporária para que o admin faça PUT direto no
 * Storage do Supabase (offloading de bytes da function). A chave
 * service-role fica apenas no servidor.
 */
export const uploadRoutes: FastifyPluginAsync = async (app) => {
  app.post<{ Body: { bucket?: string; path: string; contentType?: string; upsert?: boolean } }>(
    '/upload/sign',
    { preHandler: adminGuard },
    async (req, reply) => {
      const { bucket = 'media', path, contentType = 'image/jpeg', upsert = true } =
        (req.body as { bucket?: string; path?: string; contentType?: string; upsert?: boolean }) as {
          bucket?: string
          path?: string
          contentType?: string
          upsert?: boolean
        }

      if (!path) return reply.code(400).send({ message: 'path é obrigatório.' })

      const admin = getSupabaseAdmin()
      const { data, error } = await admin.storage
        .from(bucket)
        .createSignedUploadUrl(path)
      if (error || !data) return reply.code(500).send({ message: error?.message ?? 'Erro ao assinar upload.' })

      const { data: pub } = admin.storage.from(bucket).getPublicUrl(path)

      return {
        signedUrl: data.signedUrl,
        path: data.path,
        token: (data as unknown as { token?: string }).token ?? null,
        publicUrl: pub.publicUrl,
        contentType,
        upsert,
      }
    },
  )
}
