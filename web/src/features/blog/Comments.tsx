import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { commentInputSchema } from '@projeto-sete/shared'
import { request, ApiError } from '@/lib/apiClient'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'

type Comment = {
  id: string
  parent_id: string | null
  author_name: string
  body: string
  created_at: string
}

type FormValues = {
  authorName: string
  authorEmail: string
  body: string
  parentId?: string | null
  website?: string // honeypot
}

export function Comments({
  slug,
  comments,
  onChanged,
}: {
  slug: string
  comments: Comment[]
  onChanged: () => void
}) {
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(commentInputSchema as unknown as Parameters<typeof zodResolver>[0]),
    defaultValues: { authorName: '', authorEmail: '', body: '', parentId: null, website: '' },
  })

  const onSubmit = async (values: FormValues) => {
    setNote(null)
    try {
      await request<{ ok: boolean }>(`/blog/${slug}/comments`, {
        method: 'POST',
        body: { ...values, parentId: replyTo ?? null },
      })
      setNote('Seu comentário foi enviado e será exibido após a moderação. Obrigado!')
      reset()
      setReplyTo(null)
      onChanged()
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Não foi possível enviar o comentário.'
      setNote(msg)
    }
  }

  const startReply = (id: string) => {
    setReplyTo(id)
    setValue('parentId', id)
    setTimeout(() => {
      document.getElementById(`comment-form-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  const tree = buildTree(comments)

  return (
    <section aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="font-serif text-2xl">
        Comentários
      </h2>

      {tree.length === 0 && <p className="mt-4 text-sm text-smoke">Seja o primeiro a comentar.</p>}

      <ul className="mt-6 space-y-6">
        {tree.map((c) => (
          <li key={c.id}>
            <CommentNode node={c} onReply={startReply} />
          </li>
        ))}
      </ul>

      <div id="comment-form-null" className="mt-10">
        <h3 className="font-serif text-xl">{replyTo ? 'Responder' : 'Deixe seu comentário'}</h3>
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          id={`comment-form-${replyTo ?? 'null'}`}
          className="mt-4 space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" error={errors.authorName?.message}>
              <input
                {...register('authorName')}
                className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
              />
            </Field>
            <Field label="E-mail (não exibido)" error={errors.authorEmail?.message}>
              <input
                type="email"
                {...register('authorEmail')}
                className="w-full border border-mist/60 bg-paper px-4 py-3 outline-none focus:border-brass"
              />
            </Field>
          </div>
          <Field label="Comentário" error={errors.body?.message}>
            <textarea
              {...register('body')}
              rows={4}
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

          {replyTo && (
            <p className="text-xs text-smoke">
              Respondendo a um comentário.{' '}
              <button type="button" onClick={() => { setReplyTo(null); setValue('parentId', null) }} className="text-brass">
                Cancelar
              </button>
            </p>
          )}

          {note && <p className="text-sm text-smoke" role="status">{note}</p>}

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando…' : 'Enviar comentário'}
          </Button>
        </form>
      </div>
    </section>
  )
}

function CommentNode({ node, onReply }: { node: CommentNode_; onReply: (id: string) => void }) {
  return (
    <div className="border-l-2 border-brass/40 pl-4">
      <div className="flex items-baseline justify-between">
        <p className="font-medium text-ink">{node.author_name}</p>
        <p className="text-xs text-smoke">{formatDate(node.created_at)}</p>
      </div>
      <p className="mt-2 whitespace-pre-line text-sm text-smoke">{node.body}</p>
      <button onClick={() => onReply(node.id)} className="mt-2 text-xs text-brass link-underline">
        Responder
      </button>
      {node.children.length > 0 && (
        <ul className="mt-4 space-y-4">
          {node.children.map((c) => (
            <li key={c.id}>
              <CommentNode node={c} onReply={onReply} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

interface CommentNode_ extends Comment {
  children: CommentNode_[]
}
function buildTree(flat: Comment[]): CommentNode_[] {
  const map = new Map<string, CommentNode_>()
  flat.forEach((c) => map.set(c.id, { ...c, children: [] }))
  const roots: CommentNode_[] = []
  for (const c of map.values()) {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(c)
    } else {
      roots.push(c)
    }
  }
  return roots
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
