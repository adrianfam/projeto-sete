import type { FastifyPluginAsync } from 'fastify'
import { sendMail } from '../lib/mailer'
import { buildDailyMissingList, todayLabel } from '../lib/pontoAlerts'

const APP_URL = process.env.APP_URL ?? 'https://projeto-sete.vercel.app'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Cron diário (Vercel Cron — ver crons no vercel.json): verifica pendências
 * de ponto do dia e envia resumo por e-mail para ADMIN_NOTIFY_EMAIL.
 *
 * Aceita GET ou POST (o Vercel Cron usa GET). Se CRON_SECRET estiver setada,
 * exige `Authorization: Bearer <CRON_SECRET>` (o Vercel envia automaticamente).
 */
export const cronRoutes: FastifyPluginAsync = async (app) => {
  app.route({
    method: ['GET', 'POST'],
    url: '/cron/daily-points',
    handler: async (req, reply) => {
      const secret = process.env.CRON_SECRET
      if (secret && req.headers.authorization !== `Bearer ${secret}`) {
        return reply.code(401).send({ message: 'Não autorizado.' })
      }

      const missing = await buildDailyMissingList()
      const adminEmail = process.env.ADMIN_NOTIFY_EMAIL

      if (missing.length > 0 && adminEmail) {
        const rows = missing
          .map(
            (m) =>
              `<tr style="border-bottom:1px solid #e6e2d8;">
                 <td style="padding:8px 12px;color:#141414;font-weight:600;">${escapeHtml(m.name)}</td>
                 <td style="padding:8px 12px;color:#8a857c;">#${m.matricula}</td>
                 <td style="padding:8px 12px;color:#b45309;font-weight:600;">${m.issue}</td>
               </tr>`,
          )
          .join('')

        await sendMail({
          to: adminEmail,
          subject: `Ponto Eletrônico — ${missing.length} colaborador(es) com pendência hoje`,
          html: `
          <div style="background:#f4f2ec;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
            <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e2d8;">
              <div style="background:#141414;padding:24px 32px;">
                <p style="margin:0;color:#c9a45c;font-size:20px;font-weight:700;">
                  Projeto <span style="color:#ffffff;">Sete</span>
                </p>
                <p style="margin:2px 0 0;color:#9b968c;font-size:11px;text-transform:uppercase;letter-spacing:2px;">
                  Ponto Eletrônico — Alertas
                </p>
              </div>
              <div style="padding:32px;">
                <h1 style="margin:0 0 16px;color:#141414;font-size:22px;">Pendências de ponto — ${todayLabel()}</h1>
                <p style="color:#3c3a36;font-size:14px;line-height:1.7;margin:0 0 20px;">
                  Os colaboradores abaixo ainda não completaram o registro de hoje
                  (entrada e/ou saída). Confira e, se necessário, oriente a equipe.
                </p>
                <table style="width:100%;border-collapse:collapse;background:#ffffff;border:1px solid #e6e2d8;border-radius:8px;">
                  <thead>
                    <tr style="background:#f4f2ec;">
                      <th style="padding:8px 12px;text-align:left;color:#8a857c;font-size:11px;text-transform:uppercase;">Colaborador</th>
                      <th style="padding:8px 12px;text-align:left;color:#8a857c;font-size:11px;text-transform:uppercase;">Matrícula</th>
                      <th style="padding:8px 12px;text-align:left;color:#8a857c;font-size:11px;text-transform:uppercase;">Pendência</th>
                    </tr>
                  </thead>
                  <tbody>${rows}</tbody>
                </table>
                <p style="margin:28px 0 8px;text-align:center;">
                  <a href="${APP_URL}/admin/time-records"
                     style="background:#c9a45c;color:#141414;text-decoration:none;font-weight:600;
                            padding:12px 28px;border-radius:8px;display:inline-block;">
                    Ver registros no painel
                  </a>
                </p>
              </div>
              <div style="background:#f4f2ec;padding:16px 32px;color:#8a857c;font-size:11px;line-height:1.6;">
                <p style="margin:0;">Projeto Sete · Móveis Planejados e Marcenaria</p>
                <p style="margin:4px 0 0;">E-mail automático enviado diariamente. Se não esperava esta mensagem, ignore.</p>
              </div>
            </div>
          </div>`,
        })
      }

      return { ok: true, checkedAt: new Date().toISOString(), pendencies: missing.length }
    },
  })
}
