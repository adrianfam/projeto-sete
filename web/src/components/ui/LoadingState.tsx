import { cn } from '@/lib/utils'

export function LoadingState({ className, label = 'Carregando…' }: { className?: string; label?: string }) {
  return (
    <div className={cn('flex min-h-[40vh] items-center justify-center', className)} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-10 w-10">
          <span className="absolute inset-0 rounded-full border-2 border-white/10" />
          <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-brass animate-spin" />
        </div>
        <span className="text-sm text-mist/60">{label}</span>
      </div>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="glass-card rounded-lg overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-1/3 skeleton rounded" />
        <div className="h-5 w-3/4 skeleton rounded" />
        <div className="h-4 w-full skeleton rounded" />
        <div className="h-4 w-2/3 skeleton rounded" />
      </div>
    </div>
  )
}

export function SkeletonLine({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded h-4', className)} />
}
