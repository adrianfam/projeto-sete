/**
 * E-mails transacionais do Portal do Cliente (Fase 4).
 * Todas as funções são BEST-EFFORT: nunca derrubam a request — logam e seguem.
 * Templates com HTML inline (compatível com Resend/SMTP).
 */
import { sendMail } from './mailer'
import { brand } from '@projeto-sete/shared'

const APP_URL = process.env.APP_URL ?? 'https://projeto-sete.vercel.app'

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function emailLayout(title: string, bodyHtml: string, cta?: { label: string; href: string }): string {
  const ctaHtml = cta
    ? `<p style="margin:28px 0 8px;text-align:center;">
         <a href="${escape(cta.href)}" style="background:#c9a45c;color:#141414;text-decoration:none;
           font-weight:600;padding:12px 28px;border-radius:8px;display:inline-block;">${escape(cta.label)}</a>
       </p>`
    : ''
  return `
  <div style="background:#f4f2ec;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6e2d8;">
      <div style="background:#141414;padding:24px 32px;">
        <p style="margin:0;color:#c9a45c;font-size:20px;font-weight:700;letter-spacing:0.5px;">
          Projeto <span style="color:#ffffff;">Sete</span>
        </p>
        <p style="margin:2px 0 0;color:#9b968c;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Móveis Planejados e Marcenaria</p>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 16px;color:#141414;font-size:22px;">${escape(title)}</h1>
        <div style="color:#3c3a36;font-size:14px;line-height:1.7;">${bodyHtml}</div>
        ${ctaHtml}
      </div>
      <div style="background:#f4f2ec;padding:16px 32px;color:#8a857c;font-size:11px;line-height:1.6;">
        <p style="margin:0;">${escape(brand.name)} · ${escape(brand.contact.phone)}</p>
        <p style="margin:4px 0 0;">Se não foi você que solicitou, ignore este e-mail.</p>
      </div>
    </div>
  </div>`
}

/** Envia e-mail transacional (best-effort, nunca lança). */
async function trySend(to: string, subject: string, html: string): Promise<void> {
  if (!to) return
  try {
    await sendMail({ to, subject, html })
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('[clientEmails] falha ao enviar', subject, e)
  }
}

// ---------------------------------------------------------------------------
// Conta criada / boas-vindas (cadastro completo no /cliente)
// ---------------------------------------------------------------------------
export function sendWelcomeEmail(client: { email?: string | null; full_name?: string | null }): void {
  if (!client.email) return
  const first = (client.full_name ?? '').split(' ')[0] || 'Olá'
  void trySend(
    client.email!,
    'Bem-vindo à sua área do cliente — Projeto Sete',
    emailLayout(
      'Seu espaço está pronto',
      `<p>${escape(first)}, ficamos felizes em ter você por aqui! 🏠</p>
       <p>Na sua área do cliente você acompanha:</p>
       <ul>
         <li>Orçamentos e o histórico dos seus pedidos;</li>
         <li>A linha do tempo do seu projeto (análise, fabricação, montagem…);</li>
         <li>Arquivos do projeto (PDFs, renders e manuais);</li>
         <li>Visitas técnicas agendadas pela nossa equipe.</li>
       </ul>
       <p>Fale com a gente pelo WhatsApp se precisar de qualquer coisa.</p>`,
      { label: 'Entrar na minha área', href: `${APP_URL}/cliente/login` },
    ),
  )
}

// ---------------------------------------------------------------------------
// Status do projeto mudou
// ---------------------------------------------------------------------------
export function sendProjectStatusEmail(
  client: { email?: string | null; full_name?: string | null },
  data: { projectTitle: string; statusLabel: string },
): void {
  if (!client.email) return
  const first = (client.full_name ?? '').split(' ')[0] || 'Olá'
  void trySend(
    client.email!,
    `Seu projeto "${data.projectTitle}" atualizado — Projeto Sete`,
    emailLayout(
      'Seu projeto avançou',
      `<p>${escape(first)}, o projeto <strong>${escape(data.projectTitle)}</strong> está agora em:</p>
       <p style="background:#f4f2ec;border:1px solid #e6e2d8;border-radius:8px;padding:14px 18px;color:#141414;font-size:15px;font-weight:600;">
         ${escape(data.statusLabel)}
       </p>
       <p>Acompanhe os detalhes e os próximos passos na sua área do cliente.</p>`,
      { label: 'Ver meu projeto', href: `${APP_URL}/cliente` },
    ),
  )
}

