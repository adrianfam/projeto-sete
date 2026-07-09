// Declaração ambient para nodemailer (dependência opcional).
// Permite import dinâmico sem instalar o pacote em ambientes só-Resend.
declare module 'nodemailer' {
  export interface TransportOptions {
    host?: string
    port?: number
    secure?: boolean
    auth?: { user?: string; pass?: string }
  }
  export interface SendMailOptions {
    from?: string
    to: string
    subject?: string
    html?: string
    text?: string
    replyTo?: string
  }
  export interface Transporter {
    sendMail(opts: SendMailOptions): Promise<unknown>
  }
  export function createTransport(opts: TransportOptions): Transporter
}
