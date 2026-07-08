import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactInputSchema, brand } from '@projeto-sete/shared'
import { request, ApiError } from '@/lib/apiClient'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'

type FormValues = {
  name: string
  email: string
  phone?: string | null
  subject?: string | null
  message: string
  website?: string // honeypot
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
    resolver: zodResolver(
      contactInputSchema as unknown as Parameters<typeof zodResolver>[0],
    ),
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
    <Section id="contato" tone="light">
      <Container>
        <SectionHeading
          eyebrow="Contato"
          title="Vamos conversar sobre o seu projeto."
          intro="Conte sua ideia. Respondemos em até um dia útil."
          align="center"
        />

        <div className="mt-14 grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {sent && (
              <div className="border border-success/40 bg-success/10 p-4 text-sm text-success">
                Mensagem recebida! Em breve entraremos em contato. Obrigado.
              </div>
            )}

            <Field label="Nome" error={errors.name?.message}>
              <input
                {...register('name')}
                autoComplete="name"
                className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
              />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="E-mail" error={errors.email?.message}>
                <input
                  type="email"
                  {...register('email')}
                  autoComplete="email"
                  className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
                />
              </Field>
              <Field label="Telefone (opcional)" error={errors.phone?.message}>
                <input
                  {...register('phone')}
                  autoComplete="tel"
                  className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
                />
              </Field>
            </div>

            <Field label="Assunto (opcional)" error={errors.subject?.message}>
              <input
                {...register('subject')}
                className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
              />
            </Field>

            <Field label="Mensagem" error={errors.message?.message}>
              <textarea
                {...register('message')}
                rows={5}
                className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
              />
            </Field>

            {/* Honeypot */}
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

            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando…' : 'Enviar mensagem'}
            </Button>
          </form>

          {/* Info + mapa */}
          <aside className="space-y-8">
            <div className="card-line bg-cream p-8">
              <p className="eyebrow">Atendimento</p>
              <ul className="mt-5 space-y-4 text-sm">
                <Row label="Endereço" value={brand.address.fullAddress} />
                <Row
                  label="Telefone"
                  value={
                    <a href={`tel:${brand.contact.phoneRaw}`} className="link-underline">
                      {brand.contact.phone}
                    </a>
                  }
                />
                <Row
                  label="E-mail"
                  value={
                    <a href={`mailto:${brand.contact.email}`} className="link-underline">
                      {brand.contact.email}
                    </a>
                  }
                />
                <Row label="Horário" value="Seg–Sex, 08h–17h" />
              </ul>

              <div className="mt-6">
                <Button href={brand.contact.whatsappLink} target="_blank" rel="noopener" variant="whatsapp">
                  Falar no WhatsApp
                </Button>
              </div>
            </div>

            <MapEmbed />
          </aside>
        </div>
      </Container>
    </Section>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-eyebrow text-smoke">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-1 sm:flex-row sm:gap-4">
      <span className="w-24 shrink-0 text-xs uppercase tracking-eyebrow text-brass">{label}</span>
      <span className="text-ink">{value}</span>
    </li>
  )
}

function MapEmbed() {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const q = encodeURIComponent(brand.address.mapsEmbedQuery)

  if (key) {
    return (
      <div className="aspect-[4/3] w-full overflow-hidden border border-mist/40">
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

  // Sem chave: link simples para o Maps.
  return (
    <a
      href={`https://www.google.com/maps/search/?api=1&query=${q}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block aspect-[4/3] w-full border border-mist/40 bg-cream p-6 text-center"
    >
      <p className="eyebrow">Mapa</p>
      <p className="mt-3 font-serif text-lg text-ink">{brand.address.fullAddress}</p>
      <p className="mt-2 text-sm text-brass">Abrir no Google Maps →</p>
    </a>
  )
}