// ---------------------------------------------------------------------------
// Visita técnica agendada
// ---------------------------------------------------------------------------
export function sendVisitScheduledEmail(
  client: { email?: string | null; full_name?: string | null },
  data: { projectTitle: string; title: string; scheduledAt: string; professional: string; notes?: string | null },
): void {
  if (!client.email) return
  const first = (client.full_name ?? '').split(' ')[0] || 'Olá'
  const when = new Date(data.scheduledAt).toLocaleString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
  void trySend(
    client.email!,
    `Visita técnica agendada: ${data.title} — Projeto Sete`,
    emailLayout(
      'Visita técnica agendada',
      `<p>${escape(first)}, temos uma visita marcada para o seu projeto <strong>${escape(data.projectTitle)}</strong>:</p>
       <p style="background:#f4f2ec;border:1px solid #e6e2d8;border-radius:8px;padding:14px 18px;color:#141414;font-size:15px;">
         📅 <strong>${escape(data.title)}</strong><br>
         <span style="color:#3c3a36;">${escape(when)}</span><br>
         <span style="color:#3c3a36;">Com ${escape(data.professional)}</span>
         ${data.notes ? `<br><span style="color:#8a857c;">${escape(data.notes)}</span>` : ''}
       </p>
       <p>Se precisar remarcar, é só falar com a gente.</p>`,
      { label: 'Ver na minha área', href: `${APP_URL}/cliente` },
    ),
  )
}

// ---------------------------------------------------------------------------
// Acesso criado pelo admin (ativação por telefone/WhatsApp)
// ---------------------------------------------------------------------------
export function sendAccountAccessEmail(
  client: { email?: string | null; full_name?: string | null },
  data: { temporaryPassword: string },
): void {
  if (!client.email) return
  const first = (client.full_name ?? '').split(' ')[0] || 'Olá'
  void trySend(
    client.email,
    'Sua conta na área do cliente foi criada — Projeto Sete',
    emailLayout(
      'Sua conta está pronta',
      `<p>${escape(first)}, a equipe do Projeto Sete criou o seu acesso à área do cliente. 🎉</p>
       <p>Para entrar, use:</p>
       <p style="background:#f4f2ec;border:1px solid #e6e2d8;border-radius:8px;padding:14px 18px;color:#141414;">
         <strong>E-mail:</strong> ${escape(client.email)}<br>
         <strong>Senha temporária:</strong> <code style="background:#e6e2d8;padding:2px 6px;border-radius:4px;">${escape(data.temporaryPassword)}</code>
       </p>
       <p style="color:#8a857c;font-size:12px;">Recomendamos trocar a senha após o primeiro acesso.</p>`,
      { label: 'Entrar agora', href: `${APP_URL}/cliente/login` },
    ),
  )
}

/** Conta já existente (cliente criou a própria senha) — envia link de recuperação, nunca troca a senha. */
export function sendAccountRecoveryEmail(
  client: { email?: string | null; full_name?: string | null },
  data: { recoveryLink: string },
): void {
  if (!client.email) return
  const first = (client.full_name ?? '').split(' ')[0] || 'Olá'
  void trySend(
    client.email,
    'Recupere o acesso à sua área do cliente — Projeto Sete',
    emailLayout(
      'Acesso à área do cliente',
      `<p>${escape(first)}, sua conta na área do cliente já existe. 🎉</p>
       <p>Clique no botão abaixo para criar uma nova senha e entrar:</p>
       <p style="color:#8a857c;font-size:12px;">O link é válido por 1 hora. Se não foi você que pediu, ignore este e-mail.</p>`,
      { label: 'Criar senha e entrar', href: data.recoveryLink },
    ),
  )
}
