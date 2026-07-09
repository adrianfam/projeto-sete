import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactInputSchema, brand } from '@projeto-sete/shared'
import { request, ApiError } from '@/lib/apiClient'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { ScrollReveal } from '@/components/ui/ScrollReveal'

type FormValues = {
  name: string
  email: string
  phone?: string | null
  subject?: string | null
  message: string
  website?: string
}

export function Contact() {
  const [sent, setSent] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(contactInputSchema as unknown as Parameters<typeof zodResolver>[0]),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '', website: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null)
    try {
      await request<{ ok: boolean }>('/contact', { method: 'POST', body: values })
      setSent(true)
      reset()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Não foi possível enviar. Tente novamente.'
      setSubmitError(msg)
    }
  }

  return (
    <Section id="contato" tone="dark">
      <Container>
        <SectionHeading
          eyebrow="Contato"
          title="Vamos conversar sobre o seu projeto."
          intro="Conte sua ideia. Respondemos em até um dia útil."
          align="center"
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Formulário premium */}
          <ScrollReveal>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="glass-card rounded-xl p-8 sm:p-10 space-y-6">
              {sent && (
                <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-4 text-sm text-success">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Mensagem recebida! Em breve entraremos em contato.
                </div>
              )}

              <Field label="Nome" htmlFor="name" error={errors.name?.message}>
                <input
                  id="name"
                  {...register('name')}
                  autoComplete="name"
                  className="w-full bg-transparent border-b border-white/10 px-0 py-3 text-paper outline-none transition-all duration-300 focus:border-brass placeholder:text-mist/30"
                  placeholder="Seu nome"
                />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    autoComplete="email"
                    className="w-full bg-transparent border-b border-white/10 px-0 py-3 text-paper outline-none transition-all duration-300 focus:border-brass placeholder:text-mist/30"
                    placeholder="seu@email.com"
                  />
                </Field>
                <Field label="Telefone (opcional)" htmlFor="phone" error={errors.phone?.message}>
                  <input
                    id="phone"
                    {...register('phone')}
                    autoComplete="tel"
                    className="w-full bg-transparent border-b border-white/10 px-0 py-3 text-paper outline-none transition-all duration-300 focus:border-brass placeholder:text-mist/30"
                    placeholder="(85) 99999-9999"
                  />
                </Field>
              </div>

              <Field label="Assunto (opcional)" htmlFor="subject" error={errors.subject?.message}>
                <input
                  id="subject"
                  {...register('subject')}
                  className="w-full bg-transparent border-b border-white/10 px-0 py-3 text-paper outline-none transition-all duration-300 focus:border-brass placeholder:text-mist/30"
                  placeholder="Como podemos ajudar?"
                />
              </Field>

              <Field label="Mensagem" htmlFor="message" error={errors.message?.message}>
                <textarea
                  id="message"
                  {...register('message')}
                  rows={4}
                  className="w-full bg-transparent border-b border-white/10 px-0 py-3 text-paper outline-none transition-all duration-300 focus:border-brass placeholder:text-mist/30 resize-none"
                  placeholder="Descreva seu projeto…"
                />
              </Field>

              <input
                {...register('website')}
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              {submitError && (
                <p className="text-sm text-error" role="alert">
                  {submitError}
                </p>
              )}

              <Button type="submit" variant="primary" disabled={isSubmitting} className="w-full">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-ink border-t-transparent animate-spin" />
                    Enviando…
                  </span>
                ) : (
                  'Enviar mensagem'
                )}
              </Button>
            </form>
          </ScrollReveal>

          {/* Info */}
          <ScrollReveal delay={0.1}>
            <aside className="space-y-6">
              <div className="glass-card rounded-xl p-8 sm:p-10">
                <span className="text-[10px] uppercase tracking-wider text-mist/50">Atendimento</span>
                <ul className="mt-6 space-y-5">
                  {[
                    { label: 'Endereço', value: brand.address.fullAddress },
                    {
                      label: 'Telefone',
                      value: (
                        <a href={`tel:${brand.contact.phoneRaw}`} className="hover:text-brass transition-colors">
                          {brand.contact.phone}
                        </a>
                      ),
                    },
                    {
                      label: 'E-mail',
                      value: (
                        <a href={`mailto:${brand.contact.email}`} className="hover:text-brass transition-colors">
                          {brand.contact.email}
                        </a>
                      ),
                    },
                    { label: 'Horário', value: 'Seg–Sex, 08h–17h' },
                  ].map(({ label, value }) => (
                    <li key={label} className="flex flex-col gap-1">
                      <span className="text-xs uppercase tracking-wider text-brass/70">{label}</span>
                      <span className="text-sm text-mist/80">{value}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 pt-6 border-t border-white/5">
                  <Button href={brand.contact.whatsappLink} target="_blank" rel="noopener" variant="outline" className="w-full">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2z" />
                    </svg>
                    Falar no WhatsApp
                  </Button>
                </div>
              </div>

              <MapEmbed />
            </aside>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  )
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-xs uppercase tracking-wider text-mist/50 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}

function MapEmbed() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined
  const q = encodeURIComponent(brand.address.mapsEmbedQuery)

  if (key) {
    return (
      <div className="aspect-[16/9] w-full overflow-hidden rounded-xl glass-card">
        <iframe
          title="Localização Projeto Sete"
          src={`https://www.google.com/maps/embed/v1/place?key=${key}&q=${q}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full"
        />
      </div>
    )
  }

  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${q}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center justify-center aspect-[16/9] rounded-xl glass-card p-6 text-center group"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-brass mb-3">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <p className="font-editorial text-lg text-paper">{brand.address.fullAddress}</p>
      <p className="mt-2 text-sm text-brass group-hover:underline">Abrir no Google Maps →</p>
    </a>
  )
}
