import { usePwaUpdate } from '@/hooks/usePwa'

export function UpdateBanner() {
  const { updateAvailable, applyUpdate } = usePwaUpdate()

  if (!updateAvailable) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[70] p-4">
      <div
        role="status"
        className="mx-auto flex max-w-md items-center gap-3 rounded-xl border border-brass/40 bg-ink/95 px-4 py-3 shadow-modal backdrop-blur-sm"
      >
        <p className="flex-1 text-sm text-paper">
          🔄 Nova versão disponível. Atualize para continuar usando o app.
        </p>
        <button
          type="button"
          onClick={applyUpdate}
          className="shrink-0 rounded-lg bg-brass px-3.5 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-brass-soft"
        >
          Atualizar
        </button>
      </div>
    </div>
  )
}
