import type { FastifyPluginAsync } from 'fastify'
import { getSupabaseAdmin } from '../lib/supabaseAdmin'
import { contactInputSchema } from '@projeto-sete/shared'
import { requireAuthed } from '../lib/clientAuth'
import { sendMail } from '../lib/mailer'
import { brand } from '@projeto-sete/shared'

export const contactRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    '/contact',
    { config: { rateLimit: { max: 5, timeWindow: '10 minutes' } } },
    async (req, reply) => {
      const body = req.body as Record<string, unknown>
      // Honeypot
      if (body.website && String(body.website).length > 0) {
        return reply.code(202).send({ ok: true })
      }

      const input = contactInputSchema.omit({ website: true }).parse({
        name: body.name,
        email: body.email,
        phone: body.phone ?? null,
        subject: body.subject ?? null,
        message: body.message,
      })

      const sb = getSupabaseAdmin()

      // Vincula ao perfil do cliente se houver sessão ativa (melhor esforço —
      // nunca derruba a submissão; o envio anônimo continua funcionando).
      let clientId: string | null = null
      if (req.headers.authorization?.startsWith('Bearer ')) {
        try {
          const authed = await requireAuthed(req)
          if (authed) {
            const { data: client } = await sb
              .from('clients')
              .select('id')
              .eq('auth_user_id', authed.userId)
              .maybeSingle()
            clientId = client?.id ?? null
          }
        } catch {
          clientId = null
        }
      }

      const { error } = await sb.from('contact_submissions').insert({
        name: input.name,
        email: input.email,
        phone: input.phone,
        subject: input.subject,
        message: input.message,
        client_id: clientId,
        ip: (req.ip ?? null) as never,
        user_agent: req.headers['user-agent'] ?? null,
        status: 'new',
      })
      if (error) return reply.code(500).send({ message: 'Não foi possível registrar sua mensagem.' })

      // Notifica o gestor por e-mail (melhor esforço — não derruba a request).
      const notify = process.env.ADMIN_NOTIFY_EMAIL ?? brand.contact.email
      void sendMail({
        to: notify,
        subject: input.subject ? `Contato — Projeto Sete: ${input.subject}` : 'Novo contato pelo site — Projeto Sete',
        replyTo: input.email,
        html: [
          `<p><strong>Nome:</strong> ${escape(input.name)}</p>`,
          `<p><strong>E-mail:</strong> ${escape(input.email)}</p>`,
          input.phone ? `<p><strong>Telefone:</strong> ${escape(input.phone)}</p>` : '',
          `<p><strong>Assunto:</strong> ${escape(input.subject ?? '—')}</p>`,
          '<p><strong>Mensagem:</strong></p>',
          `<p>${escape(input.message).replace(/\n/g, '<br>')}</p>`,
        ].join(''),
      })

      return reply.code(201).send({ ok: true, message: 'Mensagem recebida. Em breve entraremos em contato.' })
    },
  )
}

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
