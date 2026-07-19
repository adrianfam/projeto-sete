import { useRef, useState } from 'react'
import { adminRequest } from '@/hooks/useAdminApi'

/**
 * Upload via /api/upload/sign (URL assinada) → PUT direto no Storage Supabase.
 * Retorna a publicUrl final. Funciona sem o componente, expondo `signAndUpload`.
 */
export async function signAndUpload(file: File): Promise<string> {
  const path = `uploads/${Date.now()}-${file.name.replace(/[^a-z0-9.\-_]/gi, '-')}`
  const sign = await adminRequest<{
    signedUrl: string
    publicUrl: string
    path: string
  }>('/upload/sign', { method: 'POST', body: { bucket: 'media', path, contentType: file.type } })

  const put = await fetch(sign.signedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!put.ok) throw new Error('Falha no upload da imagem.')
  return sign.publicUrl
}

export function MediaUploader({
  value,
  onChange,
  label = 'Imagem',
  compact = false,
}: {
  value: string | null | undefined
  onChange: (url: string) => void
  label?: string
  compact?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const handleFile = async (file?: File) => {
    if (!file) return
    setUploading(true)
    setErr(null)
    try {
      const url = await signAndUpload(file)
      onChange(url)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Erro no upload.')
    } finally {
      setUploading(false)
    }
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="shrink-0 whitespace-nowrap border border-mist/60 px-2 py-1 text-xs hover:border-brass disabled:opacity-50"
          title={value ? 'Trocar imagem' : 'Fazer upload'}
        >
          {uploading ? '…' : value ? 'Trocar' : 'Upload'}
        </button>
        {err && <span className="shrink-0 text-xs text-error" title={err}>Erro</span>}
      </div>
    )
  }

  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-eyebrow text-mist">{label}</label>
      <div className="flex items-center gap-3">
        {value && (
          <img
            src={value}
            alt=""
            className="h-16 w-16 shrink-0 rounded border border-graphite-light object-cover"
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded border border-graphite-light bg-graphite px-4 py-2 text-sm text-paper transition-colors hover:border-brass hover:bg-brass/10 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
              </svg>
              Enviando…
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              {value ? 'Trocar imagem' : 'Enviar imagem'}
            </>
          )}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-xs text-error hover:underline"
            title="Remover imagem"
          >
            Remover
          </button>
        )}
      </div>
      {err && (
        <p className="mt-2 text-xs text-error">{err}</p>
      )}
      {value && (
        <p className="mt-1.5 truncate text-[10px] text-mist">
          {value}
        </p>
      )}
    </div>
  )
}
