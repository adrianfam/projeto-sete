/**
 * Envio de e-mail. Prioriza Resend (API simples) se RESEND_API_KEY setada;
 * basta trocar para nodemailer/SMTP se preferir. Mantém interface estável.
 */
interface SendMailInput {
  to: string
  subject: string
  html: string
  replyTo?: string
}

export async function sendMail(input: SendMailInput): Promise<{ ok: boolean; error?: string }> {
  const from = process.env.MAIL_FROM ?? 'contato@projetosete.com.br'

  // --- Resend (recomendado) ---
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: input.to,
          subject: input.subject,
          html: input.html,
          reply_to: input.replyTo,
        }),
      })
      if (!res.ok) {
        const text = await res.text()
        return { ok: false, error: `resend ${res.status}: ${text}` }
      }
      return { ok: true }
    } catch (e) {
      return { ok: false, error: String(e) }
    }
  }

  // --- SMTP via nodemailer: import dinâmico só se SMTP_HOST setado ---
  if (process.env.SMTP_HOST) {
    try {
      // nodemailer é uma dependência OPCIONAL — só instalada se SMTP em uso.
      const { createTransport } = await import('nodemailer')
      const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 465),
        secure: Number(process.env.SMTP_PORT ?? 465) === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      })
      await transporter.sendMail({
        from,
        to: input.to,
        subject: input.subject,
        html: input.html,
        replyTo: input.replyTo,
      })
      return { ok: true }
    } catch (e) {
      return { ok: false, error: String(e) }
    }
  }

  // Nenhum provedor configurado — loga e ignora (não derruba a request).
  // eslint-disable-next-line no-console
  console.warn('[mailer] Nem RESEND_API_KEY nem SMTP_HOST configurados. E-mail não enviado:', input.subject)
  return { ok: false, error: 'no-mailer-configured' }
}
