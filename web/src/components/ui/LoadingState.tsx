import { cn } from '@/lib/utils'

export function LoadingState({ className, label = 'Carregando…' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex min-h-[40vh] items-center justify-center', className)} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-mist border-t-brass" />
        <span className="text-sm text-smoke">{label}</span>
      </div>
    </div>
  )
}
