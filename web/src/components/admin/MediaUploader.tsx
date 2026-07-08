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
}: {
  value: string | null | undefined
  onChange: (url: string) => void
  label?: string
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

  return (
    <div>
      <label className="mb-2 block text-xs uppercase tracking-eyebrow text-smoke">{label}</label>
      <div className="flex items-center gap-3">
        {value && (
          <img
            src={value}
            alt=""
            className="h-16 w-16 shrink-0 border border-mist/60 object-cover"
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
          className="border border-mist/60 px-3 py-2 text-sm hover:border-brass disabled:opacity-50"
        >
          {uploading ? 'Enviando…' : value ? 'Trocar imagem' : 'Enviar imagem'}
        </button>
      </div>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="… ou cole uma URL"
        className="mt-2 w-full border border-mist/60 bg-paper px-3 py-2 text-sm outline-none focus:border-brass"
      />
      {err && <p className="mt-1 text-xs text-error">{err}</p>}
    </div>
  )
}
