import { useState } from 'react'
import { Seo } from '@/components/seo/Seo'
import { useAdminApi, adminRequest } from '@/hooks/useAdminApi'
import { LoadingState } from '@/components/ui/LoadingState'
import { formatDate } from '@/lib/utils'
import { ApiError } from '@/lib/apiClient'

interface MediaAsset {
  id: string
  path: string
  bucket: string
  url: string
  mime_type: string | null
  bytes: number | null
  width: number | null
  height: number | null
  alt: string | null
  uploaded_by: string | null
  created_at: string
}

export function AdminMedia() {
  const { data, status, refetch } = useAdminApi<{ items: MediaAsset[] }>('/admin/media')
  const items = data?.items ?? []
  const [deleting, setDeleting] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const destroy = async (id: string) => {
    if (!confirm('Remover este arquivo? Ele será apagado do storage e do registro.')) return
    setDeleting(id)
    try {
      await adminRequest(`/admin/media/${id}`, { method: 'DELETE' })
      refetch()
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Erro ao remover.')
    } finally {
      setDeleting(null)
    }
  }

  const copyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      // fallback para navegadores sem clipboard API
      const ta = document.createElement('textarea')
      ta.value = url
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const formatBytes = (b: number | null) => {
    if (!b) return '—'
    if (b < 1024) return `${b} B`
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
    return `${(b / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <>
      <Seo title="Mídia — Projeto Sete Admin" noindex />
      <h1 className="font-serif text-3xl text-paper">Mídia</h1>
      <p className="mt-2 text-mist">
        Todos os arquivos enviados via upload no painel administrativo.
      </p>

      {status === 'loading' && <LoadingState className="py-16" />}
      {status !== 'loading' && items.length === 0 && (
        <p className="py-16 text-center text-mist">Nenhum arquivo enviado ainda.</p>
      )}

      {items.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((asset) => (
            <div
              key={asset.id}
              className="group relative overflow-hidden card-line bg-graphite transition-colors hover:border-brass"
            >
              {/* Thumbnail */}
              <div className="aspect-square overflow-hidden bg-charcoal rounded-t-lg">
                {asset.mime_type?.startsWith('image/') ? (
                  <img
                    src={asset.url}
                    alt={asset.alt ?? ''}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-mist">
                    {asset.mime_type ?? 'arquivo'}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="space-y-1 p-3">
                <p className="truncate text-xs text-paper" title={asset.path.split('/').pop() ?? ''}>
                  {asset.path.split('/').pop()}
                </p>
                <p className="text-xs text-mist">
                  {asset.width && asset.height
                    ? `${asset.width}×${asset.height} · `
                    : ''}
                  {formatBytes(asset.bytes)}
                </p>
                <p className="text-xs text-mist">{formatDate(asset.created_at)}</p>
              </div>

              {/* Actions overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink/60 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => copyUrl(asset.url, asset.id)}
                  className="rounded border border-white/40 px-3 py-1.5 text-xs text-white transition-colors hover:border-white hover:bg-white/20"
                  title="Copiar URL"
                >
                  {copiedId === asset.id ? 'Copiado!' : 'Copiar URL'}
                </button>
                <button
                  onClick={() => destroy(asset.id)}
                  disabled={deleting === asset.id}
                  className="rounded border border-error/60 px-3 py-1.5 text-xs text-error transition-colors hover:border-error hover:bg-error/20 disabled:opacity-50"
                  title="Excluir"
                >
                  {deleting === asset.id ? '…' : 'Excluir'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
