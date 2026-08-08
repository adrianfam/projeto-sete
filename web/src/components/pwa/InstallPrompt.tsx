import { useState } from 'react'
import { usePwaInstall } from '@/hooks/usePwa'
import { cn } from '@/lib/utils'

interface InstallPromptProps {
  /** 'dark' para fundos escuros (sidebar), 'light' para a página de login. */
  variant?: 'dark' | 'light'
  /** Versão compacta para a barra superior mobile. */
  compact?: boolean
  className?: string
}

export function InstallPrompt({ variant = 'dark', compact = false, className }: InstallPromptProps) {
  const { canInstall, installed, isIOS, promptInstall } = usePwaInstall()
  const [showIosHelp, setShowIosHelp] = useState(false)

  if (installed || (!canInstall && !isIOS)) return null

  const dark = variant === 'dark'

  const handleClick = async () => {
    if (canInstall) {
      await promptInstall()
    } else if (isIOS) {
      setShowIosHelp((v) => !v)
    }
  }

  return (
    <div className={cn(!compact && 'space-y-2', className)}>
      <button
        type="button"
        onClick={handleClick}
        aria-label="Instalar o aplicativo"
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all active:scale-[0.97]',
          compact ? 'px-3 py-1.5 text-xs' : 'w-full px-3 py-2.5 text-sm',
          dark
            ? 'border border-brass/30 bg-brass/10 text-brass-soft hover:bg-brass/20 hover:border-brass/50'
            : 'border border-mist/60 bg-white text-ink hover:border-brass hover:text-brass',
        )}
      >
        <svg
          width={compact ? 14 : 16}
          height={compact ? 14 : 16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        Instalar app
      </button>

      {showIosHelp && (
        <div
          className={cn(
            'rounded-lg px-3 py-2.5 text-xs leading-relaxed',
            dark ? 'bg-graphite text-mist' : 'border border-mist/40 bg-white text-smoke',
          )}
        >
          <p className={cn('mb-1.5 text-[13px] font-semibold', dark ? 'text-paper' : 'text-ink')}>
            Como instalar no iPhone:
          </p>
          <ol className="list-decimal list-inside space-y-1">
            <li>
              No Safari, toque em <strong>Compartilhar</strong>{' '}
              <span className="opacity-70">(ícone ↑)</span>
            </li>
            <li>
              Escolha <strong>Adicionar à Tela de Início</strong>
            </li>
            <li>
              Confirme em <strong>Adicionar</strong>
            </li>
          </ol>
        </div>
      )}
    </div>
  )
}
